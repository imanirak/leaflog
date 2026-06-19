import Link from "next/link";
import { addPlant } from "@/lib/actions";

export default function NewPlantPage() {
  return (
    <div className="mx-auto max-w-lg p-8">
      <Link href="/app" className="mb-6 inline-flex items-center gap-1 text-sm text-stone-400 hover:text-stone-600">
        ← Back
      </Link>
      <h1 className="mb-6 text-2xl font-semibold text-stone-900">Add a plant</h1>
      <form action={addPlant} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">Name *</label>
          <input
            name="name"
            required
            placeholder="e.g. My Monstera"
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">Species</label>
          <input
            name="species"
            placeholder="e.g. Monstera deliciosa"
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">Room / location</label>
          <input
            name="room"
            placeholder="e.g. Living room"
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">Date acquired</label>
          <input
            type="date"
            name="date_acquired"
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">Tags</label>
          <input
            name="tags"
            placeholder="tropical, low-light, propagated"
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
          <p className="mt-1 text-xs text-stone-400">Comma-separated</p>
        </div>
        <div className="flex gap-3">
          <button
            type="submit"
            className="rounded-xl bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800"
          >
            Add plant
          </button>
          <Link
            href="/app"
            className="rounded-xl border border-stone-200 px-5 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
