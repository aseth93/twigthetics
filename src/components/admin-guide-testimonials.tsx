"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Testimonial = {
  id: string;
  displayName: string;
  quote: string;
  rating: number | null;
  status: string;
  source: string;
};

export function AdminGuideTestimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState("");

  async function addTestimonial(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/guide/testimonials", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        displayName: form.get("displayName"),
        quote: form.get("quote"),
        rating: form.get("rating"),
      }),
    });
    const result = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    if (!response.ok) {
      setStatus(result?.error || "Unable to add feedback.");
      return;
    }

    event.currentTarget.reset();
    setStatus("Published.");
    router.refresh();
  }

  async function setPublished(testimonialId: string, published: boolean) {
    const response = await fetch("/api/admin/guide/testimonials", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        testimonialId,
        status: published ? "published" : "pending",
      }),
    });

    if (!response.ok) {
      setStatus("Unable to update feedback.");
      return;
    }

    router.refresh();
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[0.82fr_1.18fr]">
      <form onSubmit={addTestimonial} className="surface-panel p-6">
        <p className="eyebrow">Add verified feedback</p>
        <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
          Only add feedback you actually received. Manual entries publish immediately.
        </p>
        <input
          name="displayName"
          required
          placeholder="Display name"
          className="mt-5 min-h-12 w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4"
        />
        <textarea
          name="quote"
          required
          minLength={20}
          rows={5}
          placeholder="Exact customer feedback"
          className="mt-3 w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3"
        />
        <select
          name="rating"
          defaultValue="5"
          className="mt-3 min-h-12 w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4"
        >
          {[5, 4, 3, 2, 1].map((rating) => (
            <option key={rating} value={rating}>
              {rating} / 5
            </option>
          ))}
        </select>
        <button type="submit" className="btn-primary mt-4 w-full">
          Publish feedback
        </button>
        {status ? <p className="mt-3 text-sm text-[var(--muted)]">{status}</p> : null}
      </form>

      <div className="surface-panel p-6">
        <p className="eyebrow">Reader feedback</p>
        <div className="mt-5 grid gap-3">
          {testimonials.length ? (
            testimonials.map((testimonial) => (
              <article
                key={testimonial.id}
                className="rounded-[1.1rem] border border-[var(--line)] bg-white/60 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-semibold text-[var(--ink)]">
                    {testimonial.displayName}
                    {testimonial.rating ? ` - ${testimonial.rating}/5` : ""}
                  </p>
                  <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                    {testimonial.status} / {testimonial.source}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {testimonial.quote}
                </p>
                <button
                  type="button"
                  className="quiet-link mt-4"
                  onClick={() =>
                    setPublished(testimonial.id, testimonial.status !== "published")
                  }
                >
                  {testimonial.status === "published" ? "Hide from site" : "Publish on site"}
                </button>
              </article>
            ))
          ) : (
            <p className="text-sm text-[var(--muted)]">No guide feedback yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
