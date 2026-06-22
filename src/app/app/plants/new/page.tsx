import Link from "next/link";
import { addPlant } from "@/lib/actions";

const inputClass = "w-full rounded-xl border bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-orange-400";
const inputStyle = { borderColor: "#ddd5c8" };

export default function NewPlantPage() {
  return (
    <div className="mx-auto max-w-lg p-8">
      <Link href="/app" className="mb-6 inline-flex items-center gap-1 text-sm" style={{ color: "var(--muted)" }}>
        <span aria-hidden="true">←</span> Back
      </Link>
      <h1 className="mb-6 text-2xl font-bold" style={{ color: "var(--text)", fontFamily: "var(--font-display)" }}>Add a plant</h1>
      <form action={addPlant} className="space-y-5" noValidate>
        <div>
          <label htmlFor="plant-name" className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text)" }}>
            Name <span aria-hidden="true">*</span>
          </label>
          <input id="plant-name" name="name" required aria-required="true" placeholder="e.g. My Monstera" className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="plant-species" className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text)" }}>Species</label>
          <input id="plant-species" name="species" placeholder="e.g. Monstera deliciosa" className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="plant-room" className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text)" }}>Room / location</label>
          <input id="plant-room" name="room" placeholder="e.g. Living room" className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="plant-date" className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text)" }}>Date acquired</label>
          <input id="plant-date" type="date" name="date_acquired" className={inputClass} style={inputStyle} />
        </div>
        <div>
          <label htmlFor="plant-tags" className="mb-1.5 block text-sm font-medium" style={{ color: "var(--text)" }}>Tags</label>
          <input id="plant-tags" name="tags" aria-describedby="plant-tags-hint" placeholder="tropical, low-light, propagated" className={inputClass} style={inputStyle} />
          <p id="plant-tags-hint" className="mt-1 text-xs" style={{ color: "var(--muted)" }}>Comma-separated</p>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
            style={{ background: "var(--orange)", color: "var(--navy)" }}
          >
            Add plant
          </button>
          <Link
            href="/app"
            className="rounded-xl border px-5 py-2.5 text-sm hover:bg-stone-50"
            style={{ borderColor: "#ddd5c8", color: "var(--text)" }}
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
