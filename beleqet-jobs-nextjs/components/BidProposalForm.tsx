"use client";

import { useState } from "react";
import { Loader2, Send } from "lucide-react";

type Props = { gigId: string; currency: string };

export default function BidProposalForm({ gigId, currency }: Props) {
  const [amount, setAmount] = useState("");
  const [days, setDays] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/freelance/jobs/${gigId}/bids`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          deliveryDays: Number(days),
          coverLetter,
        }),
      });
      if (res.status === 401) {
        window.location.href = `/login?next=/freelance/${gigId}`;
        return;
      }
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Failed to submit proposal");
      }
      setSuccess(true);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center py-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-brandGreen/10 text-brandGreen mb-3">
          <Send className="h-5 w-5" />
        </div>
        <p className="text-sm font-semibold text-ink">Proposal submitted!</p>
        <p className="text-xs text-muted mt-1">The client will review your bid and reach out.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5 uppercase tracking-wider">
            Your Bid ({currency})
          </label>
          <input
            type="number"
            required
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="e.g. 5000"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted outline-none focus:border-brandGreen focus:ring-1 focus:ring-brandGreen transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-ink mb-1.5 uppercase tracking-wider">
            Delivery (days)
          </label>
          <input
            type="number"
            required
            min={1}
            value={days}
            onChange={(e) => setDays(e.target.value)}
            placeholder="e.g. 14"
            className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted outline-none focus:border-brandGreen focus:ring-1 focus:ring-brandGreen transition-all"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-ink mb-1.5 uppercase tracking-wider">
          Cover Letter
        </label>
        <textarea
          required
          rows={5}
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Explain why you're the best fit for this project…"
          className="w-full rounded-xl border border-border px-3 py-2.5 text-sm text-ink placeholder:text-muted outline-none focus:border-brandGreen focus:ring-1 focus:ring-brandGreen transition-all resize-none"
        />
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-full bg-brandGreen text-white text-sm font-semibold py-3 hover:bg-darkGreen disabled:opacity-50 transition-all flex items-center justify-center gap-2"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Submit Proposal</>}
      </button>
    </form>
  );
}
