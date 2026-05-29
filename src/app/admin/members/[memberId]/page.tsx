import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminDocumentForm } from "@/components/portal/admin-document-form";
import { AdminPlanForm } from "@/components/portal/admin-plan-form";
import { MessageThread } from "@/components/portal/message-thread";
import { siteConfig } from "@/content/site-config";
import { requirePortalViewer } from "@/lib/portal/auth";
import { getAdminMemberDetailData } from "@/lib/portal/data";
import {
  formatBytes,
  formatPortalDate,
  formatPortalDateTime,
} from "@/lib/portal/format";

type PageProps = {
  params: Promise<{
    memberId: string;
  }>;
};

const fieldLabelMap = new Map(
  siteConfig.applicationFields.map((field) => [field.name, field.label]),
);

const attachmentLabelMap = new Map(
  siteConfig.applicationFields
    .filter((field) => field.type === "file")
    .map((field) => [field.name, field.label]),
);

export default async function AdminMemberDetailPage({ params }: PageProps) {
  await requirePortalViewer({
    role: "coach_admin",
    returnTo: "/admin",
  });

  const { memberId } = await params;
  const detail = await getAdminMemberDetailData({ memberId });

  if (!detail) {
    notFound();
  }

  const latestApplication = detail.applications[0] || null;
  const intakeAnswers = latestApplication
    ? siteConfig.applicationFields
        .filter((field) => field.type !== "file")
        .map((field) => ({
          key: field.name,
          label: field.label,
          value: latestApplication.payload[field.name]?.trim() || "",
        }))
        .filter((item) => item.value)
    : [];
  const memberSnapshot = latestApplication
    ? [
        { label: "Age", value: latestApplication.payload.age },
        { label: "Weight", value: latestApplication.payload.weight },
        { label: "Height", value: latestApplication.payload.height },
        { label: "Gender", value: latestApplication.payload.gender },
        {
          label: "Start date",
          value: latestApplication.payload.preferredStartDate,
        },
        {
          label: "Daily activity",
          value: latestApplication.payload.dailyActivity,
        },
      ].filter(
        (item): item is { label: string; value: string } =>
          typeof item.value === "string" && item.value.trim().length > 0,
      )
    : [];

  return (
    <div className="space-y-6">
      <section className="surface-panel p-6 sm:p-8">
        <Link href="/admin" className="quiet-link text-sm text-[var(--muted)]">
          Back to admin overview
        </Link>

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="eyebrow">Member detail</p>
            <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)] sm:text-4xl">
              {detail.member.fullName}
            </h1>
            <p className="mt-2 text-base text-[var(--muted)]">{detail.member.email}</p>
            {detail.member.instagramHandle ? (
              <p className="mt-1 text-sm text-[var(--muted)]">
                @{detail.member.instagramHandle.replace(/^@/, "")}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:w-[26rem]">
            <div className="rounded-[1.2rem] border border-[var(--line)] bg-white/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                Joined
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                {formatPortalDate(detail.member.joinedAt)}
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-[var(--line)] bg-white/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                Billing
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                {detail.billing?.status || "Not connected"}
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-[var(--line)] bg-white/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                Active plans
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                {detail.assignments.length}
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-[var(--line)] bg-white/70 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                Files + messages
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--ink)]">
                {detail.documents.length} docs / {detail.messages.length} msgs
              </p>
            </div>
          </div>
        </div>

        {memberSnapshot.length ? (
          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
            {memberSnapshot.map((item) => (
              <div
                key={item.label}
                className="rounded-[1.05rem] border border-[var(--line)] bg-[var(--canvas)] px-4 py-4"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  {item.label}
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--ink)]">{item.value}</p>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <article className="surface-panel p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Latest intake</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
                {latestApplication ? "Full application answers" : "No intake on file"}
              </h2>
              {latestApplication ? (
                <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                  Submitted {formatPortalDateTime(latestApplication.submittedAt)}.
                </p>
              ) : null}
            </div>
            {latestApplication ? (
              <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                {latestApplication.status}
              </span>
            ) : null}
          </div>

          {latestApplication ? (
            <>
              {latestApplication.attachments.length ? (
                <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
                  {latestApplication.attachments.map((attachment) => (
                    <a
                      key={attachment.id}
                      href={attachment.downloadUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-[1.2rem] border border-[var(--line)] bg-[var(--canvas)] px-4 py-4 hover:bg-white"
                    >
                      <p className="eyebrow text-[var(--muted)]">
                        {attachmentLabelMap.get(attachment.fieldName) || attachment.fieldName}
                      </p>
                      <p className="mt-2 font-medium text-[var(--ink)]">
                        {attachment.fileName}
                      </p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                        {formatBytes(attachment.sizeBytes)}
                      </p>
                    </a>
                  ))}
                </div>
              ) : null}

              <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
                {intakeAnswers.map((answer) => (
                  <div
                    key={answer.key}
                    className="rounded-[1.15rem] border border-[var(--line)] bg-[var(--canvas)] px-4 py-4"
                  >
                    <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                      {answer.label}
                    </p>
                    <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--ink)]">
                      {answer.value}
                    </p>
                  </div>
                ))}

                {Object.entries(latestApplication.payload)
                  .filter(
                    ([key, value]) =>
                      !fieldLabelMap.has(key) &&
                      typeof value === "string" &&
                      value.trim().length,
                  )
                  .map(([key, value]) => (
                    <div
                      key={key}
                      className="rounded-[1.15rem] border border-[var(--line)] bg-[var(--canvas)] px-4 py-4"
                    >
                      <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                        {key}
                      </p>
                      <p className="mt-2 whitespace-pre-line text-sm leading-6 text-[var(--ink)]">
                        {value}
                      </p>
                    </div>
                  ))}
              </div>
            </>
          ) : (
            <p className="mt-5 text-sm leading-7 text-[var(--muted)]">
              This member doesn’t have a stored intake yet.
            </p>
          )}
        </article>

        <article className="dark-panel p-6 sm:p-8">
          <p className="eyebrow text-white/55">Billing + status</p>
          <div className="mt-5 grid grid-cols-1 gap-4">
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/50">Plan</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {detail.billing?.planName || "Not assigned"}
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/50">Status</p>
              <p className="mt-2 text-lg font-semibold text-white">
                {detail.billing?.status || "No billing record"}
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/50">
                Current period end
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {formatPortalDate(detail.billing?.currentPeriodEnd)}
              </p>
            </div>
            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.16em] text-white/50">
                Cancel at period end
              </p>
              <p className="mt-2 text-lg font-semibold text-white">
                {detail.billing?.cancelAtPeriodEnd ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="surface-panel p-6 sm:p-8">
          <p className="eyebrow">Assigned plans</p>
          <div className="mt-5 grid grid-cols-1 gap-4">
            {detail.assignments.length ? (
              detail.assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="rounded-[1.15rem] border border-[var(--line)] bg-white/72 px-4 py-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--ink)]">
                        {assignment.plan.title}
                      </h3>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {assignment.plan.summary}
                      </p>
                    </div>
                    <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                      {assignment.status}
                    </span>
                  </div>
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    Starts {formatPortalDate(assignment.startsOn)}
                  </p>
                  {assignment.notes ? (
                    <p className="mt-3 text-sm leading-6 text-[var(--ink)]">{assignment.notes}</p>
                  ) : null}
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--muted)]">
                No plan assignments yet.
              </p>
            )}
          </div>
        </article>

        <article className="surface-panel p-6 sm:p-8">
          <p className="eyebrow">Assigned documents</p>
          <div className="mt-5 grid grid-cols-1 gap-4">
            {detail.documents.length ? (
              detail.documents.map((document) => (
                <a
                  key={document.id}
                  href={`/api/member/documents/${document.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-[1.15rem] border border-[var(--line)] bg-white/72 px-4 py-4 hover:bg-white"
                >
                  <h3 className="text-lg font-semibold text-[var(--ink)]">
                    {document.title}
                  </h3>
                  {document.description ? (
                    <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                      {document.description}
                    </p>
                  ) : null}
                  <p className="mt-3 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                    {document.fileName} • {formatBytes(document.sizeBytes)}
                  </p>
                </a>
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--muted)]">
                No documents assigned yet.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AdminPlanForm
          allowSubmit
          initialMemberId={detail.member.id}
          memberName={detail.member.fullName}
          heading={`Create a plan for ${detail.member.fullName}`}
        />
        <AdminDocumentForm
          allowSubmit
          initialMemberId={detail.member.id}
          memberName={detail.member.fullName}
          heading={`Upload a file for ${detail.member.fullName}`}
        />
      </section>

      <section className="grid grid-cols-1 gap-4">
        <article className="surface-panel p-6 sm:p-8">
          <p className="eyebrow">Direct messaging</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
            Message {detail.member.fullName}
          </h2>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Keep the conversation, check-in context, and documents tied to the member
            record.
          </p>
        </article>
        <MessageThread
          allowSubmit
          memberId={detail.member.id}
          initialMessages={detail.messages}
          emptyLabel="No messages in this thread yet."
        />
      </section>
    </div>
  );
}
