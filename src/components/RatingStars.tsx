"use client";

import { useState } from "react";

export default function RatingStars({
  initialRating,
  onRate,
}: {
  initialRating?: number;
  onRate: (rating: number) => void;
}) {
  const [rating, setRating] = useState(initialRating ?? 0);
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
          className={`text-lg leading-none ${
            (hover || rating) >= n ? "text-amber-500" : "text-stone-300"
          }`}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          onClick={() => {
            setRating(n);
            onRate(n);
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}
