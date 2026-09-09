import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listProducts, seedProducts } from "@/lib/products-db";

export async function POST() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const result = await seedProducts();
    const products = await listProducts({ activeOnly: false });
    return NextResponse.json({
      success: true,
      data: { ...result, products: products.length },
    });
  } catch (error) {
    console.error("Seed products failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to seed products" },
      { status: 500 },
    );
  }
}
