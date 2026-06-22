"use client";

import { useEffect, useId, useRef, useState } from "react";
import { uploadPhoto } from "@/lib/actions";
import { sharePhoto } from "@/lib/profileActions";

export default function PhotoUpload({ plantId }: { plantId: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [sharePrompt, setSharePrompt] = useState<{ photoId: string } | null>(null);
  const [shared, setShared] = useState(false);
  const action = uploadPhoto.bind(null, plantId);
  const captionId = useId();
  const dialogTitleId = useId();

  useEffect(() => {
    if (sharePrompt && !shared) {
      shareButtonRef.current?.focus();
    }
  }, [sharePrompt, shared]);

  useEffect(() => {
    if (!sharePrompt) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setSharePrompt(null);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [sharePrompt]);

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (fileInputRef.current) {
      fileInputRef.current.files = files;
      setFileName(files[0].name);
    }
  }

  async function handleSubmit(formData: FormData) {
    setUploading(true);
    try {
      const photoId = await action(formData);
      ref.current?.reset();
      setFileName(null);
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
      <form ref={ref} action={handleSubmit} className="space-y-3">
        {/* Drag and drop zone */}
        <label
          onDragOver={e => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-6 py-8 text-center transition-colors"
          style={{
            borderColor: dragOver ? "var(--orange)" : "#ddd5c8",
            background: dragOver ? "var(--orange-light)" : "var(--card)",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            name="file"
            required
            aria-required="true"
            accept="image/*"
            capture="environment"
            onChange={e => setFileName(e.target.files?.[0]?.name ?? null)}
            className="sr-only"
          />
          <span className="text-2xl" aria-hidden="true">{fileName ? "🖼️" : "📷"}</span>
          {fileName ? (
            <p className="text-sm font-medium" style={{ color: "var(--text)" }}>{fileName}</p>
          ) : (
            <>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>Drag a photo here, or click to choose one</p>
              <p className="text-xs" style={{ color: "var(--muted)" }}>JPG, PNG, or HEIC</p>
            </>
          )}
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor={captionId} className="sr-only">Caption (optional)</label>
          <input
            id={captionId}
            name="caption"
            placeholder="Caption (optional)"
            className="flex-1 min-w-36 rounded-xl border bg-white px-4 py-2.5 text-sm outline-none"
            style={{ borderColor: "#ddd5c8" }}
          />
          <button
            type="submit"
            disabled={uploading || !fileName}
            className="rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90 disabled:opacity-40"
            style={{ background: "var(--orange)", color: "var(--navy)" }}
          >
            {uploading ? "Uploading…" : "Upload photo"}
          </button>
        </div>
      </form>

      {/* Share prompt modal */}
      {sharePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
          >
            {shared ? (
              <div className="text-center" role="status">
                <div className="mb-2 text-3xl" aria-hidden="true">🌟</div>
                <p className="font-medium" style={{ color: "var(--text)" }}>Shared to your profile!</p>
              </div>
            ) : (
              <>
                <div className="mb-1 text-2xl" aria-hidden="true">📣</div>
                <h2 id={dialogTitleId} className="mb-1 text-lg font-semibold" style={{ color: "var(--text)" }}>Share with friends?</h2>
                <p className="mb-5 text-sm" style={{ color: "var(--muted)" }}>
                  Post this plant update to your public profile so your followers can see it.
                </p>
                <div className="flex gap-3">
                  <button
                    ref={shareButtonRef}
                    onClick={handleShare}
                    className="flex-1 rounded-xl py-2.5 text-sm font-medium hover:opacity-90"
                    style={{ background: "var(--orange)", color: "var(--navy)" }}
                  >
                    Share to profile
                  </button>
                  <button
                    onClick={() => setSharePrompt(null)}
                    className="flex-1 rounded-xl border py-2.5 text-sm hover:bg-stone-50"
                    style={{ borderColor: "#ddd5c8", color: "var(--text)" }}
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
