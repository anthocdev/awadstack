import { UserComment } from "../entities/Comment";
import { Field, Int, ObjectType } from "type-graphql";
import { Movie } from "../entities/Movie";
import { User } from "../entities/User";
import { NoticeType } from "../types";

/* General */
@ObjectType()
export class FieldError {
  @Field()
  field: string;
  @Field()
  message: string;
}

@ObjectType()
export class ResAlert {
  @Field()
  type: NoticeType;
  @Field()
  title: string;
  @Field()
  message: string;
}

/* User Related */
@ObjectType()
export class UserResponse {
  /* Field specific errors */
  @Field(() => [FieldError], { nullable: true })
  fieldErrors?: FieldError[];

  /* Alerts for info/error/success/warning */
  @Field(() => [ResAlert], { nullable: true })
  alerts?: ResAlert[];

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
