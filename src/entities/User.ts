import { OneToMany } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { UserComment } from "./Comment";

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

  @Field(() => Int)
  @Column()
  avatarId!: number;

  @Field()
  @Column({ unique: true })
  email!: string;
  //

  /* Can be empty (no comments)  */
  @Field(() => [UserComment], { nullable: true })
  @OneToMany(() => UserComment, (comment) => comment.user)
  comments: UserComment[];

  /* -1 = Banned / 0 = Regular User / 1 = Admin */
  @Field(() => Int)
  @Column({ type: "smallint", default: 0 })
  accessLevel: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;
}
