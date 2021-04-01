import { Field, InputType } from "type-graphql";

/* User Related */
@InputType()
export class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
  @Field()
  email: string;
}

/* Comments Related */
@InputType()
export class CommentInput {
  @Field()
  body: string;
}
