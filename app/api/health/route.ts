
import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  try {
    const tables = db
      .prepare(
        "SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name",
      )
      .all();

    return NextResponse.json({
      success: true,
      message: "اتصال دیتابیس سورمه برقرار است.",
      tables,
    });
  } catch (error) {
    console.error("Sormeh database health check failed:", error);

    return NextResponse.json(
      {
        success: false,
        message: "اتصال به دیتابیس ناموفق بود.",
      },
      { status: 500 },
    );
  }
}
