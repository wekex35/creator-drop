import { NextResponse } from "next/server";
import { isCashfreeTestMode } from "@/lib/cashfree";
import {
  createDeliveryPdfSignedUrl,
  verifyDownloadToken,
} from "@/lib/delivery-access";
import { getOrderById } from "@/lib/orders-db";

export async function GET(request: Request) {
  try {
    if (isCashfreeTestMode()) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Downloads are disabled while Cashfree is in test/sandbox mode.",
        },
        { status: 403 },
      );
    }

    const token = new URL(request.url).searchParams.get("token")?.trim() || "";
    const claims = verifyDownloadToken(token);
    if (!claims) {
      return NextResponse.json(
        { success: false, error: "Download link is invalid or expired." },
        { status: 401 },
      );
    }

    const order = await getOrderById(claims.o);
    if (!order || order.status !== "PAID") {
      return NextResponse.json(
        { success: false, error: "Order is not paid." },
        { status: 403 },
      );
    }

    const owned = order.items.some((item) => item.id === claims.p);
    if (!owned) {
      return NextResponse.json(
        { success: false, error: "This pack is not in your order." },
        { status: 403 },
      );
    }

    const signedUrl = await createDeliveryPdfSignedUrl(claims.p);
    return NextResponse.redirect(signedUrl, 302);
  } catch (error) {
    console.error("Secure download failed:", error);
    return NextResponse.json(
      { success: false, error: "Could not prepare download." },
      { status: 500 },
    );
  }
}
