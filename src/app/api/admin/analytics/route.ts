import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAnalyticsSummary } from "@/lib/analytics";

export async function GET() {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const data = await getAnalyticsSummary();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Analytics failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to load analytics" },
      { status: 500 },
    );
  }
}
