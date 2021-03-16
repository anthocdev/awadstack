import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
import microConf from "./mikro-orm.config";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from "redis";
import session from "express-session";
import connectRedis from "connect-redis";
import { MyContext } from "./types";

/* Custom session data */
declare module "express-session" {
  interface Session {
    userId: number;
  }
}

require("dotenv").config(); //Env variables access

const main = async () => {
  /*Establish DB connection */
  const orm = await MikroORM.init(microConf);
  /* Run Migrations */
  await orm.getMigrator().up();
  /* Server Set-Up */
  const app = express();

  /* Redis Client + Express Session */
  let RedisStore = connectRedis(session);
  let redisClient = redis.createClient();

  app.use(
    session({
      name: "sessid",
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, //10 Years
        httpOnly: true,
        sameSite: "lax", //CSRF
        secure: __prod__, //HTTPS in prod
      },
      saveUninitialized: false,
      secret: process.env.SESSION_SECRET!,
      resave: false,
    })
  );
  /* Apollo Server */
  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false,
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res }),
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
