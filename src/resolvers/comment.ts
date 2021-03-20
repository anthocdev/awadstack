import { UserComment } from "../entities/Comment";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
  UseMiddleware,
} from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";

@InputType()
class CommentInput {
  @Field()
  body: string;
}

@Resolver()
export class CommentResolver {
  /* Returns all comments */
  @Query(() => [UserComment])
  async comments(): Promise<UserComment[]> {
    return UserComment.find();
  }

  /* Return comment by id */
  @Query(() => UserComment, { nullable: true })
  commment(@Arg("id") id: number): Promise<UserComment | undefined> {
    return UserComment.findOne(id);
  }

  @Mutation(() => UserComment)
  @UseMiddleware(isAuth)
  async createComment(
    @Arg("input") input: CommentInput,
    @Arg("movieId") movieId: number,
    @Ctx() { req }: MyContext
  ): Promise<UserComment> {
    return UserComment.create({
      ...input,
      creatorId: req.session.userId,
      movieId,
    }).save();
  }
}
