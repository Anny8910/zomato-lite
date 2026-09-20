import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="text-accent" aria-label={`${rating} out of 5`}>
      {"★".repeat(rating)}
    </span>
  );
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default async function RestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const host = (await headers()).get("host") ?? "localhost:3000";
  const proto = (await headers()).get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/restaurants/${id}`, {
    cache: "no-store",
  });

  if (res.status === 404) {
    notFound();
  }
  if (!res.ok) {
    throw new Error("Could not load this restaurant.");
  }

  const data = await res.json();

  return (
    <main className="mx-auto w-full max-w-[560px] px-5 py-12">
      <header>
        <h1 className="text-2xl font-semibold">{data.name}</h1>
        <p className="mt-1 text-sm text-muted">
          {data.cuisine} · {data.area}
        </p>
      </header>

      {data.averageRating !== null ? (
        <div className="mt-8 flex items-baseline gap-3">
          <span className="text-6xl font-semibold tracking-tight">
            {data.averageRating}
          </span>
          <span className="text-sm text-muted">
            {data.totalReviews} review{data.totalReviews === 1 ? "" : "s"}
          </span>
        </div>
      ) : (
        <p className="mt-8 text-muted">No ratings yet.</p>
      )}

      {data.latestReview !== null && (
        <section className="mt-8 rounded-xl border border-accent bg-accent-soft p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Latest review
          </p>
          <div className="mt-2 flex items-center justify-between">
            <Stars rating={data.latestReview.rating} />
            <span className="text-xs text-muted">
              {formatDate(data.latestReview.createdAt)}
            </span>
          </div>
          <p className="mt-3 leading-relaxed">{data.latestReview.comment}</p>
        </section>
      )}

      <ul className="mt-8 space-y-6">
        {data.reviews.map((review: { id: number; rating: number; comment: string; createdAt: string }) => (
          <li key={review.id} className="border-b border-line pb-5">
            <div className="flex items-center justify-between">
              <Stars rating={review.rating} />
              <span className="text-xs text-muted">{formatDate(review.createdAt)}</span>
            </div>
            <p className="mt-2 leading-relaxed text-foreground/90">{review.comment}</p>
          </li>
        ))}
      </ul>

      {data.latestReview === null && (
        <p className="mt-8 text-muted">
          No reviews yet. Be the first to let people know how it was.
        </p>
      )}

      <div className="mt-10">
        <Link
          href={`/review/${id}`}
          className="inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90"
        >
          Write a review
        </Link>
      </div>
    </main>
  );
}