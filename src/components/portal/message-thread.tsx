"use client";

import { useState } from "react";
import { formatPortalDateTime } from "@/lib/portal/format";
import type { ConversationMessage } from "@/types/portal";

type MessageThreadProps = {
  allowSubmit?: boolean;
  memberId?: string;
  emptyLabel: string;
  initialMessages: ConversationMessage[];
};

export function MessageThread({
  allowSubmit = true,
  memberId,
  emptyLabel,
  initialMessages,
}: MessageThreadProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [body, setBody] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedBody = body.trim();

    if (!trimmedBody || !allowSubmit) {
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus("");

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          body: trimmedBody,
          memberId,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; message?: ConversationMessage }
        | null;

      if (!response.ok || !payload?.message) {
        throw new Error(payload?.error || "Unable to send the message.");
      }

      setMessages((current) => [...current, payload.message!]);
      setBody("");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Unable to send the message.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="surface-panel p-6">
      <div className="space-y-3">
        {messages.length ? (
          messages.map((message) => {
            const isCoach = message.sender.role === "coach_admin";

            return (
              <article
                key={message.id}
                className={`rounded-[1.25rem] px-4 py-4 ${
                  isCoach
                    ? "ml-auto max-w-[34rem] bg-[var(--ink)] text-white"
                    : "mr-auto max-w-[34rem] border border-[var(--line)] bg-white/75 text-[var(--ink)]"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <p
                    className={`text-xs uppercase tracking-[0.18em] ${
                      isCoach ? "text-white/55" : "text-[var(--muted)]"
                    }`}
                  >
                    {message.sender.fullName}
                  </p>
                  <p
                    className={`text-xs ${
                      isCoach ? "text-white/50" : "text-[var(--muted)]"
                    }`}
                  >
                    {formatPortalDateTime(message.createdAt)}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-6">{message.body}</p>
              </article>
            );
          })
        ) : (
          <div className="rounded-[1.25rem] border border-dashed border-[var(--line)] bg-white/45 px-4 py-5 text-sm leading-6 text-[var(--muted)]">
            {emptyLabel}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-3">
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={4}
          placeholder="Write a message..."
          disabled={!allowSubmit}
          className="w-full rounded-[1.1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className={allowSubmit ? "btn-primary" : "btn-disabled"}
            disabled={!allowSubmit || isSubmitting}
          >
            {allowSubmit ? (isSubmitting ? "Sending..." : "Send message") : "Preview only"}
          </button>
          {status ? <p className="text-sm text-[#8a3c2d]">{status}</p> : null}
        </div>
        {!allowSubmit ? (
          <p className="text-xs leading-6 text-[var(--muted)]">
            Message sending activates after the live backend is connected.
          </p>
        ) : null}
      </form>
    </div>
  );
}
