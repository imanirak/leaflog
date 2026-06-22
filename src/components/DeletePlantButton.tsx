"use client";

import { deletePlant } from "@/lib/actions";

export default function DeletePlantButton({ plantId, plantName }: { plantId: string; plantName?: string }) {
  const action = deletePlant.bind(null, plantId);

  async function handleClick() {
    const name = plantName ?? "this plant";
    if (!confirm(`Delete ${name} and all its photos and notes? This cannot be undone.`)) return;
    await action();
  }

  return (
    <button
      onClick={handleClick}
      aria-label={plantName ? `Delete ${plantName}` : "Delete plant"}
      className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-sm text-red-700 hover:bg-red-50"
    >
      Delete
    </button>
  );
}
