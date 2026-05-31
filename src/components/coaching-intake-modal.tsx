"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { ApplicationForm } from "@/components/application-form";
import type { ApplicationFormField } from "@/types/site";

type IntakeContextValue = {
  open: () => void;
  close: () => void;
};

const CoachingIntakeContext = createContext<IntakeContextValue | null>(null);

type CoachingIntakeProviderProps = {
  children: ReactNode;
  fields: ApplicationFormField[];
  instagramUrl: string;
};

type CoachingIntakeButtonProps = {
  children: ReactNode;
  className: string;
};

function ModalContent({
  fields,
  instagramUrl,
  onClose,
}: {
  fields: ApplicationFormField[];
  instagramUrl: string;
  onClose: () => void;
}) {
  return (
    <section
      aria-labelledby="coaching-intake-title"
      aria-modal="true"
      role="dialog"
      className="modal-shell"
    >
      <button
        type="button"
        aria-label="Close intake questionnaire"
        onClick={onClose}
        className="absolute inset-0 block"
      />

      <div className="modal-card relative z-10 flex w-full max-w-5xl flex-col">
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

          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-[var(--line)] bg-white/72 px-4 py-2 text-xs uppercase tracking-[0.16em] text-[var(--muted)] hover:bg-white"
          >
            Close
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto overscroll-contain pb-[calc(env(safe-area-inset-bottom)+6rem)] pr-1">
          <ApplicationForm fields={fields} instagramUrl={instagramUrl} />
        </div>
      </div>
    </section>
  );
}

export function CoachingIntakeProvider({
  children,
  fields,
  instagramUrl,
}: CoachingIntakeProviderProps) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeydown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [isOpen]);

  const contextValue = useMemo<IntakeContextValue>(
    () => ({
      open,
      close,
    }),
    [close, open],
  );

  return (
    <CoachingIntakeContext.Provider value={contextValue}>
      {children}
      {isOpen ? (
        <ModalContent fields={fields} instagramUrl={instagramUrl} onClose={close} />
      ) : null}
    </CoachingIntakeContext.Provider>
  );
}

export function CoachingIntakeButton({
  children,
  className,
}: CoachingIntakeButtonProps) {
  const context = useContext(CoachingIntakeContext);

  if (!context) {
    throw new Error("CoachingIntakeButton must be used inside CoachingIntakeProvider.");
  }

  return (
    <button type="button" onClick={context.open} className={className}>
      {children}
    </button>
  );
}
