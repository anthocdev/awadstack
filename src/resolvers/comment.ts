import { UserComment } from "../entities/Comment";
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
  UseMiddleware,
} from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";

@InputType()
class CommentInput {
  @Field()
  body: string;
}

@ObjectType()
class PaginatedComments {
  @Field(() => [UserComment])
  comments: UserComment[];
  @Field()
  hasMore: boolean;
}

@Resolver()
export class CommentResolver {
  /* Returns all comments */
  // @Query(() => [UserComment])
  // async comments(): Promise<UserComment[]> {
  //   return UserComment.find();
  // }

  /* Get all comments */
  @Query(() => PaginatedComments)
  async comments(
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedComments> {
    const realLimit = Math.min(50, limit);
    const extraLimit = realLimit + 1;
    const qb = getConnection()
      .getRepository(UserComment)
      .createQueryBuilder("comment")
      .orderBy("comment.createdAt", "DESC")
      .take(extraLimit);

    if (cursor) {
      qb.where('"createdAt" < :cursor', { cursor: new Date(parseInt(cursor)) });
    }

    const comments = await qb.getMany();

    return {
      comments: comments.slice(0, realLimit),
      hasMore: comments.length === extraLimit,
    };
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
      userId: req.session.userId,
      movieId,
    }).save();
  }
}
