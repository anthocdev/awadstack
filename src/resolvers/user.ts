import { User } from "../entities/User";
import { MyContext, NoticeType } from "../types";
import {
  Arg,
  Ctx,
  FieldResolver,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME, FORGOT_PASSWORD_PREFIX } from "../constants";
import { UsernamePasswordInput } from "./_inputTypes";
import { validateRegister } from "../utils/validateRegister";
import { sendEmail } from "../utils/sendEmail";
import { v4 } from "uuid";
import { getConnection } from "typeorm";
import { UserResponse } from "./_objectTypes";
const multiavatar = require("@multiavatar/multiavatar");

@Resolver(User)
export class UserResolver {
  // /* Getting comment/comments through data loader for user*/
  // @FieldResolver(() => Comment)
  // comments(@Root() movie: Movie, @Ctx() { userLoader }: MyContext) {
  //   return userLoader.load(movie.id);
  // }

  @FieldResolver(() => String)
  email(@Root() user: User, @Ctx() { req }: MyContext) {
    //Display user only their own e-mail
    if (req.session.userId === user.id) {
      return user.email;
    }

    return "";
  }

  @Mutation(() => UserResponse)
  async changePassword(
    @Arg("token") token: string,
    @Arg("newPassword") newPassword: string,
    @Ctx() { redis, req }: MyContext
  ): Promise<UserResponse> {
    if (newPassword.length <= 4) {
      return {
        fieldErrors: [
          {
            field: "newPassword",
            message: "length must be at least 5 letters/symbols",
          },
        ],
      };
    }

    const userId = await redis.get(FORGOT_PASSWORD_PREFIX + token);
    if (!userId) {
      return {
        fieldErrors: [
          {
            field: "token",
            message: "token expired",
          },
        ],
      };
    }

    const parsedUserId = parseInt(userId);
    const user = await User.findOne(parsedUserId);

    if (!user) {
      return {
        fieldErrors: [
          {
            field: "token",
            message: "user no longer exists",
          },
        ],
      };
    }

    User.update(
      { id: parsedUserId },
      { password: await argon2.hash(newPassword) }
    );
    //User auto logged in after change
    req.session.userId = user.id;
    req.session.accessLevel = user.accessLevel;
    redis.del(FORGOT_PASSWORD_PREFIX + token);
    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(
    @Arg("email") email: string,
    @Ctx() { redis }: MyContext
  ) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      //no e-mail in db, generic response.
      return true;
    }

    //Token string for password recovery
    const token = v4();
    await redis.set(
      FORGOT_PASSWORD_PREFIX + token,
      user.id,
      "ex",
      1000 * 60 * 60 * 24 * 3
    ); //Token valid for 3 days
    await sendEmail(
      email,
      "Password Recovery",
      `<a href="http://localhost:3000/change-password/${token}">Reset password</a>`
    );

    return true;
  }

  @Query(() => User, { nullable: true })
  async me(@Ctx() { req }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    // const qb = getConnection()
    //   .getRepository(User)
    //   .createQueryBuilder("user")
    //   .leftJoinAndSelect("user.comments", "comments")
    //   .where(`id = ${req.session.userId}`);

    // return await qb.getOne();
    return User.findOne(req.session.userId, { relations: ["comments"] });
  }

  /* Account Registration */
  @Mutation(() => UserResponse)
  async register(
    @Arg("authinfo") authinfo: UsernamePasswordInput,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const errors = validateRegister(authinfo);
    if (errors) {
      return { fieldErrors: errors };
    }

    const hashedPass = await argon2.hash(authinfo.password);

    let user;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          username: authinfo.username,
          password: hashedPass,
          email: authinfo.email,
          avatarSvg: multiavatar(authinfo.username),
        })
        .returning("*")
        .execute();
      user = result.raw[0];
    } catch (err) {
      /* Duplicate username constraint */
      if (err.code === "23505") {
        return {
          fieldErrors: [
            {
              field: "username",
              message: "user already exists",
            },
          ],
        };
      }
    }

    req.session.userId = user.id;
    req.session.accessLevel = user.accessLevel;
    return { user };
  }

  /* Account Authentication */
  @Mutation(() => UserResponse)
  async login(
    @Arg("usernameOrEmail") usernameOrEmail: string,
    @Arg("password") password: string,
    @Ctx() { req }: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne(
      usernameOrEmail.includes("@")
        ? { where: { email: usernameOrEmail } }
        : { where: { username: usernameOrEmail } }
    );

    /* User not found */
    if (!user) {
      return {
        fieldErrors: [
          {
            field: "usernameOrEmail",
            message: "username does not exist",
          },
        ],
      };
    }
    /* Password Validation */
    const validPass = await argon2.verify(user.password, password);
    if (!validPass) {
      return {
        alerts: [
          {
            type: NoticeType.Error,
            title: "Login Failed",
            message: "Invalid login info",
          },
        ],
      };
    }

    req.session.userId = user.id;
    req.session.accessLevel = user.accessLevel;

    console.log(req.session);
    /* No errors, returning user object */
    return {
      user,
      alerts: [
        {
          message: "Welcome back " + user.username,
          title: "Successful Login",
          type: NoticeType.Success,
        },
      ],
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise((resolve) =>
      req.session.destroy((err) => {
        res.clearCookie(COOKIE_NAME);
        if (err) {
          console.log(err);
          resolve(false);
          return;
        }

        resolve(true);
      })
    );
  }
}
