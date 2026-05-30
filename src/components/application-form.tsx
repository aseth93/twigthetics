"use client";

import { useMemo, useState } from "react";
import type { ApplicationFormField } from "@/types/site";

type ApplicationFormProps = {
  fields: ApplicationFormField[];
  instagramUrl: string;
};

type FormState = Record<string, string>;
type FileState = Record<string, File | null>;
type ErrorState = Record<string, string>;
type SubmissionConfirmation = {
  fullName: string;
  email: string;
};

const emailPattern = /\S+@\S+\.\S+/;

function buildInitialState(fields: ApplicationFormField[]): FormState {
  return fields.reduce<FormState>((accumulator, field) => {
    if (field.type !== "file") {
      accumulator[field.name] = "";
    }
    return accumulator;
  }, {});
}

function buildInitialFiles(fields: ApplicationFormField[]): FileState {
  return fields.reduce<FileState>((accumulator, field) => {
    if (field.type === "file") {
      accumulator[field.name] = null;
    }
    return accumulator;
  }, {});
}

function matchesCondition(
  condition:
    | {
        field: string;
        equals: string | string[];
      }
    | undefined,
  values: FormState,
) {
  if (!condition) {
    return true;
  }

  const currentValue = values[condition.field] || "";
  const matches = Array.isArray(condition.equals)
    ? condition.equals.includes(currentValue)
    : currentValue === condition.equals;

  return matches;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function parseDateValue(value: string) {
  return value ? new Date(`${value}T00:00:00`) : null;
}

function formatDateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getVisibleFields(fields: ApplicationFormField[], values: FormState) {
  return fields.filter((field) => matchesCondition(field.showWhen, values));
}

export function ApplicationForm({
  fields,
  instagramUrl,
}: ApplicationFormProps) {
  const initialState = useMemo(() => buildInitialState(fields), [fields]);
  const initialFiles = useMemo(() => buildInitialFiles(fields), [fields]);
  const [values, setValues] = useState<FormState>(initialState);
  const [files, setFiles] = useState<FileState>(initialFiles);
  const [errors, setErrors] = useState<ErrorState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetKey, setResetKey] = useState(0);
  const [status, setStatus] = useState<{
    tone: "idle" | "success" | "error";
    message: string;
  }>({
    tone: "idle",
    message: "",
  });
  const [confirmation, setConfirmation] = useState<SubmissionConfirmation | null>(null);
  const [isRedirectingToCheckout, setIsRedirectingToCheckout] = useState(false);

  const visibleFields = useMemo(() => getVisibleFields(fields, values), [fields, values]);

  function validate(nextValues: FormState, nextFiles: FileState) {
    const nextErrors: ErrorState = {};

    visibleFields.forEach((field) => {
      const isConditionallyRequired = matchesCondition(field.requiredWhen, nextValues);
      const isRequired = field.required || Boolean(field.requiredWhen && isConditionallyRequired);

      if (field.type === "file") {
        const file = nextFiles[field.name];

        if (isRequired && !file) {
          nextErrors[field.name] = "This file is required.";
        }

        return;
      }

      const value = nextValues[field.name]?.trim() ?? "";

      if (isRequired && !value) {
        nextErrors[field.name] = "This field is required.";
        return;
      }

      if (field.type === "email" && value && !emailPattern.test(value)) {
        nextErrors[field.name] = "Enter a valid email address.";
        return;
      }

      if (field.type === "date" && value) {
        const selectedDate = parseDateValue(value);

        if (!selectedDate || Number.isNaN(selectedDate.getTime())) {
          nextErrors[field.name] = "Choose a valid date.";
          return;
        }

        if (
          typeof field.minDaysFromToday === "number" &&
          selectedDate < addDays(startOfToday(), field.minDaysFromToday)
        ) {
          nextErrors[field.name] = `Pick a date at least ${field.minDaysFromToday} days out.`;
          return;
        }

        if (
          typeof field.requiredWeekday === "number" &&
          selectedDate.getDay() !== field.requiredWeekday
        ) {
          nextErrors[field.name] = "Pick a Monday start date.";
        }
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ tone: "idle", message: "" });

    if (!validate(values, files)) {
      return;
    }

    try {
      setIsSubmitting(true);
      const submissionSnapshot = {
        fullName: values.fullName || values.name || "",
        email: values.email || "",
      };

      const formData = new FormData();

      visibleFields.forEach((field) => {
        if (field.type === "file") {
          const file = files[field.name];

          if (file) {
            formData.append(field.name, file);
          }

          return;
        }

        formData.append(field.name, values[field.name] || "");
      });

      const response = await fetch("/api/apply", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to submit your application.");
      }

      setValues(initialState);
      setFiles(initialFiles);
      setErrors({});
      setResetKey((current) => current + 1);
      setStatus({
        tone: "success",
        message: "Intake submitted.",
      });
      setConfirmation(submissionSnapshot);
    } catch (error) {
      setStatus({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while submitting your intake.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleValueChange(fieldName: string, nextValue: string) {
    setValues((current) => ({ ...current, [fieldName]: nextValue }));
    if (errors[fieldName]) {
      setErrors((current) => ({ ...current, [fieldName]: "" }));
    }
  }

  function handleFileChange(fieldName: string, nextFile: File | null) {
    setFiles((current) => ({ ...current, [fieldName]: nextFile }));
    if (errors[fieldName]) {
      setErrors((current) => ({ ...current, [fieldName]: "" }));
    }
  }

  function renderField(field: ApplicationFormField) {
    const commonClassName =
      "w-full rounded-[1.15rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:bg-white";

    if (field.type === "file") {
      return (
        <input
          key={`${field.name}-${resetKey}`}
          id={field.name}
          name={field.name}
          type="file"
          accept={field.accept}
          onChange={(event) => handleFileChange(field.name, event.target.files?.[0] || null)}
          aria-invalid={Boolean(errors[field.name])}
          className={`${commonClassName} file:mr-4 file:rounded-full file:border-0 file:bg-[var(--ink)] file:px-4 file:py-2 file:text-sm file:text-white`}
        />
      );
    }

    const commonProps = {
      id: field.name,
      name: field.name,
      value: values[field.name] || "",
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
      ) => handleValueChange(field.name, event.target.value),
      "aria-invalid": Boolean(errors[field.name]),
      className: commonClassName,
    };

    if (field.type === "textarea") {
      return <textarea {...commonProps} placeholder={field.placeholder} rows={5} />;
    }

    if (field.type === "select") {
      return (
        <select {...commonProps}>
          <option value="">{field.placeholder || "Select an option"}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        {...commonProps}
        type={field.type}
        placeholder={field.placeholder}
        autoComplete="off"
        min={
          field.type === "date" && typeof field.minDaysFromToday === "number"
            ? formatDateValue(addDays(startOfToday(), field.minDaysFromToday))
            : undefined
        }
      />
    );
  }

  function handleDismissConfirmation() {
    setConfirmation(null);
    setIsRedirectingToCheckout(false);
  }

  function handleCheckoutNow() {
    if (!confirmation?.email || isRedirectingToCheckout) {
      return;
    }

    setIsRedirectingToCheckout(true);

    const searchParams = new URLSearchParams({
      email: confirmation.email,
    });

    window.location.href = `/api/coaching/checkout?${searchParams.toString()}`;
  }

  return (
    <>
      <form onSubmit={handleSubmit} noValidate className="surface-panel p-6 sm:p-8 md:p-10">
        <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
          {visibleFields.map((field) => (
            <label
              key={field.name}
              htmlFor={field.name}
              className={field.span === "full" || field.type === "textarea" ? "md:col-span-2" : ""}
            >
              <span className="mb-2 block text-sm font-medium text-[var(--ink)]">
                {field.label}
              </span>
              {renderField(field)}
              {field.helper ? (
                <span className="mt-2 block text-xs leading-5 text-[var(--muted)]">
                  {field.helper}
                </span>
              ) : null}
              {errors[field.name] ? (
                <span className="mt-2 block text-xs leading-5 text-[#8a3c2d]">
                  {errors[field.name]}
                </span>
              ) : null}
            </label>
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? "Submitting..." : "Submit Intake"}
          </button>

          <a href={instagramUrl} target="_blank" rel="noreferrer" className="quiet-link">
            DM on Instagram instead
          </a>
        </div>

        <p className="mt-4 text-xs leading-6 text-[var(--muted)]">
          Your information and progress photos are used only to review coaching fit and next
          steps.
        </p>

        {status.message ? (
          <div
            className={`mt-5 rounded-[1.1rem] border px-4 py-3 text-sm leading-6 ${
              status.tone === "success"
                ? "border-[rgba(39,49,39,0.18)] bg-[rgba(39,49,39,0.08)] text-[var(--forest)]"
                : "border-[rgba(138,60,45,0.18)] bg-[rgba(138,60,45,0.08)] text-[#8a3c2d]"
            }`}
          >
            {status.message}
          </div>
        ) : null}
      </form>

      {confirmation ? (
        <section
          aria-labelledby="intake-submitted-title"
          aria-modal="true"
          role="dialog"
          className="modal-shell"
        >
          <div className="modal-card relative z-10 w-full max-w-2xl">
            <div className="rounded-[1.6rem] border border-[var(--line)] bg-[rgba(246,239,230,0.96)] px-5 py-5 shadow-[var(--shadow)] sm:px-6 sm:py-6">
              <p className="eyebrow">Intake Submitted</p>
              <h2
                id="intake-submitted-title"
                className="mt-3 text-2xl font-semibold text-[var(--ink)] sm:text-3xl"
              >
                Submitted.
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--muted)] sm:text-base sm:leading-7">
                Your intake has been received{confirmation.fullName ? `, ${confirmation.fullName}` : ""}. Do you want to pay and reserve your coaching spot now?
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleCheckoutNow}
                  disabled={isRedirectingToCheckout}
                  className="btn-primary"
                >
                  {isRedirectingToCheckout ? "Redirecting..." : "Yes, reserve my spot"}
                </button>
                <button
                  type="button"
                  onClick={handleDismissConfirmation}
                  disabled={isRedirectingToCheckout}
                  className="btn-secondary"
                >
                  No, I&apos;ll do it later
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
