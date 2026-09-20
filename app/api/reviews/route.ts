import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const sql = neon(process.env.DATABASE_URL!);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON" }, { status: 400 });
  }

  const rating = body.rating;
  if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Rating must be a whole number from 1 to 5" }, { status: 400 });
  }

  const comment = typeof body.comment === "string" ? body.comment.trim() : "";
  if (comment === "") {
    return NextResponse.json({ error: "Comment must not be empty" }, { status: 400 });
  }

  const restaurantId = body.restaurantId;
  const restaurant =
    typeof restaurantId === "number"
      ? await sql`SELECT id FROM restaurants WHERE id = ${restaurantId}`
      : [];
  if (restaurant.length === 0) {
    return NextResponse.json({ error: "That restaurant does not exist" }, { status: 400 });
  }

  const inserted = await sql`
    INSERT INTO reviews (restaurant_id, rating, comment)
    VALUES (${restaurantId}, ${rating}, ${comment})
    RETURNING id
  `;

  return NextResponse.json({ success: true, reviewId: inserted[0].id }, { status: 201 });
}