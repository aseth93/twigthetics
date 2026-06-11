import Link from "next/link";
import { notFound } from "next/navigation";
import { GenerateCoachingPackButton } from "@/components/portal/generate-coaching-pack-button";
import { siteConfig } from "@/content/site-config";
import { requirePortalViewer } from "@/lib/portal/auth";
import { getAdminApplicationDetailData } from "@/lib/portal/data";
import {
  formatBytes,
  formatPortalDateTime,
} from "@/lib/portal/format";

type PageProps = {
  params: Promise<{
    applicationId: string;
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

export default async function AdminApplicationDetailPage({ params }: PageProps) {
  await requirePortalViewer({
    role: "coach_admin",
    returnTo: "/admin/intakes",
  });

  const { applicationId } = await params;
  const detail = await getAdminApplicationDetailData({ applicationId });

  if (!detail) {
    notFound();
  }

  const snapshot = [
    { label: "Age", value: detail.application.payload.age },
    { label: "Weight", value: detail.application.payload.weight },
    { label: "Height", value: detail.application.payload.height },
    { label: "Gender", value: detail.application.payload.gender },
    { label: "Phone", value: detail.application.payload.phoneNumber },
    { label: "Start date", value: detail.application.payload.preferredStartDate },
  ].filter(
    (item): item is { label: string; value: string } =>
      typeof item.value === "string" && item.value.trim().length > 0,
  );

  const answers = siteConfig.applicationFields
    .filter((field) => field.type !== "file")
    .map((field) => ({
      key: field.name,
      label: field.label,
      value: detail.application.payload[field.name]?.trim() || "",
    }))
    .filter((item) => item.value);

  const overflowAnswers = Object.entries(detail.application.payload).filter(
    ([key, value]) =>
      !fieldLabelMap.has(key) &&
      typeof value === "string" &&
      value.trim().length > 0,
  );

  return (
    <div className="space-y-6">
      <section className="surface-panel overflow-hidden p-0">
        <div className="border-b border-[var(--line)] px-6 py-5 sm:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Link href="/admin/intakes" className="quiet-link text-sm text-[var(--muted)]">
                Back to all intakes
              </Link>
              <p className="mt-5 eyebrow">Intake detail</p>
              <h1 className="mt-3 text-3xl font-semibold text-[var(--ink)] sm:text-4xl">
                {detail.application.fullName}
              </h1>
              <p className="mt-2 text-base text-[var(--muted)]">
                {detail.application.email}
              </p>
              {detail.application.instagramHandle ? (
                <p className="mt-1 text-sm text-[var(--muted)]">
                  @{detail.application.instagramHandle.replace(/^@/, "")}
                </p>
              ) : null}
              <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
                Submitted {formatPortalDateTime(detail.application.submittedAt)}.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3">
              <span className="rounded-full border border-[var(--line)] px-3 py-1 text-xs uppercase tracking-[0.18em] text-[var(--muted)]">
                {detail.application.status}
              </span>
              {detail.matchingMember ? (
                <Link href={`/admin/members/${detail.matchingMember.id}`} className="btn-ghost">
                  Open matching member
                </Link>
              ) : null}
            </div>
          </div>

          {snapshot.length ? (
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {snapshot.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1.05rem] border border-[var(--line)] bg-white/72 px-4 py-4"
                >
                  <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                    {item.label}
                  </p>
                  <p className="mt-2 text-sm font-medium text-[var(--ink)]">{item.value}</p>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <section className="surface-panel p-6 sm:p-8">
        <GenerateCoachingPackButton
          applicationId={detail.application.id}
          subjectName={detail.application.fullName}
          redirectToMemberOnSuccess
        />
      </section>

      {detail.application.attachments.length ? (
        <section className="surface-panel p-6 sm:p-8">
          <p className="eyebrow">Progress photos</p>
          <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
            Attached intake images
          </h2>
          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
            {detail.application.attachments.map((attachment) => (
              <a
                key={attachment.id}
                href={attachment.downloadUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-[1.15rem] border border-[var(--line)] bg-[var(--canvas)] px-4 py-4 hover:bg-white"
              >
                <p className="eyebrow text-[var(--muted)]">
                  {attachmentLabelMap.get(attachment.fieldName) || attachment.fieldName}
                </p>
                <p className="mt-2 font-medium text-[var(--ink)]">{attachment.fileName}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
                  {formatBytes(attachment.sizeBytes)}
                </p>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      <section className="surface-panel p-6 sm:p-8">
        <p className="eyebrow">Questionnaire</p>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
          Full intake answers
        </h2>

        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {answers.map((answer) => (
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

          {overflowAnswers.map(([key, value]) => (
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
      </section>
    </div>
  );
}
