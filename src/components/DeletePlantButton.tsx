"use client";

import { deletePlant } from "@/lib/actions";

export default function DeletePlantButton({ plantId }: { plantId: string }) {
  const action = deletePlant.bind(null, plantId);

  async function handleClick() {
    if (!confirm("Delete this plant and all its photos and notes? This cannot be undone.")) return;
    await action();
  }

  return (
    <button
      onClick={handleClick}
      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm text-red-500 hover:bg-red-50"
    >
      Delete
    </button>
  );
}
