import { UserComment } from "../entities/Comment";
import {
  Arg,
  Ctx,
  FieldResolver,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
  UseMiddleware,
} from "type-graphql";
import { MyContext, NoticeType } from "../types";
import { isAuth } from "../middleware/isAuth";
import { getConnection } from "typeorm";
import { PaginatedComments, CommentResponse } from "./_objectTypes";
import { CommentInput } from "./_inputTypes";
import { User } from "../entities/User";

@Resolver(UserComment)
export class CommentResolver {
  /* Getting user through data loader */
  @FieldResolver(() => User)
  user(@Root() comment: UserComment, @Ctx() { userLoader }: MyContext) {
    return userLoader.load(comment.userId);
  }

  /* @Todo: Better way to resolve likes/dislikes */
  // @FieldResolver(() => Int, { nullable: true })
  // likes(@Root() comment: UserComment, @Ctx() { ratingLoader }: MyContext) {
  //   return ratingLoader.load(comment.id);
  // }

  /* Get all comments for specific movie */
  // @Query(() => PaginatedComments)
  // async comments(
  //   @Arg("movieId", () => Int) movieId: number,
  //   @Arg("limit", () => Int) limit: number,
  //   @Arg("cursor", () => String, { nullable: true }) cursor: string | null
  // ): Promise<PaginatedComments> {
  //   const realLimit = Math.min(50, limit);
  //   const extraLimit = realLimit + 1;
  //   const qb = getConnection()
  //     .getRepository(UserComment)
  //     .createQueryBuilder("comment")
  //     .where(`comment.movieId = ${movieId}`)
  //     .loadRelationCountAndMap("comment.likes", "comment.ratings", "rc", (qb) =>
  //       qb.where("rc.rating = true")
  //     )
  //     .loadRelationCountAndMap(
  //       "comment.dislikes",
  //       "comment.ratings",
  //       "rc",
  //       (qb) => qb.where("rc.rating = false")
  //     )
  //     .leftJoinAndSelect("comment.user", "user")
  //     .orderBy("comment.createdAt", "DESC")
  //     .take(extraLimit);

  //   if (cursor) {
  //     qb.where("comment.createdAt < :cursor", {
  //       cursor: new Date(parseInt(cursor)),
  //     });
  //   }

  //   const comments = await qb.getMany();

  //   console.log(comments);
  //   return {
  //     comments: comments.slice(0, realLimit),
  //     hasMore: comments.length === extraLimit,
  //     id: movieId,
  //   };
  // }

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
    @Arg("input", () => CommentInput) input: CommentInput,
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
    });
  }
  /* Update Comment */
  @Mutation(() => CommentResponse)
  @UseMiddleware(isAuth)
  async updateComment(
    @Arg("commentId", () => Int) commentId: number,
    @Arg("input", () => CommentInput) input: CommentInput,
    @Ctx() { req }: MyContext
  ): Promise<CommentResponse> {
    /* Check for invalid body */
    if (input.body.length < 15) {
      return {
        alerts: [
          {
            title: "Too Short",
            message: "Comment must be longer than 15 letters.",
            type: NoticeType.Error,
          },
        ],
      };
    }
    /* Look for the comment that matches both id and user ID (ensure privilege to edit) */
    const comment = await UserComment.findOne({
      id: commentId,
      userId: req.session.userId,
    });

    if (!comment) {
      return {
        alerts: [
          {
            title: "Invalid Comment",
            message: "Comment you're trying to fetch does not exist.",
            type: NoticeType.Error,
          },
        ],
      };
    }

    if (typeof input !== "undefined") {
      /* Double checking userID (might be unecessary)*/
      await UserComment.update(
        { id: commentId, userId: req.session.userId },
        { body: input.body }
      );
    } else {
      return {
        alerts: [
          {
            title: "Invalid content",
            type: NoticeType.Error,
            message: "Can't have an empty comment",
          },
        ],
      };
    }

    /* Returning updated comment with likes/dislikes */
    const updatedComment = await getConnection()
      .getRepository(UserComment)
      .createQueryBuilder("comment")
      .where(`comment.id = ${commentId}`)
      .loadRelationCountAndMap("comment.likes", "comment.ratings", "rc", (qb) =>
        qb.where("rc.rating = true")
      )
      .loadRelationCountAndMap(
        "comment.dislikes",
        "comment.ratings",
        "rc",
        (qb) => qb.where("rc.rating = false")
      )
      .getOne();

    return { updatedComment };
  }

  /* Delete Comment */
  @Mutation(() => Boolean)
  @UseMiddleware(isAuth)
  async deleteComment(
    @Arg("commentId", () => Int) commentId: number,
    @Ctx() { req }: MyContext
  ): Promise<boolean> {
    try {
      /* Deleting comment that matches both id and user id within session (to check privilege) */
      const affected = await (
        await UserComment.delete({ id: commentId, userId: req.session.userId })
      ).affected;
      /* Invalid ID or user trying to delete someone else's comment */
      if (!affected) {
        return false;
      }
    } catch {
      return false;
    }

    return true;
  }
}
