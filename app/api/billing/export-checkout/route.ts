import Stripe from "stripe";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { getStripeInstance } from "@/lib/stripe";
import { safeJsonParse } from "@/utils/json";

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const session = await getSession();

    if (!session?.email || !session?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { batchSessionId } = await request.json();

    if (!batchSessionId) {
      return NextResponse.json(
        { error: "Batch session ID is required" },
        { status: 400 }
      );
    }

    // Verify batch session exists and belongs to user
    const batchSession = await prisma.batchSession.findFirst({
      where: {
        sessionId: batchSessionId,
        userId: session.id,
        status: "completed",
      },
    });

    if (!batchSession) {
      return NextResponse.json(
        { error: "Batch session not found or not completed" },
        { status: 404 }
      );
    }

    // Check if already paid
    if (batchSession.paidAt) {
      return NextResponse.json(
        { error: "Batch session already paid" },
        { status: 400 }
      );
    }

    const stripe = getStripeInstance();
    const userId = session.id;
    const email = session.email;

    // Get or create Stripe customer
    let stripeCustomerId = null;
    const user = await prisma.authUser.findUnique({
      where: { id: userId },
      select: { stripeCustomerId: true },
    });

    if (user?.stripeCustomerId) {
      stripeCustomerId = user.stripeCustomerId;
    } else {
      const customer = await stripe.customers.create({
        email,
        metadata: {
          user_id: userId.toString(),
        },
      });
      stripeCustomerId = customer.id;

      // Update user with stripe_customer_id
      await prisma.authUser.update({
        where: { id: userId },
        data: { stripeCustomerId },
      });
    }

    const successUrl = `${process.env.APP_URL}/batch-upload?session_id=${batchSessionId}&payment=success`;
    const cancelUrl = `${process.env.APP_URL}/batch-upload?session_id=${batchSessionId}&payment=cancelled`;

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Batch Export - CSV/PDF",
              description: `Export ${safeJsonParse(batchSession.files, []).length} processed receipts`,
            },
            unit_amount: 400, // $4.00
          },
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        user_id: userId.toString(),
        batch_session_id: batchSessionId,
        type: "batch_export",
      },
      allow_promotion_codes: false,
      billing_address_collection: "required",
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Export checkout error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}