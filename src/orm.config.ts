import { __prod__ } from "./constants";
import { Movie } from "./entities/Movie";
import path from "path";
import { User } from "./entities/User";
import { UserComment } from "./entities/Comment";
import { ConnectionOptions } from "typeorm";
import { UserRating } from "./entities/UserRating";
require("dotenv").config(); //Env variables access

export default {
  type: "postgres",
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: true,
  synchronize: true,
  entities: [User, Movie, UserComment, UserRating],
  migrations: [path.join(__dirname, "./migrations/*")],
} as ConnectionOptions;
