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
  @Field(() => Int)
  id: number;
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

  @Query(() => [UserComment])
  async testComments(): Promise<UserComment[]> {
    return await UserComment.find({ relations: ["user"] });
  }

  /* Get all comments for specific movie */
  @Query(() => PaginatedComments)
  async comments(
    @Arg("movieId", () => Int) movieId: number,
    @Arg("limit", () => Int) limit: number,
    @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  ): Promise<PaginatedComments> {
    const realLimit = Math.min(50, limit);
    const extraLimit = realLimit + 1;
    const qb = getConnection()
      .getRepository(UserComment)
      .createQueryBuilder("comment")
      .where(`comment.movieId = ${movieId}`)
      .loadRelationCountAndMap("comment.likes", "comment.ratings", "rc", (qb) =>
        qb.where("rc.rating = true")
      )
      .loadRelationCountAndMap(
        "comment.dislikes",
        "comment.ratings",
        "rc",
        (qb) => qb.where("rc.rating = false")
      )
      .leftJoinAndSelect("comment.user", "user")
      .orderBy("comment.createdAt", "DESC")
      .take(extraLimit);

    if (cursor) {
      qb.where("comment.createdAt < :cursor", {
        cursor: new Date(parseInt(cursor)),
      });
    }

    const comments = await qb.getMany();

    console.log(comments);
    return {
      comments: comments.slice(0, realLimit),
      hasMore: comments.length === extraLimit,
      id: movieId,
    };
  }

  /* Return comment by id */
  @Query(() => UserComment, { nullable: true })
  commment(@Arg("id") id: number): Promise<UserComment | undefined> {
    return UserComment.findOne(id);
  }

  @Mutation(() => UserComment, { nullable: true })
  @UseMiddleware(isAuth)
  async createComment(
    @Arg("input") input: CommentInput,
    @Arg("movieId", () => Int) movieId: number,
    @Ctx() { req }: MyContext
  ): Promise<UserComment | undefined> {
    var newPostId;
    await UserComment.create({
      ...input,
      userId: req.session.userId,
      movieId,
    })
      .save()
      .then((x) => (newPostId = x.id));

    return UserComment.findOne({
      where: { id: newPostId },
      relations: ["user"],
    });
  }
}
