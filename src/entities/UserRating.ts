import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserComment } from "./Comment";
import { User } from "./User";

@ObjectType()
@Entity()
export class UserRating extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  /* Comment the rating is applied to */
  @Field()
  @Column()
  commentId!: number;

  /* User who liked/disliked */
  @Field()
  @Column()
  voterId!: number;

  /* Like (T) or Dislike (F) */
  @Field()
  @Column()
  rating!: Boolean;

  @ManyToOne(() => User, (user) => user.ratings)
  voter: User;

  @Field(() => UserComment)
  @ManyToOne(() => UserComment, (comment) => comment.ratings)
  comment: UserComment;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
