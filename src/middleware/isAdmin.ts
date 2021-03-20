import { MyContext } from "../types";
import { MiddlewareFn } from "type-graphql";

export const isAdmin: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.req.session.userId) {
    throw new Error("Not authenticated.");
  }

  if (!(context.req.session.accessLevel === 1)) {
    throw new Error("You're not allowed to do this.");
  }

  return next();
};
