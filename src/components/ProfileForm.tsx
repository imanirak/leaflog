"use client";

import { useId, useState, useTransition } from "react";
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

  const usernameId = useId();
  const displayNameId = useId();
  const bioId = useId();
  const avatarId = useId();
  const publicToggleLabelId = useId();

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
        <label htmlFor={avatarId} className="mb-3 block text-sm font-medium text-stone-700">Avatar</label>
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full text-2xl font-semibold text-white" style={{ background: "#3a3f58" }}>
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : <span aria-hidden="true">🌿</span>}
          </div>
          <form action={uploadAvatar}>
            <input
              id={avatarId}
              type="file"
              name="avatar"
              accept="image/*"
              onChange={e => { if (e.target.form) e.target.form.requestSubmit(); }}
              className="text-sm text-stone-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:px-3 file:py-1.5 file:text-xs file:font-medium"
              style={{ "--tw-content": "none" } as React.CSSProperties}
            />
            <style>{`#${avatarId}::file-selector-button { background: var(--orange); color: var(--navy); }`}</style>
          </form>
        </div>
      </div>

      <form action={handleSave} className="space-y-5" noValidate>
        {/* Username */}
        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor={usernameId} className="text-sm font-medium text-stone-700">
              Username <span aria-hidden="true">*</span>
            </label>
            {usernameIsLocked && (
              <span className="text-xs font-medium" style={{ color: "var(--orange-text)" }}>
                <span aria-hidden="true">🔒</span> Can change in {daysUntilUsernameChange} day{daysUntilUsernameChange !== 1 ? "s" : ""}
              </span>
            )}
          </div>
          <div className="flex items-center rounded-xl border border-stone-200 bg-white px-4 focus-within:border-orange-400 focus-within:ring-2 focus-within:ring-orange-100">
            <span className="shrink-0 text-sm text-stone-400" aria-hidden="true">/u/</span>
            <input
              id={usernameId}
              name="username"
              required
              aria-required="true"
              defaultValue={profile?.username ?? ""}
              disabled={usernameIsLocked}
              aria-describedby={`${usernameId}-hint`}
              pattern="[a-z0-9_]+"
              title="Lowercase letters, numbers, and underscores only"
              className="flex-1 bg-transparent py-2.5 text-sm outline-none disabled:text-stone-400"
            />
          </div>
          <p id={`${usernameId}-hint`} className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
            Lowercase letters, numbers, underscores only · Can be changed once every 30 days
          </p>
        </div>

        <div>
          <label htmlFor={displayNameId} className="mb-1.5 block text-sm font-medium text-stone-700">Display name</label>
          <input
            id={displayNameId}
            name="display_name"
            defaultValue={profile?.display_name ?? ""}
            placeholder="e.g. Karina's Plant Shelf"
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
          />
        </div>

        <div>
          <label htmlFor={bioId} className="mb-1.5 block text-sm font-medium text-stone-700">Bio</label>
          <textarea
            id={bioId}
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
            <p id={publicToggleLabelId} className="text-sm font-medium text-stone-800">Public profile</p>
            <p className="text-xs" style={{ color: "var(--muted)" }}>
              {isPublic
                ? "Your profile and shared plant updates are visible to anyone."
                : "Your profile is private — only you can see your plants."}
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            aria-labelledby={publicToggleLabelId}
            onClick={() => setIsPublic(v => !v)}
            className="relative h-6 w-11 shrink-0 rounded-full transition-colors"
            style={{ background: isPublic ? "var(--orange)" : "#6b7280" }}
          >
            <span
              aria-hidden="true"
              className="absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
              style={{ transform: isPublic ? "translateX(20px)" : "translateX(2px)" }}
            />
          </button>
        </div>

        {isPublic && profile?.username && (
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Public profile:{" "}
            <a href={`/u/${profile.username}`} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline" style={{ color: "var(--orange-text)" }}>
              /u/{profile.username}
            </a>
            <span className="sr-only"> (opens in new tab)</span>
          </p>
        )}

        {error && (
          <div role="alert" aria-live="polite" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <p role="status" aria-live="polite" className="sr-only">{saved ? "Profile saved" : ""}</p>

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ background: "var(--orange)", color: "var(--navy)" }}
        >
          {pending ? "Saving…" : saved ? "✓ Saved!" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
