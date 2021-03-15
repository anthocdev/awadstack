import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import path from "path";
require("dotenv").config(); //Env variables access

export default {
  migrations: {
    path: path.join(__dirname, "./migrations"),
    pattern: /^[\w-]+\d+\.[tj]s$/,
  },
  entities: [Post],
  dbName: process.env.DB_NAME,
  type: "postgresql",
  debug: !__prod__,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
} as Parameters<typeof MikroORM.init>[0];
