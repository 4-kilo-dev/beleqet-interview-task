"use client";

import { useState } from "react";
import { Loader2, ArrowRight } from "lucide-react";

type Props = { jobId: string; jobTitle: string };

export default function JobApplyButton({ jobId, jobTitle }: Props) {
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleApply() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (res.status === 401) {
        window.location.href = `/login?next=/jobs/${jobId}`;
        return;
      }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Failed to apply");
      }
      setApplied(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (applied) {
    return (
      <div className="w-full rounded-full bg-brandGreen/10 border border-brandGreen text-brandGreen text-sm font-semibold py-3 text-center">
        ✓ Application submitted for &ldquo;{jobTitle}&rdquo;
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handleApply}
        disabled={loading}
        className="w-full rounded-full bg-brandGreen text-white text-sm font-semibold py-3 hover:bg-darkGreen disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <>
            Apply Now
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </>
        )}
      </button>
      {error && <p className="text-xs text-red-500 text-center">{error}</p>}
    </div>
  );
}
