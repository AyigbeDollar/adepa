import crypto from "crypto";

/**
 * Paystack integration (Ghana: mobile money + cards, currency GHS).
 *
 * Split settlement: each distributor has a Paystack subaccount. The
 * transaction is initialised against that subaccount with
 * `transaction_charge` overriding the platform's cut, so Paystack settles
 * the distributor's share to them directly — no manual payouts.
 */

export function isPaystackConfigured(): boolean {
  return Boolean(process.env.PAYSTACK_SECRET_KEY);
}

interface InitArgs {
  email: string;
  amountPesewas: number;
  reference: string;
  callbackUrl: string;
  subaccountCode: string | null;
  platformCutPesewas: number;
  metadata: Record<string, unknown>;
}

export async function initializeTransaction(args: InitArgs): Promise<{
  authorization_url: string;
  reference: string;
}> {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) throw new Error("Paystack is not configured");

  const body: Record<string, unknown> = {
    email: args.email,
    amount: args.amountPesewas,
    currency: "GHS",
    reference: args.reference,
    callback_url: args.callbackUrl,
    channels: ["mobile_money", "card"],
    metadata: args.metadata,
  };
  if (args.subaccountCode) {
    body.subaccount = args.subaccountCode;
    // Platform keeps exactly its fee + delivery; the rest settles to the
    // distributor's subaccount automatically.
    body.transaction_charge = args.platformCutPesewas;
    body.bearer = "subaccount";
  }

  const res = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  if (!res.ok || !json.status) {
    throw new Error(json.message || "Paystack initialisation failed");
  }
  return json.data;
}

export function verifyWebhookSignature(
  rawBody: string,
  signature: string | null
): boolean {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret || !signature) return false;
  const hash = crypto
    .createHmac("sha512", secret)
    .update(rawBody)
    .digest("hex");
  const a = Buffer.from(hash, "utf8");
  const b = Buffer.from(signature, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
