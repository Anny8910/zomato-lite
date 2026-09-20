import { neon } from "@neondatabase/serverless";
import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const restaurantId = Number(id);
  if (!Number.isInteger(restaurantId) || restaurantId < 1) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const sql = neon(process.env.DATABASE_URL!);

  const restaurant = await sql`
    SELECT name, cuisine, area
    FROM restaurants
    WHERE id = ${restaurantId}
  `;
  if (restaurant.length === 0) {
    return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
  }

  const aggregate = await sql`
    SELECT
      ROUND(AVG(rating)::numeric, 1) AS average_rating,
      COUNT(*)::int AS total
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
  `;

  const allReviews = await sql`
    SELECT id, rating, comment, created_at
    FROM reviews
    WHERE restaurant_id = ${restaurantId}
    ORDER BY created_at DESC
  `;

  const shapeReview = (row: (typeof allReviews)[number]) => ({
    id: row.id,
    rating: row.rating,
    comment: row.comment,
    createdAt: new Date(row.created_at).toISOString(),
  });

  const latestReview = allReviews.length > 0 ? shapeReview(allReviews[0]) : null;
  const olderReviews = allReviews.slice(1).map(shapeReview);

  return NextResponse.json({
    name: restaurant[0].name,
    cuisine: restaurant[0].cuisine,
    area: restaurant[0].area,
    averageRating:
      aggregate[0].average_rating === null ? null : Number(aggregate[0].average_rating),
    totalReviews: aggregate[0].total,
    latestReview,
    reviews: olderReviews,
  });
}