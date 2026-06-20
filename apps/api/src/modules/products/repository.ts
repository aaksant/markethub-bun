import {
  NewProduct,
  NewProductImage,
  Product,
  ProductImage,
  productImages,
  products,
  UpdateProduct
} from "@app/db/schema";
import {
  ICreatableRepository,
  IDeletableRepository,
  IReadableRepository,
  IUpdatableRepository
} from "../../core/contracts";
import {
  normalizePagination,
  paginate,
  PaginationParams,
  PaginationResult
} from "../../core/pagination";
import { db } from "@app/db/client";
import { and, asc, count, desc, eq, gte, ilike, lte, or } from "drizzle-orm";

export type ProductFilters = {
  sellerId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
};

export type ProductSortParams = {
  field?: "createdAt" | "updatedAt" | "price" | "name";
  order?: "asc" | "desc";
};

export type ProductQueryParams = {
  pagination: PaginationParams;
  filters?: ProductFilters;
  sort?: ProductSortParams;
};

export class ProductsRepository
  implements
    IReadableRepository<Product>,
    ICreatableRepository<NewProduct, Product>,
    IUpdatableRepository<UpdateProduct, Product>,
    IDeletableRepository
{
  async getById(id: string): Promise<Product | null> {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, id));

    return product ?? null;
  }

  async create(data: NewProduct): Promise<Product | undefined> {
    const [product] = await db.insert(products).values(data).returning();

    return product;
  }

  async update(id: string, data: UpdateProduct): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set(data)
      .where(eq(products.id, id))
      .returning();

    return product;
  }

  async delete(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getPage({
    pagination,
    filters,
    sort
  }: ProductQueryParams): Promise<PaginationResult<Product>> {
    const { page, limit, offset } = normalizePagination(pagination);

    const rawWhere = this.createWhereClause(filters || {});
    const where = rawWhere.length !== 0 ? and(...rawWhere) : undefined;
    const orderBy = this.createOrderByClause(
      sort || {
        field: "createdAt",
        order: "desc"
      }
    );

    const [rows, countRows] = await Promise.all([
      db
        .select()
        .from(products)
        .where(where)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(products).where(where)
    ]);
    const total = countRows[0]?.total ?? 0;

    return paginate(rows, total, page, limit);
  }

  private createWhereClause(filters: ProductFilters) {
    const conditions = [];

    if (filters.sellerId) {
      conditions.push(eq(products.sellerId, filters.sellerId));
    }
    // 0 is falsy
    if (filters.minPrice !== undefined && Number.isFinite(filters.minPrice)) {
      conditions.push(gte(products.price, filters.minPrice.toString()));
    }

    if (filters.maxPrice !== undefined && Number.isFinite(filters.maxPrice)) {
      conditions.push(lte(products.price, filters.maxPrice.toString()));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(products.name, `%${filters.search}%`),
          ilike(products.description, `%${filters.search}%`)
        )
      );
    }

    return conditions;
  }

  private createOrderByClause(sort?: ProductSortParams) {
    const field = sort?.field ?? "createdAt";
    const order = sort?.order ?? "desc";

    const sortFunction = order === "asc" ? asc : desc;

    switch (field) {
      case "name":
        return sortFunction(products.name);
      case "price":
        return sortFunction(products.price);
      case "updatedAt":
        return sortFunction(products.updatedAt);
      case "createdAt":
      default:
        return sortFunction(products.createdAt);
    }
  }
}

export class ProductImagesRepository
  implements
    ICreatableRepository<NewProductImage, ProductImage>,
    IDeletableRepository
{
  async getById(id: string): Promise<ProductImage | null> {
    const [image] = await db
      .select()
      .from(productImages)
      .where(eq(productImages.id, id));

    return image ?? null;
  }

  async getByProduct(productId: string): Promise<ProductImage[]> {
    return await db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, productId))
      .orderBy(productImages.order);
  }

  async create(data: NewProductImage): Promise<ProductImage | undefined> {
    const [image] = await db.insert(productImages).values(data).returning();

    return image;
  }

  async createMany(data: NewProductImage[]): Promise<ProductImage[]> {
    return db.insert(productImages).values(data);
  }

  async delete(id: string): Promise<void> {
    await db.delete(productImages).where(eq(productImages.id, id));
  }

  async deleteByProduct(productId: string): Promise<void> {
    await db
      .delete(productImages)
      .where(eq(productImages.productId, productId));
  }
}
