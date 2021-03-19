import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Movie } from "./entities/Movie";
import path from "path";
import { User } from "./entities/User";
require("dotenv").config(); //Env variables access

export default {
  type: "postgres",
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: true,
  synchronize: true,
  entities: [User, Movie],
} as any;
