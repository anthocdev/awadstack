import { UserComment } from "../entities/Comment";
import { Field, Int, ObjectType } from "type-graphql";
import { Movie } from "../entities/Movie";
import { User } from "../entities/User";

/* General */
@ObjectType()
export class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

/* User Related */
@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[];

  @Field(() => User, { nullable: true })
  user?: User;
}

/* Movie Related */

@ObjectType()
export class PaginatedMovies {
  @Field(() => [Movie])
  movies: Movie[];
  @Field()
  hasMore: boolean;
}

/* Comments Related */
@ObjectType()
export class PaginatedComments {
  @Field(() => [UserComment])
  comments: UserComment[];
  @Field(() => Int)
  id: number;
  @Field()
  hasMore: boolean;
}

@ObjectType()
export class CommentResponse {
  @Field(() => UserComment, { nullable: true })
  updatedComment?: UserComment;
  @Field(() => Boolean, { nullable: true })
  error?: boolean;
}

/* Rating Related */

@ObjectType()
export class RatingResponse {
  @Field(() => UserComment, { nullable: true })
  updatedComment?: UserComment;
  @Field(() => Boolean, { nullable: true })
  error?: boolean;
}
