import DataLoader from "dataloader";
import { User } from "../entities/User";

/* Get user/users in a single query */
export const createUserLoader = () =>
  new DataLoader<number, User>(async (userIds) => {
    const users = await User.findByIds(userIds as number[]);
    const userIdToUser: Record<number, User> = {};

    users.forEach((u) => {
      userIdToUser[u.id] = u;
    });

    return userIds.map((userId) => userIdToUser[userId]);
  });

/* Works, but not efficient */
// export const createRatingLoader = () =>
//   new DataLoader<number, UserComment | null>(async (keys) => {
//     const ratings = await getConnection()
//       .getRepository(UserComment)
//       .createQueryBuilder("comment")
//       .where("comment.id IN (:...commentIds)", {
//         commentIds: keys,
//       })
//       .loadRelationCountAndMap("comment.likes", "comment.ratings", "rc", (qb) =>
//         qb.where("rc.rating = true")
//       )
//       .loadRelationCountAndMap(
//         "comment.dislikes",
//         "comment.ratings",
//         "rc",
//         (qb) => qb.where("rc.rating = false")
//       )
//       .getMany();
//     const commentIdsToRating: Record<number, UserComment> = {};

//     ratings.forEach((comment) => {
//       commentIdsToRating[comment.id] = comment;
//       console.log(comment);
//     });

//     console.log("this is the ratings", ratings);

//     return keys.map((key) => commentIdsToRating[key]);
//   });
