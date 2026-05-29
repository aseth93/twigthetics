"use client";

import { useEffect, useState } from "react";

type AdminDocumentFormProps = {
  allowSubmit?: boolean;
  initialMemberId?: string;
  memberName?: string;
  heading?: string;
};

export function AdminDocumentForm({
  allowSubmit = true,
  initialMemberId = "",
  memberName,
  heading = "Upload a client file",
}: AdminDocumentFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [memberIds, setMemberIds] = useState(initialMemberId);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setMemberIds(initialMemberId);
  }, [initialMemberId]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!allowSubmit) {
      setStatus("Preview mode only. Live document uploads start after backend setup.");
      return;
    }

    if (!file) {
      setStatus("Choose a file before uploading.");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus("");

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("memberIds", memberIds);
      formData.append("file", file);

      const response = await fetch("/api/admin/documents", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; message?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || "Unable to upload the document.");
      }

      setTitle("");
      setDescription("");
      setMemberIds(initialMemberId || "");
      setFile(null);
      setStatus(payload?.message || "Document uploaded.");
    } catch (error) {
      setStatus(
        error instanceof Error ? error.message : "Unable to upload the document.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const hasLockedMember = Boolean(initialMemberId);

  return (
    <form onSubmit={handleSubmit} className="surface-panel grid grid-cols-1 gap-4 p-6">
      <div>
        <p className="eyebrow">Documents</p>
        <h3 className="mt-3 text-2xl font-semibold text-[var(--ink)]">{heading}</h3>
        {memberName ? (
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            This upload will be assigned directly to {memberName}.
          </p>
        ) : null}
      </div>

      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Document title"
        disabled={!allowSubmit}
        className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
      <textarea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        rows={4}
        placeholder="What this file is for"
        disabled={!allowSubmit}
        className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
      />
      {hasLockedMember ? (
        <div className="rounded-[1rem] border border-[var(--line)] bg-white/55 px-4 py-3 text-sm text-[var(--muted)]">
          Assigned member ID: {memberIds}
        </div>
      ) : (
        <input
          value={memberIds}
          onChange={(event) => setMemberIds(event.target.value)}
          placeholder="Assigned member IDs, comma separated"
          disabled={!allowSubmit}
          className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none focus:border-[var(--accent)]"
        />
      )}
      <input
        type="file"
        onChange={(event) => setFile(event.target.files?.[0] || null)}
        disabled={!allowSubmit}
        className="w-full rounded-[1rem] border border-[var(--line)] bg-white/80 px-4 py-3 text-[15px] text-[var(--ink)] outline-none file:mr-4 file:rounded-full file:border-0 file:bg-[var(--ink)] file:px-4 file:py-2 file:text-sm file:text-white"
      />
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className={allowSubmit ? "btn-primary" : "btn-disabled"}
          disabled={!allowSubmit || isSubmitting}
        >
          {allowSubmit ? (isSubmitting ? "Uploading..." : "Upload document") : "Preview only"}
        </button>
        {status ? <p className="text-sm text-[var(--muted)]">{status}</p> : null}
      </div>
    </form>
  );
}
