import { User } from "../entities/User";
import { MyContext } from "../types";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import argon2 from "argon2";
import { COOKIE_NAME } from "../constants";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    if (!req.session.userId) {
      return null;
    }

    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }
  /* Account Registration */
  @Mutation(() => UserResponse)
  async register(
    @Arg("authinfo") authinfo: UsernamePasswordInput,
    @Arg("avatarid", () => Int) avatarId: number,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    /*  Username length validation */
    if (authinfo.username.length <= 2) {
      return {
        errors: [
          {
            field: "username",
            message: "username too short, must be 3 or more letters",
          },
        ],
      };
    }

    /* Password length validation */
    if (authinfo.password.length <= 4) {
      return {
        errors: [
          {
            field: "password",
            message: "password too short, must be 5 or more letters",
          },
        ],
      };
    }
    const hashedPass = await argon2.hash(authinfo.password);
    const user = em.create(User, {
      username: authinfo.username,
      password: hashedPass,
      avatarId,
    });
    try {
      await em.persistAndFlush(user);
    } catch (err) {
      /* Duplicate username constraint */
      if (err.code === "23505") {
        return {
          errors: [
            {
              field: "username",
              message: "user already exists",
            },
          ],
        };
      }
    }

    req.session.userId = user.id;
    return { user };
  }

  /* Account Authentication */
  @Mutation(() => UserResponse)
  async login(
    @Arg("authinfo") authinfo: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: authinfo.username });

    /* User not found */
    if (!user) {
      return {
        errors: [
          {
            field: "username",
            message: "username does not exist",
          },
        ],
      };
    }
    /* Password Validation */
    const validPass = await argon2.verify(user.password, authinfo.password);
    if (!validPass) {
      return {
        errors: [
          {
            field: "overall",
            message: "invalid login info",
          },
        ],
      };
    }

    req.session.userId = user.id;
    /* No errors, returning user object */
    return { user };
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
