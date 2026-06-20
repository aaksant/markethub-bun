import Elysia, { t } from "elysia";
import { productsController } from "./controller";
import { authPlugin } from "../auth/plugin";

const paginationQuery = t.Object({
  page: t.Optional(t.Numeric({ minimum: 1 })),
  limit: t.Optional(t.Numeric({ minimum: 1 }))
});

const listQuery = t.Composite([
  paginationQuery,
  t.Object({
    sellerId: t.Optional(t.String()),
    search: t.Optional(t.String()),
    minPrice: t.Optional(t.Number({ minimum: 1 })),
    maxPrice: t.Optional(t.Number()),
    field: t.Optional(
      t.Union([
        t.Literal("createdAt"),
        t.Literal("updatedAt"),
        t.Literal("price"),
        t.Literal("name")
      ])
    ),
    order: t.Optional(t.Union([t.Literal("asc"), t.Literal("desc")]))
  })
]);

const createProductBody = t.Object({
  name: t.String({ minLength: 1, maxLength: 255 }),
  description: t.Optional(t.String()),
  price: t.Number({ minimum: 1 }),
  stock: t.Number({ minimum: 1 }),
  isActive: t.Optional(t.Boolean())
});

const updateProductBody = t.Object({
  name: t.Optional(t.String({ minLength: 1, maxLength: 255 })),
  description: t.Optional(t.String()),
  price: t.Optional(t.Number({ minimum: 1 })),
  stock: t.Optional(t.Number({ minimum: 1 })),
  isActive: t.Optional(t.Boolean())
});

export const productsRoutes = new Elysia({ prefix: "/products" })
  .use(authPlugin)
  .get("/:id", productsController.getById, {
    params: t.Object({ id: t.String() })
  })
  .get("/", productsController.list, {
    query: listQuery
  })
  .get("/by-seller/:sellerId", productsController.listBySeller, {
    params: t.Object({ sellerId: t.String() }),
    query: paginationQuery
  })
  .post("/", productsController.create, {
    auth: true,
    body: createProductBody
  })
  .patch("/:id", productsController.update, {
    auth: true,
    params: t.Object({ id: t.String() }),
    body: updateProductBody
  })
  .post("/:id/images", productsController.addImages, {
    auth: true,
    params: t.Object({ id: t.String() }),
    body: t.Object({
      files: t.Files({
        type: ["image/jpeg", "image/png", "image/webp"],
        maxSize: "25m",
        minItems: 1,
        maxItems: 10
      })
    })
  })
  .delete("/:id", productsController.delete, {
    auth: true,
    params: t.Object({ id: t.String() })
  })
  .delete("/:id/images/:imageId", productsController.deleteImage, {
    auth: true,
    params: t.Object({
      id: t.String(),
      imageId: t.String()
    })
  });
