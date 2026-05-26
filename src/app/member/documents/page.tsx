import Link from "next/link";
import { requirePortalViewer } from "@/lib/portal/auth";
import { getMemberDashboardData } from "@/lib/portal/data";
import { formatBytes, formatPortalDate } from "@/lib/portal/format";

type MemberDocumentsPageProps = {
  searchParams: Promise<{
    staged?: string;
    missing?: string;
  }>;
};

export default async function MemberDocumentsPage({
  searchParams,
}: MemberDocumentsPageProps) {
  const viewer = await requirePortalViewer({
    role: "member",
    returnTo: "/member/documents",
  });
  const dashboard = await getMemberDashboardData(viewer);
  const params = await searchParams;

  return (
    <div className="grid gap-6">
      {params.staged ? (
        <article className="rounded-[1.2rem] border border-[rgba(141,107,61,0.22)] bg-[rgba(141,107,61,0.08)] px-4 py-4 text-sm leading-6 text-[var(--ink)]">
          Document storage is staged but not live yet. Connect Supabase storage on Render and
          files will open directly from here.
        </article>
      ) : null}

      {params.missing ? (
        <article className="rounded-[1.2rem] border border-[rgba(138,60,45,0.18)] bg-[rgba(138,60,45,0.08)] px-4 py-4 text-sm leading-6 text-[#8a3c2d]">
          That file could not be opened. Either access is missing or the storage record is not
          connected yet.
        </article>
      ) : null}

      {dashboard.documents.length ? (
        dashboard.documents.map((document) => (
          <article key={document.id} className="surface-panel p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Private document</p>
                <h2 className="mt-4 text-2xl font-semibold text-[var(--ink)]">
                  {document.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                  {document.description || "Secure coaching document"}
                </p>
              </div>
              <Link
                href={`/api/member/documents/${document.id}`}
                className="btn-secondary min-h-11"
              >
                Open file
              </Link>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1rem] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
                Added {formatPortalDate(document.createdAt)}
              </div>
              <div className="rounded-[1rem] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
                {document.fileName}
              </div>
              <div className="rounded-[1rem] border border-[var(--line)] bg-white/70 px-4 py-3 text-sm text-[var(--muted)]">
                {formatBytes(document.sizeBytes)}
              </div>
            </div>
          </article>
        ))
      ) : (
        <article className="surface-panel p-6 text-sm leading-7 text-[var(--muted)]">
          No documents are assigned yet. Meal guides, check-in instructions, and other
          coaching files appear here once uploaded.
        </article>
      )}
    </div>
  );
}
