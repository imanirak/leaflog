"use client";

import { useRef, useState } from "react";
import { uploadPhoto } from "@/lib/actions";
import { sharePhoto } from "@/lib/profileActions";

export default function PhotoUpload({ plantId }: { plantId: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const [uploading, setUploading] = useState(false);
  const [sharePrompt, setSharePrompt] = useState<{ photoId: string } | null>(null);
  const [shared, setShared] = useState(false);
  const action = uploadPhoto.bind(null, plantId);

  async function handleSubmit(formData: FormData) {
    setUploading(true);
    try {
      const photoId = await action(formData);
      ref.current?.reset();
      if (photoId) setSharePrompt({ photoId });
    } finally {
      setUploading(false);
    }
  }

  async function handleShare() {
    if (!sharePrompt) return;
    await sharePhoto(sharePrompt.photoId, plantId);
    setShared(true);
    setTimeout(() => { setSharePrompt(null); setShared(false); }, 1500);
  }

  return (
    <div>
      <form ref={ref} action={handleSubmit} className="flex flex-wrap items-end gap-2">
        <div className="flex-1 min-w-48">
          <input
            type="file"
            name="file"
            required
            accept="image/*"
            capture="environment"
            className="w-full cursor-pointer rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm text-stone-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-green-50 file:px-3 file:py-1 file:text-xs file:font-medium file:text-green-700"
          />
        </div>
        <input
          name="caption"
          placeholder="Caption (optional)"
          className="flex-1 min-w-36 rounded-xl border border-stone-200 bg-white px-4 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
        />
        <button
          type="submit"
          disabled={uploading}
          className="rounded-xl bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-50"
        >
          {uploading ? "Uploading…" : "Upload"}
        </button>
      </form>

      {/* Share prompt modal */}
      {sharePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            {shared ? (
              <div className="text-center">
                <div className="mb-2 text-3xl">🌟</div>
                <p className="font-medium text-stone-800">Shared to your profile!</p>
              </div>
            ) : (
              <>
                <div className="mb-1 text-2xl">📣</div>
                <h2 className="mb-1 text-lg font-semibold text-stone-900">Share with friends?</h2>
                <p className="mb-5 text-sm text-stone-500">
                  Post this plant update to your public profile so your followers can see it.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleShare}
                    className="flex-1 rounded-xl bg-green-700 py-2.5 text-sm font-medium text-white hover:bg-green-800"
                  >
                    Share to profile
                  </button>
                  <button
                    onClick={() => setSharePrompt(null)}
                    className="flex-1 rounded-xl border border-stone-200 py-2.5 text-sm text-stone-600 hover:bg-stone-50"
                  >
                    Keep private
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
