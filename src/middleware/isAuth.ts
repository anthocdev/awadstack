import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  console.log(context.req.session);
  if (!context.req.session.userId) {
    throw new Error("Not authenticated.");
  }

  return next();
};
