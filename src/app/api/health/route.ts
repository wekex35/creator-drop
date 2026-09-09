import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return NextResponse.json({
      success: true,
      data: { ok: true, db: db.databaseName },
    });
  } catch (error) {
    console.error("Mongo health check failed:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "MongoDB connection failed",
      },
      { status: 500 },
    );
  }
}
