import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { Client } from "@upstash/qstash";
import { unauthorized } from "@/lib/error";

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) return unauthorized();

    const body = await request.json();
    const { type, data } = body;

    if (!type || !data) {
      return NextResponse.json(
        { error: "Missing required fields: type and data" },
        { status: 400 }
      );
    }

    const userId = session.id;

    // Queue email notification with QStash for background processing
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/notifications/email-queue`;

    await qstashClient.publishJSON({
      url: webhookUrl,
      body: {
        type,
        data,
        userId,
      },
      retries: 2,
      timeout: "30s",
    });

    return NextResponse.json({ 
      success: true, 
      message: "Email notification queued successfully" 
    });
  } catch (error) {
    console.error("Email notification error:", error);
    return NextResponse.json(
      { error: "Failed to queue email notification" },
      { status: 500 }
    );
  }
}