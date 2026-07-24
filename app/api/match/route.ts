import { NextResponse } from "next/server";
import { matchDistributor, getProducts } from "@/lib/data";

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
    const [distributor, products] = await Promise.all([
      matchDistributor(lat, lng),
      getProducts(),
    ]);
    if (!distributor) {
      return NextResponse.json(
        { error: "We don't deliver to this area yet — we're expanding fast!" },
        { status: 404 }
      );
    }
    return NextResponse.json({ distributor, products });
  } catch (err) {
    console.error("match failed", err);
    return NextResponse.json(
      { error: "We couldn't check your area right now. Please try again." },
      { status: 500 }
    );
  }
}
