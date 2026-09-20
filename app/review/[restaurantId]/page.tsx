import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ReviewForm from "@/components/ReviewForm";

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
    <main className="mx-auto w-full max-w-[560px] px-5 py-12">
      <header className="border-b border-line pb-6">
        <h1 className="text-2xl font-semibold">Write a review</h1>
        <p className="mt-1 text-sm text-muted">
          {data.name} · {data.cuisine}, {data.area}
        </p>
      </header>

      <ReviewForm restaurantId={Number(restaurantId)} />
    </main>
  );
}