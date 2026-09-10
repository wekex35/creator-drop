import { NextResponse } from "next/server";
import { getCashfree } from "@/lib/cashfree";
import { getOrderById, updateOrderFromCashfree } from "@/lib/orders-db";

type CashfreeWebhookBody = {
  type?: string;
  event?: string;
  data?: {
    order?: {
      order_id?: string;
    };
    payment?: {
      cf_payment_id?: string;
      payment_status?: string;
    };
  };
};

/**
 * Cashfree webhook — no webhook secret required.
 * We re-fetch order status from Cashfree API before updating Mongo.
 *
 * Dashboard URL: https://creatordrop.in/api/webhooks/cashfree
 * Events: PAYMENT_SUCCESS (also PAYMENT_FAILED / PAYMENT_USER_DROPPED optional)
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CashfreeWebhookBody;
    const orderId = body.data?.order?.order_id?.trim() || "";

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing order_id" },
        { status: 400 },
      );
    }

    const existing = await getOrderById(orderId);
    if (!existing) {
      console.warn("Cashfree webhook for unknown order:", orderId, body.type);
      return NextResponse.json({ success: true, ignored: true });
    }

    const cashfree = getCashfree();
    const [order, payments] = await Promise.all([
      cashfree.PGFetchOrder(orderId),
      cashfree.PGOrderFetchPayments(orderId),
    ]);

    const cashfreeStatus = order.data.order_status ?? "UNKNOWN";

    await updateOrderFromCashfree({
      orderId,
      cashfreeStatus,
      paymentDetails: Array.isArray(payments.data)
        ? payments.data
        : body.data?.payment
          ? [body.data.payment]
          : [],
    });

    return NextResponse.json({
      success: true,
      orderId,
      orderStatus: cashfreeStatus,
      event: body.type || body.event || null,
    });
  } catch (error) {
    console.error("Cashfree webhook failed:", error);
    return NextResponse.json(
      { success: false, error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    endpoint: "/api/webhooks/cashfree",
  });
}
