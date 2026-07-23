import { NextResponse } from "next/server";
import { markOrderPaidByReference } from "@/lib/data";
import { verifyWebhookSignature } from "@/lib/paystack";

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(raw);
    if (event.event === "charge.success") {
      const reference: string | undefined = event.data?.reference;
      if (reference) await markOrderPaidByReference(reference);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("webhook failed", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
