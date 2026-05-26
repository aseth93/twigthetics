"use client";

import { useMemo, useState } from "react";
import type { ApplicationFormField } from "@/types/site";

type ApplicationFormProps = {
  fields: ApplicationFormField[];
  hasEndpoint: boolean;
  instagramUrl: string;
};

type FormState = Record<string, string>;
type ErrorState = Record<string, string>;

const emailPattern = /\S+@\S+\.\S+/;

function buildInitialState(fields: ApplicationFormField[]): FormState {
  return fields.reduce<FormState>((accumulator, field) => {
    accumulator[field.name] = "";
    return accumulator;
  }, {});
}

export function ApplicationForm({
  fields,
  hasEndpoint,
  instagramUrl,
}: ApplicationFormProps) {
  const initialState = useMemo(() => buildInitialState(fields), [fields]);
  const [values, setValues] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<ErrorState>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    tone: "idle" | "success" | "error";
    message: string;
  }>({
    tone: "idle",
    message: "",
  });

  function validate(nextValues: FormState) {
    const nextErrors: ErrorState = {};

    fields.forEach((field) => {
      const value = nextValues[field.name]?.trim() ?? "";

      if (field.required && !value) {
        nextErrors[field.name] = "This field is required.";
        return;
      }

      if (field.type === "email" && value && !emailPattern.test(value)) {
        nextErrors[field.name] = "Enter a valid email address.";
      }
    });

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus({ tone: "idle", message: "" });

    if (!validate(values) || !hasEndpoint) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/apply", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to submit your application.");
      }

      setValues(initialState);
      setErrors({});
      setStatus({
        tone: "success",
        message:
          "Application sent. Expect the next step once submissions are wired into the live workflow.",
      });
    } catch (error) {
      setStatus({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong while submitting the application.",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  function renderField(field: ApplicationFormField) {
    const commonProps = {
      id: field.name,
      name: field.name,
      value: values[field.name],
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
      ) => {
        const nextValue = event.target.value;
        setValues((current) => ({ ...current, [field.name]: nextValue }));
        if (errors[field.name]) {
          setErrors((current) => ({ ...current, [field.name]: "" }));
        }
      },
      "aria-invalid": Boolean(errors[field.name]),
      className:
        "w-full rounded-[1.15rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none transition placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:bg-white",
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
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="surface-panel p-6 sm:p-8 md:p-10"
    >
      <div className="grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2">
        {fields.map((field) => (
          <label
            key={field.name}
            htmlFor={field.name}
            className={field.type === "textarea" ? "md:col-span-2" : ""}
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
          disabled={!hasEndpoint || isSubmitting}
          className={hasEndpoint ? "btn-primary" : "btn-disabled"}
        >
          {isSubmitting
            ? "Submitting..."
            : hasEndpoint
              ? "Submit Application"
              : "Applications Reopen Soon"}
        </button>

        <a
          href={instagramUrl}
          target="_blank"
          rel="noreferrer"
          className="quiet-link"
        >
          DM on Instagram instead
        </a>
      </div>

      <p className="mt-4 text-xs leading-6 text-[var(--muted)]">
        Your information is used only to review coaching fit and next steps.
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
  );
}
