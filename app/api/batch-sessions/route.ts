import { getSession } from "@/lib/session";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { safeJsonParse } from "@/utils/json";

export async function GET(): Promise<NextResponse> {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const batchSessions = await prisma.batchSession.findMany({
      where: {
        userId: session.id,
        paidAt: { not: null }, // Only paid sessions
      },
      orderBy: {
        paidAt: 'desc',
      },
      select: {
        id: true,
        sessionId: true,
        status: true,
        files: true,
        paymentId: true,
        paidAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      batchSessions: batchSessions.map(bs => ({
        ...bs,
        files: safeJsonParse(bs.files, []),
      })),
    });
  } catch (error) {
    console.error("Batch sessions error:", error);
    return NextResponse.json(
      { error: "Failed to fetch batch sessions" },
      { status: 500 }
    );
  }
}