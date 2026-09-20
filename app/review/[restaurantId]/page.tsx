import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ReviewForm from "@/components/ReviewForm";
import DineInTag from "@/components/DineInTag";

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ restaurantId: string }>;
}) {
  const { restaurantId } = await params;

  const host = (await headers()).get("host") ?? "localhost:3000";
  const proto = (await headers()).get("x-forwarded-proto") ?? "http";
  const res = await fetch(`${proto}://${host}/api/restaurants/${restaurantId}`, {
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
          href={`/restaurant/${restaurantId}`}
          className="text-sm font-medium text-muted hover:text-accent"
        >
          Back to restaurant
        </Link>
      </header>

      <header>
        <h1 className="text-2xl font-bold leading-tight">Write a review</h1>
        <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
          {data.dineIn === true && <DineInTag />}
          <span>
            {data.name} · {data.cuisine}, {data.area}
          </span>
        </p>
      </header>

      <ReviewForm restaurantId={Number(restaurantId)} />
    </main>
  );
}