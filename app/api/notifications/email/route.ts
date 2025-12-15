import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { sendProcessingCompleteEmail, sendProcessingFailedEmail } from "@/lib/emailService";
import { unauthorized } from "@/lib/error";

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

    const userEmail = session.email;
    let emailSent = false;

    switch (type) {
      case 'processing_complete':
        emailSent = await sendProcessingCompleteEmail({
          to: userEmail,
          merchantName: data.merchantName,
          amount: data.amount,
          category: data.category,
          receiptDate: data.receiptDate,
          fileName: data.fileName,
        });
        break;

      case 'processing_failed':
        emailSent = await sendProcessingFailedEmail({
          to: userEmail,
          fileName: data.fileName,
          errorMessage: data.errorMessage,
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid notification type" },
          { status: 400 }
        );
    }

    if (emailSent) {
      return NextResponse.json({ 
        success: true, 
        message: "Email notification sent successfully" 
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send email notification" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Email notification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}