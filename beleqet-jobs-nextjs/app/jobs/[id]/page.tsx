import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, Clock, Building2, ArrowLeft, DollarSign, Users, ExternalLink } from "lucide-react";
import { getJob, getJobs } from "@/lib/fetchers";
import JobApplyButton from "@/components/JobApplyButton";

const typeLabels: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  REMOTE: "Remote",
  HYBRID: "Hybrid",
  CONTRACT: "Contract",
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
}

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  let job;
  try {
    job = await getJob(params.id);
  } catch {
    notFound();
  }

  let related: import("@/lib/fetchers").ApiJob[] = [];
  try {
    const relData = await getJobs({ categoryId: job.category?.id ?? "", limit: 4 });
    related = relData.items.filter((j) => j.id !== job.id).slice(0, 3);
  } catch {
    related = [];
  }

  const hasSalary = job.salaryMin || job.salaryMax;

  return (
    <div className="container-page py-10">
      <Link href="/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brandGreen mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to all jobs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-5">
          {/* Header Card */}
          <div className="rounded-2xl border border-border bg-white p-7">
            <div className="flex items-start gap-4">
              {job.company?.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={job.company.logoUrl}
                  alt={job.company.name}
                  className="h-14 w-14 rounded-xl object-contain bg-pageBg p-1 shrink-0"
                />
              ) : (
                <span className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-pageBg text-muted shrink-0">
                  <Building2 className="h-6 w-6" />
                </span>
              )}
              <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl font-extrabold text-ink leading-snug">{job.title}</h1>
                <p className="text-muted mt-1 font-medium">{job.company?.name}</p>
                <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-muted">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" /> {timeAgo(job.createdAt)}
                  </span>
                  {hasSalary && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5" />
                      {job.salaryMin?.toLocaleString()} – {job.salaryMax?.toLocaleString()} {job.currency}/mo
                    </span>
                  )}
                  {job._count?.applications !== undefined && (
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {job._count.applications} applicants
                    </span>
                  )}
                  <span className="rounded-full bg-brandGreen/10 text-brandGreen font-semibold px-2.5 py-1">
                    {typeLabels[job.type] ?? job.type}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-border bg-white p-7">
            <h2 className="text-sm font-semibold text-ink mb-3">Job Description</h2>
            <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{job.description}</p>

            {job.requirements && (
              <div className="mt-6 pt-6 border-t border-border">
                <h2 className="text-sm font-semibold text-ink mb-3">Requirements</h2>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{job.requirements}</p>
              </div>
            )}

            {job.tags && job.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span key={tag} className="text-xs font-medium text-muted bg-pageBg border border-border rounded-full px-3 py-1">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Company Info */}
          {(job.company?.description || job.company?.industry || job.company?.website) && (
            <div className="rounded-2xl border border-border bg-white p-7">
              <h2 className="text-sm font-semibold text-ink mb-3">About {job.company.name}</h2>
              {job.company.industry && (
                <p className="text-xs text-brandGreen font-medium mb-2">{job.company.industry}</p>
              )}
              {job.company.description && (
                <p className="text-sm text-muted leading-relaxed">{job.company.description}</p>
              )}
              {job.company.website && (
                <a
                  href={job.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-brandGreen font-medium mt-3 hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Visit website
                </a>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-border bg-white p-6 sticky top-24">
            <JobApplyButton jobId={job.id} jobTitle={job.title} />
            <button className="w-full rounded-full border border-border text-ink text-sm font-semibold py-3 mt-2 hover:bg-pageBg transition-colors">
              Save Job
            </button>

            {/* Quick Stats */}
            <div className="mt-5 pt-5 border-t border-border space-y-3 text-xs text-muted">
              <div className="flex justify-between">
                <span>Job Type</span>
                <span className="font-semibold text-ink">{typeLabels[job.type] ?? job.type}</span>
              </div>
              <div className="flex justify-between">
                <span>Location</span>
                <span className="font-semibold text-ink">{job.location}</span>
              </div>
              {job.category && (
                <div className="flex justify-between">
                  <span>Category</span>
                  <span className="font-semibold text-ink">{job.category.label}</span>
                </div>
              )}
              {hasSalary && (
                <div className="flex justify-between">
                  <span>Salary</span>
                  <span className="font-semibold text-ink">
                    {job.salaryMin?.toLocaleString()}–{job.salaryMax?.toLocaleString()} {job.currency}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Posted</span>
                <span className="font-semibold text-ink">{timeAgo(job.createdAt)}</span>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div className="rounded-2xl border border-border bg-white p-6">
              <h3 className="text-sm font-semibold text-ink mb-4">Similar Jobs</h3>
              <div className="space-y-3">
                {related.map((r) => (
                  <Link
                    key={r.id}
                    href={`/jobs/${r.id}`}
                    className="block rounded-lg hover:bg-pageBg p-2 -mx-2 transition-colors"
                  >
                    <p className="text-sm font-semibold text-ink line-clamp-1">{r.title}</p>
                    <p className="text-xs text-muted mt-0.5">{r.company?.name} · {r.location}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
