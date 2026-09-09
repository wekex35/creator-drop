import { NextResponse } from "next/server";
import { getDeliveryUrl } from "@/data/delivery";
import { getCashfree } from "@/lib/cashfree";
import {
  getOrderById,
  orderDeliveryLinks,
  updateOrderFromCashfree,
} from "@/lib/orders-db";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { orderId?: string };
    const orderId = body.orderId?.trim();

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 },
      );
    }

    const cashfree = getCashfree();
    const [order, payments] = await Promise.all([
      cashfree.PGFetchOrder(orderId),
      cashfree.PGOrderFetchPayments(orderId),
    ]);

    const cashfreeStatus = order.data.order_status ?? "UNKNOWN";
    const dbOrder = await updateOrderFromCashfree({
      orderId,
      cashfreeStatus,
      paymentDetails: Array.isArray(payments.data) ? payments.data : [],
    });

    const existing = dbOrder ?? (await getOrderById(orderId));

    const productIds =
      existing?.items.map((item) => item.id) ??
      order.data.order_tags?.products
        ?.split(",")
        .map((id) => id.trim())
        .filter(Boolean) ??
      [];

    const deliveries = existing
      ? orderDeliveryLinks(existing)
      : productIds.map((id) => ({
          id,
          title: id,
          deliveryUrl: getDeliveryUrl(id),
        }));

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.data.order_id,
        orderStatus: cashfreeStatus,
        orderAmount: order.data.order_amount,
        orderCurrency: order.data.order_currency,
        orderNote: order.data.order_note,
        productIds,
        deliveries,
        customer: existing?.customer ?? null,
        paymentDetails: payments.data ?? [],
      },
    });
  } catch (error: unknown) {
    console.error("Cashfree verify payment failed:", error);
    const message =
      typeof error === "object" &&
      error !== null &&
      "message" in error &&
      typeof (error as { message: unknown }).message === "string"
        ? (error as { message: string }).message
        : "Failed to verify payment";

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
