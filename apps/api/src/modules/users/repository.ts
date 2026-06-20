import { User, UserRole, users } from "@app/db/schema";
import {
  normalizePagination,
  paginate,
  PaginationParams,
  PaginationResult
} from "../../core/pagination";
import { IReadableRepository } from "../../core/contracts";
import { db } from "@app/db/client";
import { and, asc, count, desc, eq, ilike, or } from "drizzle-orm";

export type UserFilters = {
  role?: UserRole;
  search?: string;
};

export type UserSortParams = {
  field?: "createdAt" | "updatedAt" | "name";
  order?: "asc" | "desc";
};

export type UserQueryParams = {
  pagination: PaginationParams;
  filters?: UserFilters;
  sort?: UserSortParams;
};

export class UsersRepository implements IReadableRepository<User> {
  async getById(id: string): Promise<User | null> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user ?? null;
  }

  async getPage({
    pagination,
    filters,
    sort
  }: UserQueryParams): Promise<PaginationResult<User>> {
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
        .from(users)
        .where(where)
        .orderBy(orderBy)
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(users).where(where)
    ]);
    const total = countRows[0]?.total ?? 0;

    return paginate(rows, total, page, limit);
  }

  private createWhereClause(filters: UserFilters) {
    const conditions = [];

    if (filters.role) {
      conditions.push(eq(users.role, filters.role));
    }
    if (filters.search) {
      conditions.push(
        or(
          ilike(users.name, `%${filters.search}`),
          ilike(users.email, `%${filters.search}`)
        )
      );
    }

    return conditions;
  }

  private createOrderByClause(sort?: UserSortParams) {
    const field = sort?.field ?? "createdAt";
    const order = sort?.order ?? "desc";

    const sortFunction = order === "asc" ? asc : desc;

    switch (field) {
      case "name":
        return sortFunction(users.name);
      case "createdAt":
        return sortFunction(users.createdAt);
      case "updatedAt":
        return sortFunction(users.updatedAt);
      default:
        return sortFunction(users.createdAt);
    }
  }
}
