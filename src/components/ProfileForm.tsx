"use client";

import { useState, useTransition } from "react";
import { upsertProfile, uploadAvatar } from "@/lib/profileActions";

type Profile = {
  username: string; display_name: string | null;
  bio: string | null; is_public: boolean; avatar_storage_path: string | null;
} | null;

export default function ProfileForm({ profile, avatarUrl }: { profile: Profile; avatarUrl: string | null }) {
  const [isPublic, setIsPublic] = useState(profile?.is_public ?? false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

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
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-green-100 text-2xl">
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
              className="text-sm text-stone-500 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-green-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-green-700"
            />
          </form>
        </div>
      </div>

      {/* Profile fields */}
      <form action={handleSave} className="space-y-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">Username *</label>
          <div className="flex items-center rounded-xl border border-stone-200 bg-white px-4 focus-within:border-green-600 focus-within:ring-2 focus-within:ring-green-100">
            <span className="shrink-0 text-sm text-stone-400">leaflog.vercel.app/u/</span>
            <input
              name="username"
              required
              defaultValue={profile?.username ?? ""}
              pattern="[a-z0-9_]+"
              title="Lowercase letters, numbers, and underscores only"
              className="flex-1 bg-transparent py-2.5 text-sm outline-none"
            />
          </div>
          <p className="mt-1 text-xs text-stone-400">Lowercase letters, numbers, underscores only</p>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">Display name</label>
          <input
            name="display_name"
            defaultValue={profile?.display_name ?? ""}
            placeholder="e.g. Karina's Plant Shelf"
            className="w-full rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-stone-700">Bio</label>
          <textarea
            name="bio"
            defaultValue={profile?.bio ?? ""}
            placeholder="Tell the world about your plant collection…"
            rows={3}
            className="w-full resize-none rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
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
            className={`relative h-6 w-11 rounded-full transition-colors ${isPublic ? "bg-green-600" : "bg-stone-200"}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isPublic ? "translate-x-5" : "translate-x-0.5"}`}
            />
          </button>
        </div>

        {isPublic && profile?.username && (
          <p className="text-xs text-stone-400">
            Your public profile:{" "}
            <a
              href={`/u/${profile.username}`}
              target="_blank"
              className="text-green-700 hover:underline"
            >
              /u/{profile.username}
            </a>
          </p>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-green-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
        >
          {pending ? "Saving…" : saved ? "Saved!" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
