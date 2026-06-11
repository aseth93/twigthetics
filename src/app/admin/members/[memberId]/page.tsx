import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminMemberProgrammingWorkspace } from "@/components/portal/admin-member-programming-workspace";
import { AdminPlanForm } from "@/components/portal/admin-plan-form";
import { GenerateCoachingPackButton } from "@/components/portal/generate-coaching-pack-button";
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
  searchParams: Promise<{
    tab?: string;
  }>;
};

type MemberDetailTab = "overview" | "intake" | "programming" | "messages";

const fieldLabelMap = new Map(
  siteConfig.applicationFields.map((field) => [field.name, field.label]),
);

const attachmentLabelMap = new Map(
  siteConfig.applicationFields
    .filter((field) => field.type === "file")
    .map((field) => [field.name, field.label]),
);

const tabs: Array<{ key: MemberDetailTab; label: string }> = [
  { key: "overview", label: "Overview" },
  { key: "intake", label: "Intake" },
  { key: "programming", label: "Programming" },
  { key: "messages", label: "Messages" },
];

function normalizeTab(value?: string): MemberDetailTab {
  if (tabs.some((tab) => tab.key === value)) {
    return value as MemberDetailTab;
  }

  return "overview";
}

export default async function AdminMemberDetailPage({
  params,
  searchParams,
}: PageProps) {
  await requirePortalViewer({
    role: "coach_admin",
    returnTo: "/admin",
  });

  const { memberId } = await params;
  const resolvedSearchParams = await searchParams;
  const activeTab = normalizeTab(resolvedSearchParams.tab);
  const detail = await getAdminMemberDetailData({ memberId });

  if (!detail) {
    notFound();
  }

  const latestApplication = detail.applications[0] || null;
  const memberSnapshot = latestApplication
    ? [
        { label: "Age", value: latestApplication.payload.age },
        { label: "Weight", value: latestApplication.payload.weight },
        { label: "Height", value: latestApplication.payload.height },
        { label: "Gender", value: latestApplication.payload.gender },
        {
          label: "Activity",
          value: latestApplication.payload.dailyActivity,
        },
        {
          label: "Start date",
          value: latestApplication.payload.preferredStartDate,
        },
      ].filter(
        (item): item is { label: string; value: string } =>
          typeof item.value === "string" && item.value.trim().length > 0,
      )
    : [];
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
  const overviewHighlights = latestApplication
    ? [
        {
          label: "Goal focus",
          value: latestApplication.payload.goalDescription,
        },
        {
          label: "Nutrition preference",
          value: latestApplication.payload.nutritionStyle,
        },
        {
          label: "Current training",
          value: latestApplication.payload.currentTrainingPlan,
        },
      ].filter(
        (item): item is { label: string; value: string } =>
          typeof item.value === "string" && item.value.trim().length > 0,
      )
    : [];
  const showPackGenerator = Boolean(latestApplication);

  return (
    <div className="space-y-6">
      <section className="surface-panel overflow-hidden p-0">
        <div className="border-b border-[var(--line)] px-6 py-5 sm:px-8">
          <Link href="/admin" className="quiet-link text-sm text-[var(--muted)]">
            Back to admin overview
          </Link>

          <div className="mt-5 flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <p className="eyebrow">Member workspace</p>
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

            <div className="grid grid-cols-2 gap-3 xl:w-[34rem] xl:grid-cols-4">
              <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--canvas)] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  Joined
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                  {formatPortalDate(detail.member.joinedAt)}
                </p>
              </div>
              <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--canvas)] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  Billing
                </p>
                <p className="mt-2 text-sm font-medium capitalize text-[var(--ink)]">
                  {detail.billing?.status || "Not linked"}
                </p>
              </div>
              <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--canvas)] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  Plans
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                  {detail.assignments.length}
                </p>
              </div>
              <div className="rounded-[1.1rem] border border-[var(--line)] bg-[var(--canvas)] px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                  Files
                </p>
                <p className="mt-2 text-sm font-medium text-[var(--ink)]">
                  {detail.documents.length}
                </p>
              </div>
            </div>
          </div>

          {memberSnapshot.length ? (
            <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
              {memberSnapshot.map((item) => (
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

        <div className="flex flex-wrap gap-3 px-6 py-4 sm:px-8">
          {tabs.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <Link
                key={tab.key}
                href={`/admin/members/${detail.member.id}?tab=${tab.key}`}
                className={`rounded-full border px-4 py-2 text-sm transition ${
                  isActive
                    ? "border-[var(--ink)] bg-[var(--ink)] text-white"
                    : "border-[var(--line)] bg-white/76 text-[var(--muted)] hover:bg-white"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </section>

      {activeTab === "overview" ? (
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <article className="surface-panel p-6 sm:p-8">
            <p className="eyebrow">Snapshot</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
              Everything important at a glance.
            </h2>

            <div className="mt-6 grid grid-cols-1 gap-4">
              {overviewHighlights.length ? (
                overviewHighlights.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.15rem] border border-[var(--line)] bg-white/75 px-5 py-5"
                  >
                    <p className="text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
                      {item.label}
                    </p>
                    <p className="mt-3 whitespace-pre-line text-sm leading-7 text-[var(--ink)]">
                      {item.value}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm leading-7 text-[var(--muted)]">
                  No intake summary is stored for this member yet.
                </p>
              )}
            </div>
          </article>

          <article className="dark-panel p-6 sm:p-8">
            <p className="eyebrow text-white/55">Current state</p>
            <div className="mt-5 grid grid-cols-1 gap-4">
              <div className="rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                  Active plan
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {detail.assignments[0]?.plan.title || "No plan assigned"}
                </p>
              </div>
              <div className="rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                  Current period end
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {formatPortalDate(detail.billing?.currentPeriodEnd)}
                </p>
              </div>
              <div className="rounded-[1.15rem] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-white/50">
                  Last message
                </p>
                <p className="mt-2 text-lg font-semibold text-white">
                  {detail.messages.at(-1)
                    ? formatPortalDateTime(detail.messages.at(-1)?.createdAt)
                    : "No thread yet"}
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <Link
                  href={`/admin/members/${detail.member.id}?tab=programming`}
                  className="btn-ghost"
                >
                  Open programming
                </Link>
                <Link
                  href={`/admin/members/${detail.member.id}?tab=messages`}
                  className="btn-ghost"
                >
                  Open messages
                </Link>
              </div>
            </div>
          </article>
        </section>
      ) : null}

      {activeTab === "intake" ? (
        <section className="surface-panel p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Latest intake</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
                {latestApplication ? "Application answers" : "No intake on file"}
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
                      className="rounded-[1.15rem] border border-[var(--line)] bg-[var(--canvas)] px-4 py-4 hover:bg-white"
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
        </section>
      ) : null}

      {activeTab === "programming" ? (
        <section className="space-y-6">
          <article className="surface-panel p-6 sm:p-8">
            <p className="eyebrow">Programming</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
              Organized by training, nutrition, supplements, cardio, and misc.
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Keep each member’s plan and files grouped by section so you can scan and
              update everything from one workspace.
            </p>

            {showPackGenerator ? (
              <div className="mt-6">
                <GenerateCoachingPackButton
                  memberId={detail.member.id}
                  subjectName={detail.member.fullName}
                />
              </div>
            ) : null}

            <div className="mt-6">
              <AdminMemberProgrammingWorkspace
                assignments={detail.assignments}
                documents={detail.documents}
                memberId={detail.member.id}
                memberName={detail.member.fullName}
              />
            </div>
          </article>

          <AdminPlanForm
            allowSubmit
            initialMemberId={detail.member.id}
            memberName={detail.member.fullName}
            heading={`Build or assign the next block for ${detail.member.fullName}`}
          />
        </section>
      ) : null}

      {activeTab === "messages" ? (
        <section className="space-y-4">
          <article className="surface-panel p-6 sm:p-8">
            <p className="eyebrow">Direct messaging</p>
            <h2 className="mt-3 text-2xl font-semibold text-[var(--ink)]">
              Message {detail.member.fullName}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Keep check-ins, questions, and follow-ups tied to the member record.
            </p>
          </article>
          <MessageThread
            allowSubmit
            memberId={detail.member.id}
            initialMessages={detail.messages}
            emptyLabel="No messages in this thread yet."
          />
        </section>
      ) : null}
    </div>
  );
}
