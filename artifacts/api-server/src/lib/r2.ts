import { randomUUID } from "node:crypto";
import { DeleteObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} must be set to use R2 storage.`);
  }
  return value;
}

const accountId = requireEnv("R2_ACCOUNT_ID");
const accessKeyId = requireEnv("R2_ACCESS_KEY_ID");
const secretAccessKey = requireEnv("R2_SECRET_ACCESS_KEY");
export const R2_BUCKET = requireEnv("R2_BUCKET_NAME");
const publicBaseUrl = requireEnv("R2_PUBLIC_URL").replace(/\/+$/, "");

const client = new S3Client({
  region: "auto",
  endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId, secretAccessKey },
});

export interface UploadedObject {
  key: string;
  url: string;
}

export async function uploadToR2(
  buffer: Buffer,
  originalName: string,
  contentType: string,
  prefix: string,
): Promise<UploadedObject> {
  const ext = originalName.includes(".") ? originalName.slice(originalName.lastIndexOf(".")) : "";
  const key = `${prefix}/${randomUUID()}${ext.toLowerCase()}`;

  await client.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  return { key, url: `${publicBaseUrl}/${key}` };
}

export async function deleteFromR2(key: string): Promise<void> {
  await client.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}

export function keyFromUrl(url: string): string {
  return url.startsWith(publicBaseUrl) ? url.slice(publicBaseUrl.length + 1) : url;
}
