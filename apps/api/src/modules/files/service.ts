import { BadRequestError } from "../../core/errors/error-types";
import {
  FileRepository,
  type StorageBucket,
  type UploadManyOptions,
  type UploadOptions,
  type UploadResult
} from "./repository";

type BucketConfig = {
  maxSize: number;
  allowedMimeTypes: string[];
};

const bucketConfig: Record<StorageBucket, BucketConfig> = {
  avatars: {
    maxSize: 5 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"]
  },
  "product-images": {
    maxSize: 20 * 1024 * 1024,
    allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"]
  },
  "chat-files": {
    maxSize: 25 * 1024 * 1024,
    allowedMimeTypes: [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
      "application/pdf",
      "text/plain",
      "application/zip"
    ]
  }
};

export const MAX_PRODUCT_IMAGES = 25;
export const MAX_CHAT_ATTACHMENTS = 10;

export class FilesService {
  private readonly repo = new FileRepository();

  createStoragePath(identifier: string, file: File): string {
    const extension = this.getFileExtension(file);
    return `prod_${identifier}/${crypto.randomUUID()}.${extension}`;
  }

  async upload(opts: UploadOptions): Promise<UploadResult> {
    this.validate(opts.file, opts.bucket);
    return this.repo.upload(opts);
  }

  async uploadMany(opts: UploadManyOptions): Promise<UploadResult[]> {
    opts.files.forEach(({ file }) => this.validate(file, opts.bucket));
    return this.repo.uploadMany(opts);
  }

  async delete(bucket: StorageBucket, paths: string | string[]): Promise<void> {
    return this.repo.delete(bucket, paths);
  }

  async getAccessUrl(bucket: StorageBucket, path: string) {
    return this.repo.getAccessUrl(bucket, path);
  }

  private validate(file: File, bucket: StorageBucket): void {
    const { maxSize, allowedMimeTypes } = bucketConfig[bucket];

    if (file.size > maxSize) {
      const mb = maxSize / 1024 / 1024;
      throw new BadRequestError(`File exceeds max size of ${mb}MB`);
    }
    if (!allowedMimeTypes.includes(file.type)) {
      throw new BadRequestError(`File type ${file.type} is not allowed`);
    }
  }

  private getFileExtension(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension) {
      throw new BadRequestError("File must have an extension");
    }

    return extension;
  }
}
