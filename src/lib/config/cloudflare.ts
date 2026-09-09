import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import * as https from "https";

let s3Client: S3Client;
let mediaS3Client: S3Client;

export const MEDIA_BUCKET = process.env.R2_BUCKET || "store";
export const MEDIA_PUBLIC_BASE_URL = (
  process.env.R2_PUBLIC_BASE_URL ||
  process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL ||
  "https://store.creatordrop.in"
).replace(/\/$/, "");

export const CREATORDROP_PREFIX = "creatordrop";

export function mediaPublicUrl(key: string) {
  const clean = key.replace(/^\//, "");
  return `${MEDIA_PUBLIC_BASE_URL}/${clean}`;
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function initCloudFlareS3(): S3Client {
  if (s3Client) {
    return s3Client;
  }
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const access_key_id =
    process.env.R2_UPLOAD_ACCESS_KEY_ID?.trim() ||
    requireEnv("R2_ACCESS_KEY_ID");
  const access_key_secret =
    process.env.R2_UPLOAD_SECRET_ACCESS_KEY?.trim() ||
    requireEnv("R2_SECRET_ACCESS_KEY");

  s3Client = new S3Client({
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: access_key_id,
      secretAccessKey: access_key_secret,
    },
    region: "auto",
    forcePathStyle: false,
  });
  return s3Client;
}

function initMediaS3Client(): S3Client {
  if (mediaS3Client) {
    return mediaS3Client;
  }
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const access_key_id =
    process.env.R2_MEDIA_ACCESS_KEY_ID?.trim() ||
    requireEnv("R2_ACCESS_KEY_ID");
  const access_key_secret =
    process.env.R2_MEDIA_SECRET_ACCESS_KEY?.trim() ||
    requireEnv("R2_SECRET_ACCESS_KEY");

  const httpsAgent = new https.Agent({
    rejectUnauthorized: false,
  });

  mediaS3Client = new S3Client({
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: access_key_id,
      secretAccessKey: access_key_secret,
    },
    region: "auto",
    forcePathStyle: false,
    requestHandler: {
      httpsAgent,
    },
  });
  return mediaS3Client;
}

const uploadFileToBucket = async (
  file: File | Buffer,
  bucket: string,
  key: string,
  contentType?: string,
) => {
  const client = initCloudFlareS3();
  const upload = await client.send(
    new PutObjectCommand({
      Bucket: bucket || "blog",
      Key: key,
      Body: file,
      ContentType:
        contentType ||
        (file instanceof File ? file.type : "application/octet-stream"),
      ContentLength: file instanceof File ? file.size : file.length,
    }),
  );

  return upload.$metadata;
};

const uploadFileToMediaBucket = async (
  buffer: Buffer,
  key: string,
  contentType: string,
  retries = 3,
) => {
  const client = initMediaS3Client();

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const upload = await client.send(
        new PutObjectCommand({
          Bucket: MEDIA_BUCKET,
          Key: key,
          Body: buffer,
          ContentType: contentType,
          ContentLength: buffer.length,
        }),
      );

      return upload.$metadata;
    } catch (error: unknown) {
      const err = error as { code?: string; message?: string };
      if (
        err.code === "ERR_SSL_SSL/TLS_ALERT_BAD_RECORD_MAC" ||
        err.message?.includes("ssl/tls alert bad record mac")
      ) {
        console.warn(
          `SSL/TLS error on attempt ${attempt}/${retries}, retrying...`,
        );

        if (attempt === retries) {
          mediaS3Client = null as unknown as S3Client;
          const freshClient = initMediaS3Client();
          const upload = await freshClient.send(
            new PutObjectCommand({
              Bucket: MEDIA_BUCKET,
              Key: key,
              Body: buffer,
              ContentType: contentType,
              ContentLength: buffer.length,
            }),
          );
          return upload.$metadata;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, attempt) * 1000),
        );
        continue;
      }

      throw error;
    }
  }

  throw new Error("Failed to upload after all retry attempts");
};

/** Upload CreatorDrop assets to R2 `store` under creatordrop/. */
const uploadCreatordropAsset = async (input: {
  buffer: Buffer;
  key: string;
  contentType: string;
}) => {
  const key = input.key.replace(/^\//, "");
  await uploadFileToMediaBucket(input.buffer, key, input.contentType);
  return {
    key,
    url: mediaPublicUrl(key),
  };
};

const getRemoteImageSignedUrl = async (key: string, bucket: string) => {
  const extension = key.split(".").pop()?.toLowerCase();
  const contentType =
    (
      {
        png: "image/png",
        jpg: "image/jpeg",
        jpeg: "image/jpeg",
        gif: "image/gif",
        svg: "image/svg+xml",
        webp: "image/webp",
      } as Record<string, string>
    )[extension as string] || "image/jpeg";

  return getSignedUrl(
    initCloudFlareS3(),
    new PutObjectCommand({
      Bucket: bucket || "blog",
      Key: key,
      ContentType: contentType,
    }),
  );
};

const deleteFileFromMediaBucket = async (key: string): Promise<void> => {
  try {
    const client = initMediaS3Client();
    await client.send(
      new DeleteObjectCommand({
        Bucket: MEDIA_BUCKET,
        Key: key,
      }),
    );
  } catch (error) {
    console.error(`Error deleting file from R2 (${key}):`, error);
  }
};

const extractFileKeyFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.startsWith("/")
      ? urlObj.pathname.slice(1)
      : urlObj.pathname;
    return path || null;
  } catch (error) {
    console.error("Error extracting file key from URL:", error);
    return null;
  }
};

export {
  uploadFileToBucket,
  uploadFileToMediaBucket,
  uploadCreatordropAsset,
  getRemoteImageSignedUrl,
  initMediaS3Client,
  deleteFileFromMediaBucket,
  extractFileKeyFromUrl,
};
