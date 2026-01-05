import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { sendProcessingCompleteEmail, sendProcessingFailedEmail, sendBatchProcessingCompleteEmail } from "@/lib/emailService";
import prisma from "@/lib/prisma";

interface ProcessingCompleteData {
  merchantName: string;
  amount: number;
  category: string;
  receiptDate: string;
  fileName: string;
}

interface ProcessingFailedData {
  fileName: string;
  errorMessage?: string;
}

interface BatchProcessingCompleteData {
  fileCount: number;
  sessionId: string;
}

interface EmailQueueBody {
  type: 'processing_complete' | 'processing_failed' | 'batch_processing_complete';
  data: ProcessingCompleteData | ProcessingFailedData | BatchProcessingCompleteData;
  userId: number;
}

export const runtime = "nodejs";
export const maxDuration = 30; // Allow 30s for email sending

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body: EmailQueueBody = await request.json();
    const { type, data, userId } = body;
    
    if (!type || !data || !userId) {
      console.error("Missing required fields:", { type, userId, hasData: !!data });
      return NextResponse.json(
        { error: "Missing required fields: type, data, or userId" },
        { status: 400 }
      );
    }

    console.log("Processing queued email:", { type, userId });

    // Get user email from database
    const user = await prisma.authUser.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true, lastName: true },
    });

    if (!user || !user.email) {
      console.error("User not found or no email:", { userId });
      return NextResponse.json(
        { error: "User not found or no email address" },
        { status: 404 }
      );
    }

    let emailSent = false;

    // Send appropriate email based on type
    switch (type) {
      case 'processing_complete':
        const completeData = data as ProcessingCompleteData;
        emailSent = await sendProcessingCompleteEmail({
          to: user.email,
          merchantName: completeData.merchantName,
          amount: completeData.amount,
          category: completeData.category,
          receiptDate: completeData.receiptDate,
          fileName: completeData.fileName,
        });
        break;

      case 'processing_failed':
        const failedData = data as ProcessingFailedData;
        emailSent = await sendProcessingFailedEmail({
          to: user.email,
          fileName: failedData.fileName,
          errorMessage: failedData.errorMessage,
        });
        break;

      case 'batch_processing_complete':
        const batchData = data as BatchProcessingCompleteData;
        emailSent = await sendBatchProcessingCompleteEmail({
          to: user.email,
          fileCount: batchData.fileCount,
          sessionId: batchData.sessionId,
        });
        break;

      default:
        console.error("Invalid email type:", type);
        return NextResponse.json(
          { error: "Invalid notification type" },
          { status: 400 }
        );
    }

    if (emailSent) {
      console.log("Queued email sent successfully:", { type, userId, userEmail: user.email });
      return NextResponse.json({
        success: true,
        message: "Email sent successfully",
        userId,
        emailType: type,
      });
    } else {
      console.error("Failed to send queued email:", { type, userId });
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error("Email queue processing error:", {
      error: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });

    return NextResponse.json(
      {
        error: "Email queue processing failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export const POST = verifySignatureAppRouter(handler);

export async function GET(): Promise<NextResponse> {
  return NextResponse.json({
    service: "Email Queue Processor",
    status: "healthy",
    timestamp: new Date().toISOString(),
  });
}