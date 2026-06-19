"use client";

import { useRef, useState } from "react";
import { addPlantToCollection } from "@/lib/collectionActions";

export default function AddPlantForm({
  collectionId,
  plants,
}: {
  collectionId: string;
  plants: { id: string; name: string }[];
}) {
  const [selectedId, setSelectedId] = useState(plants[0]?.id ?? "");
  const ref = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    await addPlantToCollection(collectionId, selectedId);
    ref.current?.reset();
  }

  return (
    <form ref={ref} onSubmit={handleSubmit} className="flex gap-2">
      <select
        value={selectedId}
        onChange={e => setSelectedId(e.target.value)}
        className="flex-1 max-w-xs rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm outline-none focus:border-green-600"
      >
        {plants.map(p => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
      </select>
      <button
        type="submit"
        className="rounded-xl bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
      >
        Add plant
      </button>
    </form>
  );
}
