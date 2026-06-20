import { Elysia } from "elysia";
import cors from "@elysia/cors";
import { errorHandler } from "./core/errors/error-handler";
import { auth } from "./modules/auth/auth";
import { usersRoutes } from "./modules/users/routes";
import { productsRoutes } from "./modules/products/routes";

export const app = new Elysia()
  .use(cors())
  .use(errorHandler)
  // mount OpenAPI
  .all("/api/auth/*", async ({ request }) => {
    return auth.handler(request);
  })
  .group("/api", (app) => app.use(usersRoutes).use(productsRoutes))
  .listen(3001);

export type App = typeof app;

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
