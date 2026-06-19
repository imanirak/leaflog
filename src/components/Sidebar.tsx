"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

const navItems = [
  { href: "/app", label: "Library", exact: true },
  { href: "/app?group=room", label: "Rooms", exact: false },
  { href: "/app/collections", label: "Collections", exact: false },
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
        setProfile(p as { display_name: string | null; username: string | null; avatar_storage_path: string | null });
        if ((p as { avatar_storage_path: string | null }).avatar_storage_path) {
          const { data } = supabase.storage.from("avatars").getPublicUrl((p as { avatar_storage_path: string }).avatar_storage_path);
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
    return pathname.startsWith(href.split("?")[0]) && href !== "/app";
  }

  return (
    <aside className="flex w-60 shrink-0 flex-col" style={{ background: "var(--navy)", minHeight: "100vh" }}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-8">
        <Link href="/app" className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-lg" style={{ background: "var(--orange)" }}>
            🌿
          </div>
          <div>
            <p className="text-sm font-semibold text-white leading-tight">Leaflog</p>
            <p className="text-xs" style={{ color: "#8b8fa8" }}>plant library</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3">
        <p className="mb-2 px-3 text-xs font-medium uppercase tracking-widest" style={{ color: "#5a5f78" }}>Browse</p>
        <div className="space-y-0.5">
          {navItems.map(({ href, label, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={label}
                href={href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
                style={{
                  background: active ? "var(--navy-light)" : "transparent",
                  color: active ? "#ffffff" : "#8b8fa8",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: active ? "var(--orange)" : "transparent", border: active ? "none" : "1px solid #5a5f78" }}
                />
                {label}
              </Link>
            );
          })}

          {/* Care log — coming soon */}
          <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm cursor-not-allowed" style={{ color: "#5a5f78" }}>
            <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ border: "1px solid #5a5f78" }} />
            Care log
            <span className="ml-auto rounded-full px-2 py-0.5 text-xs font-medium" style={{ background: "#2a2e42", color: "#8b8fa8" }}>
              SOON
            </span>
          </div>
        </div>
      </nav>

      {/* Add a plant */}
      <div className="px-4 pb-4">
        <Link
          href="/app/plants/new"
          className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: "var(--orange)" }}
        >
          + Add a plant
        </Link>
      </div>

      {/* User info */}
      <div className="border-t px-4 py-4" style={{ borderColor: "#2a2e42" }}>
        <div className="flex items-center gap-3">
          <Link href="/app/profile" className="flex items-center gap-3 flex-1 min-w-0 group">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-semibold text-white" style={{ background: "#3a3f58" }}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                (profile?.display_name ?? profile?.username ?? "?")[0].toUpperCase()
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white group-hover:text-orange-400 transition-colors">
                {profile?.display_name ?? profile?.username ?? "My profile"}
              </p>
              <p className="text-xs" style={{ color: "#5a5f78" }}>{plantCount} plant{plantCount !== 1 ? "s" : ""} thriving</p>
            </div>
          </Link>
          <button onClick={signOut} title="Sign out" className="shrink-0 text-xs transition-colors hover:text-red-400" style={{ color: "#5a5f78" }}>
            ↩
          </button>
        </div>
      </div>
    </aside>
  );
}
