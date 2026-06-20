import { supabase } from "@app/db/client";

type PublicBucket = "avatars" | "product-images";
type PrivateBucket = "chat-files";
export type StorageBucket = PublicBucket | PrivateBucket;

export type UploadOptions = {
  bucket: StorageBucket;
  path: string;
  file: File;
};

export type UploadManyOptions = {
  bucket: StorageBucket;
  files: { file: File; path: string }[];
};

export type UploadResult = {
  path: string;
  fullPath: string;
  publicUrl: string;
};

export type SignedUrlOptions = {
  bucket: StorageBucket;
  path: string;
  expiresIn?: number;
};

const PUBLIC_BUCKETS = new Set<StorageBucket>(["avatars", "product-images"]);
const DEFAULT_EXPIRES_IN = 3600; // seconds

export class FileRepository {
  private storage(bucket: StorageBucket) {
    return supabase.storage.from(bucket);
  }

  async upload({ bucket, path, file }: UploadOptions): Promise<UploadResult> {
    const { data, error } = await this.storage(bucket).upload(path, file);

    if (error) {
      console.dir(error, { depth: null });
      throw new Error(`Storage upload failed: ${error.message}`);
    }

    const publicUrl = PUBLIC_BUCKETS.has(bucket)
      ? this.getPublicUrl(bucket, path)
      : data.fullPath;

    return {
      path: data.path,
      fullPath: data.fullPath,
      publicUrl
    };
  }

  async uploadMany(opts: UploadManyOptions): Promise<UploadResult[]> {
    return await Promise.all(
      opts.files.map(({ file, path }) =>
        this.upload({
          bucket: opts.bucket,
          file,
          path
        })
      )
    );
  }

  async delete(bucket: StorageBucket, paths: string | string[]): Promise<void> {
    const target = Array.isArray(paths) ? paths : [paths];
    const { error } = await this.storage(bucket).remove(target);

    if (error) {
      throw new Error(`Storage delete failed: ${error.message}`);
    }
  }

  async getAccessUrl(
    bucket: StorageBucket,
    path: string,
    expiresIn = DEFAULT_EXPIRES_IN
  ): Promise<string> {
    if (PUBLIC_BUCKETS.has(bucket)) {
      return this.getPublicUrl(bucket, path);
    }
    return this.getSignedUrl({ bucket, path, expiresIn });
  }

  private async getSignedUrl({
    bucket,
    path,
    expiresIn = DEFAULT_EXPIRES_IN
  }: SignedUrlOptions): Promise<string> {
    const { data, error } = await this.storage(bucket).createSignedUrl(
      path,
      expiresIn
    );

    if (error) {
      throw new Error(`Signed URL failed: ${error.message}`);
    }

    return data.signedUrl;
  }

  private getPublicUrl(bucket: StorageBucket, path: string): string {
    const { data } = this.storage(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
}
