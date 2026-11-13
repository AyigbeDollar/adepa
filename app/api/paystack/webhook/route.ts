import { NextResponse } from "next/server";
import { markOrderPaidByReference } from "@/lib/data";
import { verifyWebhookSignature } from "@/lib/paystack";
import { annotate, markError } from "@/lib/telemetry";

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  const valid = verifyWebhookSignature(raw, signature);
  annotate({ "app.webhook.signature_valid": valid });
  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  try {
    const event = JSON.parse(raw);
    annotate({ "app.webhook.event": String(event.event ?? "unknown") });
    if (event.event === "charge.success") {
      const reference: string | undefined = event.data?.reference;
      annotate({ "app.payment.reference_present": Boolean(reference) });
      if (reference) await markOrderPaidByReference(reference);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("webhook failed", err);
    markError("paystack_webhook.failed", err);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
