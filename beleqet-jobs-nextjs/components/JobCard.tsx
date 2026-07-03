import Link from "next/link";
import { MapPin, Bookmark, Building2 } from "lucide-react";
import type { ApiJob } from "@/lib/fetchers";

const typeStyles: Record<string, string> = {
  FULL_TIME: "bg-brandGreen/10 text-brandGreen",
  PART_TIME: "bg-purpleAccent/10 text-purpleAccent",
  REMOTE: "bg-cyanAccent/10 text-cyanAccent",
  HYBRID: "bg-orangeAccent/10 text-orangeAccent",
  CONTRACT: "bg-redAccent/10 text-redAccent",
};

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
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  return weeks === 1 ? "1w ago" : `${weeks}w ago`;
}

export default function JobCard({ job }: { job: ApiJob }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="group flex flex-col rounded-xl border border-border bg-white p-5 hover:border-brandGreen hover:shadow-card transition-all"
    >
      <div className="flex items-start justify-between">
        {job.company?.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={job.company.logoUrl}
            alt={job.company.name}
            className="h-10 w-10 rounded-lg object-contain bg-pageBg p-1"
          />
        ) : (
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-pageBg text-muted">
            <Building2 className="h-5 w-5" />
          </span>
        )}
        <Bookmark className="h-4 w-4 text-muted/50 group-hover:text-brandGreen transition-colors" />
      </div>

      <h3 className="text-cardH3 mt-3 text-ink leading-snug line-clamp-2">{job.title}</h3>
      <p className="text-sm text-muted mt-1">{job.company?.name}</p>

      <div className="flex items-center gap-1 text-xs text-muted mt-2">
        <MapPin className="h-3.5 w-3.5" />
        {job.location}
      </div>

      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
        <span
          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
            typeStyles[job.type] ?? "bg-muted/10 text-muted"
          }`}
        >
          {typeLabels[job.type] ?? job.type}
        </span>
        <span className="text-[11px] text-muted">{timeAgo(job.createdAt)}</span>
      </div>
    </Link>
  );
}
