"use client";

import { useState, useTransition } from "react";
import { upsertProfile, uploadAvatar } from "@/lib/profileActions";

type Profile = {
  username: string; display_name: string | null;
  bio: string | null; is_public: boolean; avatar_storage_path: string | null;
  username_changed_at: string | null;
} | null;

export default function ProfileForm({
  profile,
  avatarUrl,
  daysUntilUsernameChange = 0,
}: {
  profile: Profile;
  avatarUrl: string | null;
  daysUntilUsernameChange?: number;
}) {
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const usernameIsLocked = daysUntilUsernameChange > 0;

  async function handleSave(formData: FormData) {
    formData.set("is_public", isPublic ? "true" : "false");
    setError(null);
    startTransition(async () => {
      try {
        await upsertProfile(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="space-y-8">
      {/* Avatar */}
      <div>
        <p className="mb-3 text-sm font-medium text-stone-700">Avatar</p>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full text-2xl font-semibold text-white" style={{ background: "#3a3f58" }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="Avatar" className="h-full w-full object-cover" />
            ) : "🌿"}
          </div>
          <form action={uploadAvatar}>
            <input
              type="file"
              name="avatar"
              accept="image/*"
              onChange={e => { if (e.target.form) e.target.form.requestSubmit(); }}
              className="text-sm text-stone-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white"
              style={{ ["--file-bg" as string]: "var(--orange)" }}
            />
          </form>
        </div>
      </div>

      <form action={handleSave} className="space-y-5">
        {/* Username */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-sm font-medium text-stone-700">Username *</label>
            {usernameIsLocked && (
              <span className="text-xs text-amber-600">
                🔒 Can change in {daysUntilUsernameChange} day{daysUntilUsernameChange !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center rounded-xl border border-stone-200 bg-white px-4 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100">
            <span className="shrink-0 text-sm text-stone-400">/u/</span>
            <input
              name="username"
              required
              defaultValue={profile?.username ?? ""}
              disabled={usernameIsLocked}
              pattern="[a-z0-9_]+"
              title="Lowercase letters, numbers, and underscores only"
              className="flex-1 bg-transparent py-2.5 text-sm outline-none disabled:text-stone-400"
            />
          </div>
          <p className="mt-1 text-xs text-stone-400">
            Lowercase letters, numbers, underscores only · Can be changed once every 30 days
          </p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">Display name</label>
          <input
            name="display_name"
            defaultValue={profile?.display_name ?? ""}
            placeholder="e.g. Karina's Plant Shelf"
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">Bio</label>
          <textarea
            name="bio"
            defaultValue={profile?.bio ?? ""}
            placeholder="Tell the world about your plant collection…"
            rows={3}
            className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        {/* Privacy toggle */}
        <div className="flex items-center justify-between rounded-xl border border-stone-200 bg-white px-5 py-4">
          <div>
            <p className="text-sm font-medium text-stone-800">Public profile</p>
            <p className="text-xs text-stone-400">
              {isPublic
                ? "Your profile and shared plant updates are visible to anyone."
                : "Your profile is private — only you can see your plants."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsPublic(v => !v)}
            className="relative h-6 w-11 rounded-full transition-colors"
            style={{ background: isPublic ? "var(--orange)" : "#d1d5db" }}
          >
            <span
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: isPublic ? "translateX(20px)" : "translateX(2px)" }}
            />
          </button>
        </div>

        {isPublic && profile?.username && (
          <p className="text-xs text-stone-400">
            Public profile:{" "}
            <a href={`/u/${profile.username}`} target="_blank" className="text-orange-500 hover:underline">
              /u/{profile.username}
            </a>
          </p>
        )}

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--orange)" }}
        >
          {pending ? "Saving…" : saved ? "✓ Saved!" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
