"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, MapPin, SlidersHorizontal, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { ApiJob, ApiCategory } from "@/lib/fetchers";
import JobCard from "@/components/JobCard";

const jobTypes = [
  { label: "All Types", value: "" },
  { label: "Full Time", value: "FULL_TIME" },
  { label: "Part Time", value: "PART_TIME" },
  { label: "Remote", value: "REMOTE" },
  { label: "Hybrid", value: "HYBRID" },
  { label: "Contract", value: "CONTRACT" },
];

const LIMIT = 12;

type Props = {
  initialJobs: ApiJob[];
  initialTotal: number;
  initialPage: number;
  categories: ApiCategory[];
};

export default function JobsListing({ initialJobs, initialTotal, initialPage, categories }: Props) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [location, setLocation] = useState(searchParams.get("loc") ?? "");
  const [category, setCategory] = useState(searchParams.get("category") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [page, setPage] = useState(initialPage);

  const [jobs, setJobs] = useState<ApiJob[]>(initialJobs);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);

  const totalPages = Math.ceil(total / LIMIT);

  const fetchJobs = useCallback(async (q: string, loc: string, cat: string, t: string, pg: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (loc) params.set("location", loc);
      if (cat) params.set("categoryId", cat);
      if (t) params.set("type", t);
      params.set("page", String(pg));
      params.set("limit", String(LIMIT));

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      setJobs(data.items);
      setTotal(data.total);
    } catch {
      // keep current state on error
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounce the text inputs to avoid hammering the API
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchJobs(query, location, category, type, 1);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, location, category, type, fetchJobs]);

  useEffect(() => {
    fetchJobs(query, location, category, type, page);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function handleCategoryClick(cat: string) {
    setCategory(cat);
    setPage(1);
    // Update URL for shareability
    const params = new URLSearchParams(searchParams.toString());
    if (cat) params.set("category", cat); else params.delete("category");
    router.push(`/jobs?${params.toString()}`, { scroll: false });
  }

  return (
    <div className="container-page py-10">
      <div className="mb-6">
        <h1 className="text-pageH1">Search verified jobs from trusted employers.</h1>
        <p className="text-muted text-sm mt-2">
          {loading ? "Searching…" : `${total} jobs found`}
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl border border-border p-2 flex flex-col sm:flex-row gap-2 mb-8">
        <div className="flex items-center flex-1 gap-2 px-3 py-2.5 rounded-xl">
          <Search className="h-4 w-4 text-muted shrink-0" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Job title, keyword or company"
            className="w-full text-sm text-ink placeholder:text-muted outline-none"
          />
        </div>
        <div className="hidden sm:block w-px bg-border my-1" />
        <div className="flex items-center flex-1 gap-2 px-3 py-2.5 rounded-xl">
          <MapPin className="h-4 w-4 text-muted shrink-0" />
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location (e.g. Addis Ababa)"
            className="w-full text-sm text-ink placeholder:text-muted outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-8">
        {/* Sidebar Filters */}
        <aside className="space-y-6">
          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-ink mb-4">
              <SlidersHorizontal className="h-4 w-4" /> Category
            </h3>
            <div className="space-y-1">
              <button
                onClick={() => handleCategoryClick("")}
                className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                  category === "" ? "bg-brandGreen/10 text-brandGreen font-semibold" : "text-muted hover:bg-pageBg"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`flex w-full items-center justify-between text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                    category === cat.id
                      ? "bg-brandGreen/10 text-brandGreen font-semibold"
                      : "text-muted hover:bg-pageBg"
                  }`}
                >
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-5">
            <h3 className="text-sm font-semibold text-ink mb-4">Job Type</h3>
            <div className="space-y-1">
              {jobTypes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => { setType(t.value); setPage(1); }}
                  className={`block w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                    type === t.value ? "bg-brandGreen/10 text-brandGreen font-semibold" : "text-muted hover:bg-pageBg"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Jobs Grid */}
        <div>
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-brandGreen" />
              <span className="text-sm">Loading jobs…</span>
            </div>
          ) : jobs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-white p-12 text-center">
              <p className="text-ink font-semibold">No jobs match your filters</p>
              <p className="text-sm text-muted mt-1">Try adjusting your search or clearing filters.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
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
                            pg === page
                              ? "bg-brandGreen text-white"
                              : "border border-border text-muted hover:bg-pageBg"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
