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
        { error: "No active distributors available" },
        { status: 404 }
      );
    }
    return NextResponse.json({ distributor, products });
  } catch (err) {
    console.error("match failed", err);
    return NextResponse.json(
      { error: "Could not match a distributor" },
      { status: 500 }
    );
  }
}
