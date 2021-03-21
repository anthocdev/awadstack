import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@ObjectType()
@Entity()
export class Movie extends BaseEntity {
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
  title!: string;

  @Field()
  @Column()
  year!: number;

  @Field()
  @Column()
  genre!: string;

  @Field()
  @Column("decimal", { precision: 5, scale: 2 })
  rating!: number;

  @Field()
  @Column({ unique: true })
  imdbId!: string;

  @Field()
  @Column()
  imageLink: string;
}
