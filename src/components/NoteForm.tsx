"use client";

import { useId, useRef } from "react";
import { addNote } from "@/lib/actions";

export default function NoteForm({ plantId }: { plantId: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const action = addNote.bind(null, plantId);
  const fieldId = useId();

  async function handleSubmit(formData: FormData) {
    await action(formData);
    ref.current?.reset();
  }

  return (
    <form ref={ref} action={handleSubmit} className="flex gap-2">
      <label htmlFor={fieldId} className="sr-only">Add a note</label>
      <textarea
        id={fieldId}
        name="body"
        required
        aria-required="true"
        placeholder="Add a note…"
        rows={2}
        className="flex-1 resize-none rounded-xl border bg-white px-4 py-2.5 text-sm outline-none"
        style={{ borderColor: "#cfe3d6" }}
      />
      <button
        type="submit"
        className="self-end rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm hover:opacity-90"
        style={{ background: "var(--orange)", color: "#ffffff" }}
      >
        Save
      </button>
    </form>
  );
}
