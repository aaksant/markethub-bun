import Elysia, { t } from "elysia";
import { userController } from "./controller";

const paginationQuery = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1 }))
});

const listQuery = t.Composite([
  paginationQuery,
  t.Object({
    role: t.Optional(t.Union([t.Literal("seller"), t.Literal("buyer")])),
    search: t.Optional(t.String()),
    field: t.Optional(
      t.Union([
        t.Literal("createdAt"),
        t.Literal("updatedAt"),
        t.Literal("name")
      ])
    ),
    order: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")]))
  })
]);

export const usersRoutes = new Elysia({ prefix: "/users" })
  .get("/:id", userController.getById, {
    params: t.Object({ id: t.String() })
  })
  .get("/", userController.list, {
    query: listQuery
  });
