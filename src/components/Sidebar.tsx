"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/app", label: "All plants", icon: "🪴" },
  { href: "/app/collections", label: "Collections", icon: "📁" },
  { href: "/app/settings/profile", label: "My profile", icon: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <aside className="flex w-56 flex-col border-r border-stone-200 bg-white px-4 py-6">
      <Link href="/app" className="mb-8 flex items-center gap-2 text-lg font-semibold text-stone-900">
        <span>🌿</span> Leaflog
      </Link>
      <nav className="flex-1 space-y-1">
        {nav.map(({ href, label, icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-green-50 font-medium text-green-800"
                  : "text-stone-600 hover:bg-stone-50 hover:text-stone-900"
              }`}
            >
              <span>{icon}</span> {label}
            </Link>
          );
        })}
      </nav>
      <button
        onClick={signOut}
        className="mt-4 rounded-lg px-3 py-2 text-left text-sm text-stone-400 transition-colors hover:bg-stone-50 hover:text-stone-600"
      >
        Sign out
      </button>
    </aside>
  );
}
