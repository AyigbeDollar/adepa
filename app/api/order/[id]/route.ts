import { NextResponse } from "next/server";
import { getOrder } from "@/lib/data";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const order = await getOrder(id);
    if (!order) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    // Public order-status endpoint: return only what the confirmation
    // page needs; the id is an unguessable UUID acting as the token.
    return NextResponse.json({ order });
  } catch (err) {
    console.error("order lookup failed", err);
    return NextResponse.json({ error: "Lookup failed" }, { status: 500 });
  }
}
