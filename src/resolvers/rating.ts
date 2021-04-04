import { Arg, Ctx, Int, Mutation, Resolver, UseMiddleware } from "type-graphql";
import { MyContext } from "../types";
import { isAuth } from "../middleware/isAuth";
import { UserRating } from "../entities/UserRating";
import { getConnection } from "typeorm";
import { UserComment } from "../entities/Comment";
import { RatingResponse } from "./_objectTypes";

@Resolver(UserRating)
export class RatingResolver {
  @Mutation(() => RatingResponse)
  @UseMiddleware(isAuth)
  async leaveRating(
    @Arg("isLike") isLike: boolean,
    @Arg("commentId", () => Int) commentId: number,
    @Ctx() { req }: MyContext
  ): Promise<RatingResponse> {
    try {
      const { userId } = req.session;
      /* Check if rating has been left before */
      const ratingHistory = await UserRating.findOne({
        where: { commentId, voterId: userId },
      });

      /* Creating new Like/Dislike */
      if (!ratingHistory) {
        await UserRating.create({
          rating: isLike,
          commentId,
          voterId: userId,
        }).save();
        /*Liking/Disliking again Undoes the rating */
      } else if (ratingHistory && ratingHistory.rating === isLike) {
        await ratingHistory.remove();
        /* Updating existing Like/Dislike (User changed vote) */
      } else if (ratingHistory && ratingHistory.rating !== isLike) {
        await getConnection()
          .createQueryBuilder()
          .update(UserRating)
          .set({ rating: isLike })
          .where("id = :id", { id: ratingHistory.id })
          .execute();
      }
    } catch (e) {
      return {
        error: true,
      };
    }

    //@Todo: reduce number of queries
    /* Call likes/dislikes for updated comment */
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
}
