import { NextResponse } from "next/server";
import { isCashfreeTestMode } from "@/lib/cashfree";
import { getOrderById, orderDeliveryLinks } from "@/lib/orders-db";

type Props = {
  params: Promise<{ orderId: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  try {
    const { orderId } = await params;
    const id = orderId?.trim();
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 },
      );
    }

    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 },
      );
    }

    const testMode = isCashfreeTestMode();
    const paid = order.status === "PAID";
    const downloadsEnabled = paid && !testMode;
    const deliveries = downloadsEnabled
      ? orderDeliveryLinks(order)
      : orderDeliveryLinks(order).map(({ id: itemId, title }) => ({
          id: itemId,
          title,
          deliveryUrl: "",
        }));

    return NextResponse.json({
      success: true,
      data: {
        orderId: order.orderId,
        status: order.status,
        cashfreeStatus: order.cashfreeStatus,
        amount: order.amount,
        currency: order.currency,
        customer: order.customer,
        items: order.items.map(({ deliveryUrl: _ignored, ...item }) => item),
        deliveries,
        downloadsEnabled,
        testMode,
        paidAt: order.paidAt,
        createdAt: order.createdAt,
      },
    });
  } catch (error) {
    console.error("Get order failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load order" },
      { status: 500 },
    );
  }
}
