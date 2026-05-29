import Link from "next/link";
import { requirePortalViewer } from "@/lib/portal/auth";
import { getMemberDashboardData } from "@/lib/portal/data";
import { formatBytes, formatPortalDate } from "@/lib/portal/format";

export default async function MemberDocumentsPage() {
  const viewer = await requirePortalViewer({
    role: "member",
    returnTo: "/member/documents",
  });
  const dashboard = await getMemberDashboardData(viewer);

  return (
    <div className="grid grid-cols-1 gap-6">
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

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
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
