"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Search, DollarSign, Clock, Users, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import type { FreelanceJob } from "@/lib/fetchers";

const LIMIT = 12;

const pricingLabels: Record<string, string> = {
  FIXED: "Fixed Price",
  HOURLY: "Hourly",
};

const experienceLevels: Record<string, string> = {
  ENTRY: "Entry Level",
  INTERMEDIATE: "Intermediate",
  EXPERT: "Expert",
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1w ago" : `${weeks}w ago`;
}

type Props = {
  initialItems: FreelanceJob[];
  initialTotal: number;
  initialPage: number;
};

export default function FreelanceListing({ initialItems, initialTotal, initialPage }: Props) {
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<FreelanceJob[]>(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [page, setPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / LIMIT);

  const fetchGigs = useCallback(async (q: string, pg: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pg), limit: String(LIMIT) });
      if (q) params.set("q", q);
      const res = await fetch(`/api/freelance/jobs?${params.toString()}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setItems(data.items ?? []);
      setTotal(data.total ?? 0);
    } catch {
      // keep current state
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchGigs(query, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, fetchGigs]);

  useEffect(() => {
    fetchGigs(query, page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="container-page py-10">
      {/* Search */}
      <div className="bg-white rounded-2xl border border-border p-2 flex gap-2 mb-8">
        <div className="flex items-center flex-1 gap-2 px-3 py-2.5 rounded-xl">
          <Search className="h-4 w-4 text-muted shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search gigs by title or skill…"
            className="w-full text-sm text-ink placeholder:text-muted outline-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-muted">{loading ? "Searching…" : `${total} gigs found`}</p>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted gap-3">
          <Loader2 className="h-7 w-7 animate-spin text-brandGreen" />
          <span className="text-sm">Loading gigs…</span>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
          <p className="text-ink font-semibold">No gigs match your search</p>
          <p className="text-sm text-muted mt-1">Try a different keyword or check back later.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((gig) => (
            <GigCard key={gig.id} gig={gig} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-2 rounded-lg border border-border text-muted hover:bg-pageBg disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((pg) => pg === 1 || pg === totalPages || Math.abs(pg - page) <= 1)
            .map((pg, idx, arr) => (
              <span key={pg} className="flex items-center gap-2">
                {idx > 0 && arr[idx - 1] !== pg - 1 && <span className="text-muted text-sm">…</span>}
                <button
                  onClick={() => setPage(pg)}
                  className={`h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
                    pg === page ? "bg-brandGreen text-white" : "border border-border text-muted hover:bg-pageBg"
                  }`}
                >
                  {pg}
                </button>
              </span>
            ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-border text-muted hover:bg-pageBg disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function GigCard({ gig }: { gig: FreelanceJob }) {
  const budgetStr = gig.budgetMin && gig.budgetMax
    ? `${gig.currency} ${gig.budgetMin.toLocaleString()} – ${gig.budgetMax.toLocaleString()}`
    : gig.budgetMax
    ? `Up to ${gig.currency} ${gig.budgetMax.toLocaleString()}`
    : "Budget TBD";

  return (
    <Link
      href={`/freelance/${gig.id}`}
      className="group flex flex-col rounded-xl border border-border bg-white p-6 hover:border-brandGreen hover:shadow-card transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span className="text-[11px] font-semibold text-brandGreen bg-brandGreen/10 rounded-full px-2.5 py-0.5">
            {gig.category?.label ?? "Freelance"}
          </span>
          <h3 className="text-cardH3 mt-2 text-ink leading-snug line-clamp-2 group-hover:text-brandGreen transition-colors">
            {gig.title}
          </h3>
        </div>
        {gig.featured && (
          <span className="shrink-0 text-[10px] font-bold text-orangeAccent bg-orangeAccent/10 rounded-full px-2 py-0.5">
            Featured
          </span>
        )}
      </div>

      <p className="text-xs text-muted mt-3 line-clamp-3 leading-relaxed">{gig.description}</p>

      {gig.skills && gig.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-4">
          {gig.skills.slice(0, 4).map((skill) => (
            <span key={skill} className="text-[10px] font-medium text-muted bg-pageBg border border-border rounded-full px-2 py-0.5">
              {skill}
            </span>
          ))}
          {gig.skills.length > 4 && (
            <span className="text-[10px] text-muted">+{gig.skills.length - 4}</span>
          )}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1 text-xs font-semibold text-ink">
          <DollarSign className="h-3.5 w-3.5 text-brandGreen" />
          {budgetStr}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted">
          {gig._count?.bids !== undefined && (
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {gig._count.bids} bids
            </span>
          )}
          {gig.deadlineDays && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> {gig.deadlineDays}d deadline
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-2 text-[11px] text-muted">
        <span>
          {pricingLabels[gig.pricingType] ?? gig.pricingType}
          {gig.experienceLevel ? ` · ${experienceLevels[gig.experienceLevel] ?? gig.experienceLevel}` : ""}
        </span>
        <span>{timeAgo(gig.createdAt)}</span>
      </div>
    </Link>
  );
}
