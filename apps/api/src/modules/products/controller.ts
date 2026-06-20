import {
  ProductsService,
  type CreateProductInput,
  type UpdateProductInput
} from "./service";

type AuthenticatedUser = {
  id: string;
};

type AuthenticatedRequest = {
  user: AuthenticatedUser;
};

const productsService = new ProductsService();

export const productsController = {
  async getById({ params }: { params: { id: string } }) {
    return await productsService.getById(params.id);
  },

  async list({
    query
  }: {
    query: {
      page?: number;
      limit?: number;
      sellerId?: string;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
      field?: "createdAt" | "updatedAt" | "price" | "name";
      order?: "asc" | "desc";
    };
  }) {
    const { page, limit, sellerId, search, minPrice, maxPrice, field, order } =
      query;

    return await productsService.list({
      pagination: {
        page: page ?? 1,
        limit: limit ?? 20
      },
      filters: {
        sellerId,
        search,
        minPrice,
        maxPrice
      },
      sort: { field, order }
    });
  },

  async listBySeller({
    params,
    query
  }: {
    params: { sellerId: string };
    query: { page?: number; limit?: number };
  }) {
    return await productsService.listBySeller(params.sellerId, {
      pagination: {
        page: query.page,
        limit: query.limit
      }
    });
  },

  async create({
    user,
    body
  }: AuthenticatedRequest & {
    body: CreateProductInput;
  }) {
    return await productsService.create(user.id, body);
  },

  async update({
    user,
    params,
    body
  }: AuthenticatedRequest & {
    params: { id: string };
    body: UpdateProductInput;
  }) {
    return await productsService.update(params.id, user.id, body);
  },

  async delete({
    user,
    params
  }: AuthenticatedRequest & {
    params: { id: string };
  }) {
    return await productsService.delete(params.id, user.id);
  },

  async addImages({
    user,
    params,
    body
  }: AuthenticatedRequest & {
    params: { id: string };
    body: { files: File[] };
  }) {
    return await productsService.addImages(params.id, user.id, body.files);
  },

  async deleteImage({
    user,
    params
  }: AuthenticatedRequest & {
    params: { id: string; imageId: string };
  }) {
    return await productsService.deleteImage(params.imageId, user.id);
  }
};
