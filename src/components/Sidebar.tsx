"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/app", label: "Library", exact: true, emoji: "🪴" },
  { href: "/app?group=room", label: "Rooms", exact: false, emoji: "🏠" },
  { href: "/app/collections", label: "Collections", exact: false, emoji: "📁" },
  { href: "/app/care-log", label: "Care Log", exact: false, emoji: "📋" },
  { href: "/app/profile", label: "My Profile", exact: false, emoji: "👤" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [profile, setProfile] = useState<{ display_name: string | null; username: string | null; avatar_storage_path: string | null } | null>(null);
  const [plantCount, setPlantCount] = useState(0);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) return;
      const [{ data: p }, { count }] = await Promise.all([
        supabase.from("profiles").select("display_name, username, avatar_storage_path").eq("id", user.id).single(),
        supabase.from("plants").select("id", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      if (p) {
        const prof = p as { display_name: string | null; username: string | null; avatar_storage_path: string | null };
        setProfile(prof);
        if (prof.avatar_storage_path) {
          const { data } = supabase.storage.from("avatars").getPublicUrl(prof.avatar_storage_path);
          setAvatarUrl(data.publicUrl);
        }
      }
      setPlantCount(count ?? 0);
    });
  }, []);

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function isActive(href: string, exact: boolean) {
    if (exact) return pathname === "/app";
    const base = href.split("?")[0];
    return pathname.startsWith(base) && base !== "/app";
  }

  const initials = (profile?.display_name ?? profile?.username ?? "?")[0].toUpperCase();

  return (
    <aside className="flex w-60 shrink-0 flex-col" style={{ background: "var(--navy)", minHeight: "100vh" }}>
      {/* Logo */}
      <div className="px-5 py-6">
        <Link href="/app" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-lg" style={{ background: "var(--orange)" }}>
            🌿
          </div>
          <div>
            <p className="text-sm font-bold text-white">Leaflog</p>
            <p className="text-xs" style={{ color: "#6b7280" }}>plant library</p>
          </div>
        </Link>
      </div>

      {/* Nav section */}
      <div className="px-3 pb-2">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-widest" style={{ color: "#4b5563" }}>Browse</p>
        <div className="space-y-0.5">
          {navItems.map(({ href, label, exact, emoji }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
                style={{
                  background: active ? "var(--navy-light)" : "transparent",
                  color: active ? "#ffffff" : "#9ca3af",
                }}
              >
                <span className="w-5 text-center text-base leading-none">{emoji}</span>
                {label}
                {active && <span className="ml-auto h-1.5 w-1.5 rounded-full" style={{ background: "var(--orange)" }} />}
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex-1" />

      {/* Add plant CTA */}
      <div className="px-4 pb-4">
        <Link
          href="/app/plants/new"
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white shadow-lg transition-all hover:opacity-90 active:scale-95"
          style={{ background: "var(--orange)", boxShadow: "0 4px 14px rgba(249,115,22,0.4)" }}
        >
          + Add a plant
        </Link>
      </div>

      {/* User strip */}
      <div className="border-t px-4 py-4" style={{ borderColor: "var(--navy-border)" }}>
        <div className="flex items-center gap-3">
          <Link href="/app/profile" className="flex min-w-0 flex-1 items-center gap-3 group">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white"
              style={{ background: avatarUrl ? "transparent" : "#374151" }}
            >
              {avatarUrl
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                : initials}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white group-hover:text-orange-400 transition-colors">
                {profile?.display_name ?? profile?.username ?? "My Profile"}
              </p>
              <p className="text-xs" style={{ color: "#6b7280" }}>{plantCount} plant{plantCount !== 1 ? "s" : ""} thriving</p>
            </div>
          </Link>
          <button
            onClick={signOut}
            title="Sign out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
            style={{ color: "#6b7280" }}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
