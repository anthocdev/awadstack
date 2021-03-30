import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserComment } from "./Comment";
import { UserRating } from "./UserRating";

@ObjectType()
@Entity()
export class User extends BaseEntity {
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
  avatarSvg!: string;

  @Field()
  @Column({ unique: true })
  email!: string;
  //

  /* -1 = Banned / 0 = Regular User / 1 = Admin */
  @Field(() => Int)
  @Column({ type: "smallint", default: 0 })
  accessLevel: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  /* Can be empty (no comments)  */
  @Field(() => [UserComment], { nullable: true })
  @OneToMany(() => UserComment, (comment) => comment.user)
  comments: UserComment[];

  /* Likes/Dislikes from user */
  @Field(() => [UserRating], { nullable: true })
  @OneToMany(() => UserRating, (rating) => rating.voter)
  ratings: UserRating[];
}
