import { Product, ProductImage } from "@app/db/schema";
import { FilesService, MAX_PRODUCT_IMAGES } from "../files/service";
import {
  ProductImagesRepository,
  ProductQueryParams,
  ProductsRepository
} from "./repository";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError
} from "../../core/errors/error-types";
import { PaginationResult } from "../../core/pagination";
import { UploadResult } from "../files/repository";

export type CreateProductInput = {
  name: string;
  description?: string;
  price: number;
  stock: number;
  isActive?: boolean;
};

export type UpdateProductInput = Partial<CreateProductInput>;

export class ProductsService {
  private readonly productsRepo = new ProductsRepository();
  private readonly productImagesRepo = new ProductImagesRepository();
  private readonly filesService = new FilesService();

  async getById(id: string): Promise<Product> {
    const product = await this.productsRepo.getById(id);
    if (!product) {
      throw new NotFoundError("Product", id);
    }

    return product;
  }

  async list(params: ProductQueryParams): Promise<PaginationResult<Product>> {
    return await this.productsRepo.getPage(params);
  }

  async listBySeller(
    sellerId: string,
    params: ProductQueryParams
  ): Promise<PaginationResult<Product>> {
    return await this.productsRepo.getPage({
      ...params,
      filters: { sellerId }
    });
  }

  async create(sellerId: string, data: CreateProductInput) {
    return await this.productsRepo.create({
      ...data,
      sellerId,
      price: data.price.toString()
    });
  }

  async update(
    id: string,
    sellerId: string,
    data: UpdateProductInput
  ): Promise<Product | undefined> {
    const product = await this.getById(id);
    this.assertOwnership(product, sellerId);

    const updated = await this.productsRepo.update(id, {
      ...data,
      price: data.price?.toString()
    });
    if (!updated) {
      throw new NotFoundError("Product", id);
    }

    return updated;
  }

  async delete(id: string, sellerId: string): Promise<void> {
    const product = await this.getById(id);
    this.assertOwnership(product, sellerId);

    const images = await this.productImagesRepo.getByProduct(id);

    await this.filesService.delete(
      "product-images",
      images.map((image) => image.storagePath)
    );
    await this.productImagesRepo.deleteByProduct(id);
    await this.productsRepo.delete(id);
  }

  async addImages(
    productId: string,
    sellerId: string,
    files: File[]
  ): Promise<ProductImage[]> {
    const product = await this.getById(productId);
    this.assertOwnership(product, sellerId);

    const existingImages = await this.productImagesRepo.getByProduct(productId);
    if (existingImages.length + files.length > MAX_PRODUCT_IMAGES) {
      throw new BadRequestError(`Maximum ${MAX_PRODUCT_IMAGES} images allowed`);
    }

    const startOrder = existingImages.length;

    const results = await this.filesService.uploadMany({
      bucket: "product-images",
      files: files.map((file) => ({
        file,
        path: this.filesService.createStoragePath(productId, file)
      }))
    });

    const uploads = files
      .map((file, i) => ({ file, result: results[i] }))
      .filter(
        (entry): entry is { file: File; result: UploadResult } =>
          entry.result !== undefined
      );

    return this.productImagesRepo.createMany(
      uploads.map(({ file, result }, i) => ({
        productId,
        uploadedBy: sellerId,
        storagePath: result.path,
        mimeType: file.type,
        size: file.size,
        order: startOrder + i
      }))
    );
  }

  async deleteImage(imageId: string, sellerId: string): Promise<void> {
    const image = await this.productImagesRepo.getById(imageId);
    if (!image) {
      throw new NotFoundError("Image", imageId);
    }

    const product = await this.getById(image.productId);
    this.assertOwnership(product, sellerId);

    await this.filesService.delete("product-images", image.storagePath);
    await this.productImagesRepo.delete(imageId);
  }

  private assertOwnership(product: Product, sellerId: string): void {
    if (product.sellerId !== sellerId) {
      throw new ForbiddenError("Seller does not own this product");
    }
  }
}
