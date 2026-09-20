"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STARS = [1, 2, 3, 4, 5];

export default function ReviewForm({ restaurantId }: { restaurantId: number }) {
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const canSubmit = rating !== null && comment.trim() !== "" && !submitting;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ restaurantId, rating, comment }),
      });

      if (res.ok) {
        router.push(`/restaurant/${restaurantId}`);
        return;
      }

      const body = await res.json();
      setError(typeof body.error === "string" ? body.error : "Something went wrong.");
    } catch {
      setError("Could not reach the server.");
    }

    setSubmitting(false);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8">
      <label className="text-sm font-medium">Your rating</label>
      <div className="mt-2 flex gap-2">
        {STARS.map((star) => {
          const selected = rating !== null && star <= rating;
          return (
            <button
              key={star}
              type="button"
              aria-label={`${star} star${star === 1 ? "" : "s"}`}
              onClick={() => setRating(star)}
              className={`text-3xl leading-none transition-colors ${
                selected ? "text-accent" : "text-line hover:text-accent/60"
              }`}
            >
              ★
            </button>
          );
        })}
      </div>

      <label htmlFor="comment" className="mt-8 block text-sm font-medium">
        Your comment
      </label>
      <textarea
        id="comment"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={4}
        placeholder="How was the food? The service?"
        className="mt-2 w-full rounded-lg border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
      />

      {error !== null && (
        <p className="mt-4 rounded-lg bg-accent-soft px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!canSubmit}
        className="mt-6 inline-block rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Submit review
      </button>
    </form>
  );
}