import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import microConf from "./mikro-orm.config";

require("dotenv").config(); //Env variables access

const main = async () => {
  /*Establish DB connection */
  const orm = await MikroORM.init(microConf);
  /* Run Migrations */
  await orm.getMigrator().up();
  /* Create new Post */
  const post = orm.em.create(Post, { title: "test post" });
  await orm.em.persistAndFlush(post);
};

main();
