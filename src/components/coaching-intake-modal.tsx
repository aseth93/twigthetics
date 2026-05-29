import { ApplicationForm } from "@/components/application-form";
import type { ApplicationFormField } from "@/types/site";

type CoachingIntakeModalProps = {
  fields: ApplicationFormField[];
  instagramUrl: string;
};

export function CoachingIntakeModal({
  fields,
  instagramUrl,
}: CoachingIntakeModalProps) {
  return (
    <section
      id="coaching-intake-modal"
      className="modal-shell"
      aria-labelledby="coaching-intake-title"
      aria-modal="true"
      role="dialog"
    >
      <a
        href="#apply"
        aria-label="Close intake questionnaire"
        className="absolute inset-0 block"
      />

      <div className="modal-card relative z-10 w-full max-w-5xl">
        <div className="mb-4 flex items-start justify-between gap-4 rounded-[1.6rem] border border-[var(--line)] bg-[rgba(246,239,230,0.94)] px-5 py-5 shadow-[var(--shadow)] sm:px-6">
          <div>
            <p className="eyebrow">Coaching Intake</p>
            <h2
              id="coaching-intake-title"
              className="mt-2 text-2xl font-semibold text-[var(--ink)] sm:text-3xl"
            >
              Sign up for coaching.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">
              Fill this out once with real detail. Training, food, recovery, current
              structure, and progress photos all land in the admin side so the plan can
              start from your actual situation.
            </p>
          </div>

          <a
            href="#apply"
            className="rounded-full border border-[var(--line)] bg-white/72 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[var(--muted)] hover:bg-white"
          >
            Close
          </a>
        </div>

        <div className="max-h-[calc(100vh-9rem)] overflow-y-auto pb-2">
          <ApplicationForm fields={fields} instagramUrl={instagramUrl} />
        </div>
      </div>
    </section>
  );
}
