import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { safeJsonParse } from "@/utils/json";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
): Promise<NextResponse> {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;
    
    const batchSession = await prisma.batchSession.findFirst({
      where: {
        sessionId,
        userId: session.id,
      },
    });

    if (!batchSession) {
      return NextResponse.json({ error: "Batch session not found" }, { status: 404 });
    }

    return NextResponse.json({
      batchSession: {
        id: batchSession.id,
        sessionId: batchSession.sessionId,
        status: batchSession.status,
        files: safeJsonParse(batchSession.files, []),
        paymentId: batchSession.paymentId,
        paidAt: batchSession.paidAt,
      },
    });
  } catch (error) {
    console.error("Batch status error:", error);
    return NextResponse.json(
      { error: "Failed to get batch status" },
      { status: 500 }
    );
  }
}