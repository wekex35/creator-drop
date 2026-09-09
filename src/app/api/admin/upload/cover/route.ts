import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import {
  CREATORDROP_PREFIX,
  uploadCreatordropAsset,
} from "@/lib/config/cloudflare";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const form = await request.formData();
    const file = form.get("file");
    const productIdRaw = String(form.get("productId") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Cover image file is required" },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { success: false, error: "File must be an image" },
        { status: 400 },
      );
    }

    if (file.size > 8 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: "Image must be under 8MB" },
        { status: 400 },
      );
    }

    const productId = slugify(productIdRaw) || `cover-${Date.now()}`;
    const ext =
      file.type === "image/jpeg"
        ? "jpg"
        : file.type === "image/webp"
          ? "webp"
          : file.type === "image/gif"
            ? "gif"
            : "png";

    const key = `${CREATORDROP_PREFIX}/products/${productId}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadCreatordropAsset({
      buffer,
      key,
      contentType: file.type || "image/png",
    });

    return NextResponse.json({
      success: true,
      data: {
        path: uploaded.url,
        key: uploaded.key,
        productId,
      },
    });
  } catch (error) {
    console.error("Cover upload failed:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to upload cover image",
      },
      { status: 500 },
    );
  }
}
