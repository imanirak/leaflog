"use client";

import { useRef } from "react";
import { addNote } from "@/lib/actions";

export default function NoteForm({ plantId }: { plantId: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const action = addNote.bind(null, plantId);

  async function handleSubmit(formData: FormData) {
    await action(formData);
    ref.current?.reset();
  }

  return (
    <form ref={ref} action={handleSubmit} className="flex gap-2">
      <textarea
        name="body"
        required
        placeholder="Add a note…"
        rows={2}
        className="flex-1 resize-none rounded-xl border bg-white px-4 py-2.5 text-sm outline-none"
        style={{ borderColor: "#ddd5c8" }}
      />
      <button
        type="submit"
        className="self-end rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90"
        style={{ background: "var(--orange)" }}
      >
        Save
      </button>
    </form>
  );
}
