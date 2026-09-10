import { NextResponse } from "next/server";
import { getCashfree, getCashfreeMode, getCashfreeReturnBaseUrl } from "@/lib/cashfree";
import { friendlyPaymentError } from "@/lib/payment-errors";
import { buildLineItems, createOrder } from "@/lib/orders-db";
import { getProductById, getProductRecord } from "@/lib/products-db";

type CheckoutBody = {
  items?: Array<{ id?: string; quantity?: number }>;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  };
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CheckoutBody;
    const items = Array.isArray(body.items) ? body.items : [];
    const customer = body.customer;

    if (items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Cart is empty" },
        { status: 400 },
      );
    }

    const name = customer?.name?.trim() ?? "";
    const email = customer?.email?.trim().toLowerCase() ?? "";
    const phoneDigits = (customer?.phone ?? "").replace(/\D/g, "");

    if (name.length < 2 || !email.includes("@") || phoneDigits.length < 10) {
      return NextResponse.json(
        { success: false, error: "Name, email, and phone are required" },
        { status: 400 },
      );
    }

    const lineItems: Array<{
      id: string;
      title: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
      deliveryUrl?: string;
    }> = [];

    for (const item of items) {
      const id = item.id?.trim();
      const quantity = Math.floor(Number(item.quantity) || 0);
      if (!id || quantity < 1 || quantity > 20) {
        return NextResponse.json(
          { success: false, error: "Invalid cart item" },
          { status: 400 },
        );
      }

      const product = await getProductById(id);
      if (!product) {
        return NextResponse.json(
          { success: false, error: `Unknown product: ${id}` },
          { status: 400 },
        );
      }

      const record = await getProductRecord(id);

      lineItems.push({
        id: product.id,
        title: product.title,
        quantity,
        unitPrice: product.price,
        lineTotal: product.price * quantity,
        deliveryUrl: record?.deliveryUrl,
      });
    }

    const orderAmount = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
    if (orderAmount <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order amount" },
        { status: 400 },
      );
    }

    const orderId = `cd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const cashfree = getCashfree();
    const returnBase = getCashfreeReturnBaseUrl();
    const phone = phoneDigits.slice(-10);

    const response = await cashfree.PGCreateOrder({
      order_id: orderId,
      order_amount: orderAmount,
      order_currency: "INR",
      order_note: lineItems
        .map((item) => `${item.quantity}x ${item.title}`)
        .join(" | ")
        .slice(0, 200),
      customer_details: {
        customer_id: `cust_${phone}`,
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
      },
      order_meta: {
        return_url: `${returnBase}/payment/status?order_id={order_id}`,
      },
      order_tags: {
        products: lineItems.map((item) => item.id).join(",").slice(0, 255),
      },
    });

    const data = response.data;
    const paymentSessionId = data.payment_session_id;
    if (!paymentSessionId) {
      console.error("Cashfree order missing payment_session_id", data);
      return NextResponse.json(
        {
          success: false,
          error:
            "Cashfree did not return a payment session. Check API version / credentials.",
        },
        { status: 502 },
      );
    }

    const persistedItems = buildLineItems(lineItems);
    const mode = getCashfreeMode();

    await createOrder({
      orderId: data.order_id ?? orderId,
      amount: Number(data.order_amount ?? orderAmount),
      customer: { name, email, phone },
      items: persistedItems,
      paymentSessionId,
      cashfreeStatus: data.order_status,
    });

    return NextResponse.json({
      success: true,
      data: {
        orderId: data.order_id,
        paymentSessionId,
        orderAmount: data.order_amount,
        orderCurrency: data.order_currency,
        orderStatus: data.order_status,
        mode,
        items: persistedItems,
      },
    });
  } catch (error: unknown) {
    console.error("Cashfree create order failed:", error);
    const message = extractCashfreeError(error);
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}

function extractCashfreeError(error: unknown) {
  return friendlyPaymentError(error);
}
