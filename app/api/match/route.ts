import { NextResponse } from "next/server";
import { matchDistributor, getProductsForDistributor } from "@/lib/data";

export async function POST(req: Request) {
  let body: { lat?: number; lng?: number };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { lat, lng } = body;
  if (typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json(
      { error: "lat and lng are required numbers" },
      { status: 400 }
    );
  }
  try {
    const distributor = await matchDistributor(lat, lng);
    if (!distributor) {
      return NextResponse.json(
        { error: "We don't deliver to this area yet — we're expanding fast!" },
        { status: 404 }
      );
    }
    // Show only what this distributor stocks (falls back to full catalogue
    // until inventory is configured for them).
    const products = await getProductsForDistributor(distributor.id);
    return NextResponse.json({ distributor, products });
  } catch (err) {
    console.error("match failed", err);
    return NextResponse.json(
      { error: "We couldn't check your area right now. Please try again." },
      { status: 500 }
    );
  }
}
