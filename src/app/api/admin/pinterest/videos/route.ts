import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { searchPinterestVideos } from "@/lib/pinterest-videos";

export async function POST(request: Request) {
  if (!(await isAdminAuthenticated())) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as { query?: string };
    const query = body.query?.trim() ?? "";
    if (!query) {
      return NextResponse.json(
        { success: false, error: "Search query is required" },
        { status: 400 },
      );
    }

    const videos = await searchPinterestVideos(query);
    return NextResponse.json({ success: true, data: { videos } });
  } catch (error) {
    console.error("Pinterest video search failed:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to search Pinterest videos",
      },
      { status: 500 },
    );
  }
}
