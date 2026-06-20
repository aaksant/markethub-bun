import { UserRole } from "@app/db/schema";
import { UsersService } from "./service";

const usersService = new UsersService();

export const userController = {
  async getById({ params }: { params: { id: string } }) {
    return await usersService.getById(params.id);
  },

  async list({
    query
  }: {
    query: {
      page?: number;
      limit?: number;
      role?: UserRole;
      search?: string;
      field?: "createdAt" | "updatedAt" | "name";
      order?: "asc" | "desc";
    };
  }) {
    const { page, limit, role, search, field, order } = query;

    return await usersService.list({
      pagination: {
        page: page ?? 1,
        limit: limit ?? 20
      },
      filters: { role, search },
      sort: { field, order }
    });
  }
};
