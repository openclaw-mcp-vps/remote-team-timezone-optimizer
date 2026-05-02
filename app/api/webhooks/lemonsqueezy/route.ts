import { NextResponse } from "next/server";
import { recordPurchase } from "@/lib/db";
import { verifyStripeWebhookSignature } from "@/lib/lemonsqueezy";

type StripeCheckoutSession = {
  customer_email?: string;
  customer_details?: {
    email?: string;
  };
};

type StripeEvent = {
  id: string;
  type: string;
  data?: {
    object?: StripeCheckoutSession;
  };
};

export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  const rawBody = await request.text();

  if (!secret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET is not configured" }, { status: 500 });
  }

  const valid = verifyStripeWebhookSignature(rawBody, signature, secret);
  if (!valid) {
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(rawBody) as StripeEvent;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    const email = session?.customer_details?.email || session?.customer_email;

    if (email) {
      recordPurchase(email, "stripe");
    }
  }

  return NextResponse.json({ received: true });
}
