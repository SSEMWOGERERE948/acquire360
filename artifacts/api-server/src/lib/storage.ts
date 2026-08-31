import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

function optionalEnv(name: string): string | undefined {
  const value = process.env[name];
  return value && !value.startsWith("local-placeholder") ? value : undefined;
}

function r2Config() {
  const endpoint = optionalEnv("R2_ENDPOINT");
  const accountId = optionalEnv("R2_ACCOUNT_ID");
  const accessKeyId = optionalEnv("R2_ACCESS_KEY_ID");
  const secretAccessKey = optionalEnv("R2_SECRET_ACCESS_KEY");
  const bucket = optionalEnv("R2_BUCKET_NAME") ?? optionalEnv("R2_BUCKET");
  const publicUrl = optionalEnv("R2_PUBLIC_URL") ?? optionalEnv("R2_PUBLIC_BASE_URL");

  if ((!endpoint && !accountId) || !accessKeyId || !secretAccessKey || !bucket || !publicUrl) {
    return undefined;
  }

  return {
    endpoint: endpoint?.replace(/\/+$/, "") ?? `https://${accountId}.r2.cloudflarestorage.com`,
    accessKeyId,
    secretAccessKey,
    bucket,
    publicBaseUrl: publicUrl.replace(/\/+$/, ""),
  };
}

function fileExtension(originalName: string): string {
  return originalName.includes(".")
    ? originalName.slice(originalName.lastIndexOf(".")).toLowerCase()
    : "";
}

export interface UploadedObject {
  key: string;
  url: string;
}

function r2Client(config: NonNullable<ReturnType<typeof r2Config>>): S3Client {
  return new S3Client({
    region: "auto",
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
}

export function publicUrlForObject(key: string, fallbackUrl: string): string {
  if (key.startsWith("local:")) {
    return fallbackUrl;
  }

  const config = r2Config();
  if (config && fallbackUrl.startsWith(config.publicBaseUrl)) {
    return `/uploads/${key}`;
  }

  return fallbackUrl;
}

export function publicUrlForStoredUrl(value: string | null | undefined): string | null {
  if (!value) {
    return null;
  }

  if (value.startsWith("/uploads/")) {
    return value;
  }

  const config = r2Config();
  if (config) {
    const publicPrefix = `${config.publicBaseUrl}/`;
    if (value.startsWith(publicPrefix)) {
      return `/uploads/${value.slice(publicPrefix.length)}`;
    }

    const endpointPrefix = `${config.endpoint}/${config.bucket}/`;
    if (value.startsWith(endpointPrefix)) {
      return `/uploads/${value.slice(endpointPrefix.length)}`;
    }
  }

  const r2DevMarker = ".r2.dev/";
  const r2DevIndex = value.indexOf(r2DevMarker);
  if (r2DevIndex !== -1) {
    return `/uploads/${value.slice(r2DevIndex + r2DevMarker.length)}`;
  }

  const cloudflareMarker = ".r2.cloudflarestorage.com/";
  const cloudflareIndex = value.indexOf(cloudflareMarker);
  if (cloudflareIndex !== -1) {
    const afterHost = value.slice(cloudflareIndex + cloudflareMarker.length);
    const slashIndex = afterHost.indexOf("/");
    return slashIndex === -1 ? value : `/uploads/${afterHost.slice(slashIndex + 1)}`;
  }

  return value;
}

export async function uploadObject(
  buffer: Buffer,
  originalName: string,
  contentType: string,
  prefix: string,
): Promise<UploadedObject> {
  const ext = fileExtension(originalName);
  const key = `${prefix}/${randomUUID()}${ext}`;
  const config = r2Config();

  if (config) {
    const client = r2Client(config);

    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      }),
    );

    return { key, url: `/uploads/${key}` };
  }

  const publicDir = path.resolve(process.cwd(), "public/uploads");
  const filePath = path.join(publicDir, key);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);

  return { key: `local:${key}`, url: `/uploads/${key}` };
}

export async function deleteObject(key: string): Promise<void> {
  if (key.startsWith("local:")) {
    const relativeKey = key.slice("local:".length);
    const filePath = path.resolve(process.cwd(), "public/uploads", relativeKey);
    await fs.rm(filePath, { force: true });
    return;
  }

  const config = r2Config();
  if (!config) {
    return;
  }

  const client = r2Client(config);

  await client.send(new DeleteObjectCommand({ Bucket: config.bucket, Key: key }));
}

export async function getObjectStream(key: string): Promise<{
  body: Readable;
  contentType?: string;
  contentLength?: number;
}> {
  if (key.startsWith("local:")) {
    const relativeKey = key.slice("local:".length);
    const filePath = path.resolve(process.cwd(), "public/uploads", relativeKey);
    const stat = await fs.stat(filePath);
    return {
      body: Readable.from(await fs.readFile(filePath)),
      contentLength: stat.size,
    };
  }

  const config = r2Config();
  if (!config) {
    throw new Error("R2 storage is not configured.");
  }

  const result = await r2Client(config).send(
    new GetObjectCommand({ Bucket: config.bucket, Key: key }),
  );

  if (!(result.Body instanceof Readable)) {
    throw new Error("R2 returned an unreadable object body.");
  }

  return {
    body: result.Body,
    contentType: result.ContentType,
    contentLength: result.ContentLength,
  };
}
