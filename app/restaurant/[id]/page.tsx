import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import DineInTag from "@/components/DineInTag";

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
    <main className="mx-auto w-full max-w-[560px] px-4 py-6 sm:px-5">
      <header className="mb-6 flex items-center justify-between border-b border-line pb-4">
        <Link href="/" className="text-lg font-bold tracking-tight text-accent">
          Zomato&nbsp;Lite
        </Link>
        <Link
          href={`/review/${id}`}
          className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent/90"
        >
          Write a review
        </Link>
      </header>

      <section>
        <h1 className="text-2xl font-bold leading-tight">{data.name}</h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
          {data.dineIn === true && <DineInTag />}
          <span>
            {data.cuisine} · {data.area}
          </span>
        </p>
      </section>

      <section className="mt-5 rounded-2xl border border-line bg-surface p-5">
        {data.averageRating !== null ? (
          <>
            <div className="flex items-end gap-4">
              <span className="text-6xl font-bold leading-none tracking-tight">
                {data.averageRating}
              </span>
              <p className="pb-1 text-sm text-muted">
                {data.totalReviews} review{data.totalReviews === 1 ? "" : "s"}
              </p>
            </div>
            <div className="mt-3 flex max-w-fit items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-white">
              <span className="text-sm leading-none">★</span>
              {data.averageRating} · Good
            </div>
          </>
        ) : (
          <p className="text-muted">No ratings yet.</p>
        )}
      </section>

      {data.latestReview !== null && (
        <section className="mt-5 rounded-2xl border border-accent/30 bg-accent-soft p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-wide text-accent">
              Latest review
            </p>
            <span className="text-xs text-muted">
              {formatDate(data.latestReview.createdAt)}
            </span>
          </div>
          <div className="mt-2 text-foreground">
            <Stars rating={data.latestReview.rating} />
          </div>
          <p className="mt-2 leading-relaxed">{data.latestReview.comment}</p>
        </section>
      )}

      <ul className="mt-6 space-y-5">
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
        <p className="mt-6 text-muted">
          No reviews yet. Be the first to let people know how it was.
        </p>
      )}
    </main>
  );
}