import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import microConf from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";

require("dotenv").config(); //Env variables access

const main = async () => {
  /*Establish DB connection */
  const orm = await MikroORM.init(microConf);
  /* Run Migrations */
  await orm.getMigrator().up();
  /* Server Set-Up */
  const app = express();
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver],
      validate: false,
    }),
  });

  apolloServer.applyMiddleware({ app });

  app.get("/", (req, res) => {
    res.send("Server UP");
  });
  app.listen(process.env.EXPRESS_PORT, () => {
    console.log(
      "Express server is UP on http://localhost:" +
        process.env.EXPRESS_PORT +
        "/graphql"
    );
  });
};

main();
