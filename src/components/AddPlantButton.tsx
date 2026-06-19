import Link from "next/link";

export default function AddPlantButton() {
  return (
    <Link
      href="/app/plants/new"
      className="rounded-xl bg-green-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-green-800"
    >
      + Add plant
    </Link>
  );
}
