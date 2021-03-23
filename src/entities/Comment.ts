import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Movie } from "./Movie";
import { User } from "./User";

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

  @Field()
  @Column({ type: "int", default: 0 })
  likes!: number;

  @Field()
  @Column({ type: "int", default: 0 })
  dislikes!: number;

  @Field()
  @Column()
  userId: number;

  @Field()
  @Column()
  movieId: number;

  @ManyToOne(() => User, (user) => user.comments)
  @Field()
  @JoinColumn()
  user: User;

  @ManyToOne(() => Movie, (movie) => movie.comments)
  movie: Movie;
}
