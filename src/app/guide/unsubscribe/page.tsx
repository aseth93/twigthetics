import Link from "next/link";
import { GuideUnsubscribeForm } from "@/components/guide-unsubscribe-form";

type UnsubscribePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function GuideUnsubscribePage({
  searchParams,
}: UnsubscribePageProps) {
  const params = (await searchParams) || {};
  const rawToken = params.token;
  const token = typeof rawToken === "string" ? rawToken : rawToken?.[0] || "";

  return (
    <main className="section-shell min-h-screen pt-28">
      <section className="surface-panel mx-auto max-w-2xl p-8 sm:p-10">
        <p className="eyebrow">Email preferences</p>
        <h1 className="mt-4 text-4xl font-semibold text-[var(--ink)]">
          Stop guide follow-up emails.
        </h1>
        <p className="mt-5 text-base leading-7 text-[var(--muted)]">
          This only stops optional guide emails. Purchase receipts, account access,
          and password emails are unaffected.
        </p>
        {token ? (
          <GuideUnsubscribeForm token={token} />
        ) : (
          <p className="mt-6 text-sm text-[#8a3c2d]">This link is missing its token.</p>
        )}
        <Link href="/guide" className="quiet-link mt-8 inline-flex">
          Return to the guide
        </Link>
      </section>
    </main>
  );
}
