import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Movie } from "./Movie";
import { User } from "./User";
import { UserRating } from "./UserRating";

@ObjectType()
@Entity()
export class UserComment extends BaseEntity {
  @Field()
  @PrimaryGeneratedColumn()
  id!: number;

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;

  @Field()
  @Column()
  body!: string;

  /* Mapping to ratings True count */
  @Field({ defaultValue: 0 })
  likes: number;
  /* Mapping to ratings False count  */
  @Field({ defaultValue: 0 })
  dislikes: number;

  @Field()
  @Column()
  userId!: number;

  @Field()
  @Column()
  movieId!: number;

  /* Comment OP */
  @ManyToOne(() => User, (user) => user.comments)
  @Field()
  user: User;

  /* Movie containing the comment */
  @ManyToOne(() => Movie, (movie) => movie.comments)
  @Field(() => Movie)
  movie: Movie;

  /* Ratings applied to the comment */
  // @Field(() => [UserRating], { nullable: true }) Not directly exposing right now.
  @OneToMany(() => UserRating, (rating) => rating.comment, {
    onDelete: "CASCADE",
  })
  ratings: UserRating[];
}
