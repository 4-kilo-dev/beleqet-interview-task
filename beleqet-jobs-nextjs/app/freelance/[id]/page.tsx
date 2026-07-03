import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, DollarSign, Clock, Users, MapPin, ExternalLink } from "lucide-react";
import { getFreelanceJob } from "@/lib/fetchers";
import BidProposalForm from "@/components/BidProposalForm";

const pricingLabels: Record<string, string> = {
  FIXED: "Fixed Price",
  HOURLY: "Hourly Rate",
};

const experienceLabels: Record<string, string> = {
  ENTRY: "Entry Level",
  INTERMEDIATE: "Intermediate",
  EXPERT: "Expert / Senior",
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

export default async function FreelanceDetailPage({ params }: { params: { id: string } }) {
  let gig;
  try {
    gig = await getFreelanceJob(params.id);
  } catch {
    notFound();
  }

  const budgetStr = gig.budgetMin && gig.budgetMax
    ? `${gig.currency} ${gig.budgetMin.toLocaleString()} – ${gig.budgetMax.toLocaleString()}`
    : gig.budgetMax
    ? `Up to ${gig.currency} ${gig.budgetMax.toLocaleString()}`
    : "Budget TBD";

  return (
    <div className="container-page py-10">
      <Link href="/freelance" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-brandGreen mb-6 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to all gigs
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div className="space-y-5">
          {/* Header */}
          <div className="rounded-2xl border border-border bg-white p-7">
            <div className="flex items-start gap-3 flex-wrap">
              <span className="text-xs font-semibold text-brandGreen bg-brandGreen/10 rounded-full px-3 py-1">
                {gig.category?.label ?? "Freelance"}
              </span>
              {gig.featured && (
                <span className="text-xs font-bold text-orangeAccent bg-orangeAccent/10 rounded-full px-3 py-1">
                  Featured
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-ink mt-3 leading-snug">{gig.title}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted">
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" /> Posted {timeAgo(gig.createdAt)}
              </span>
              {gig._count?.bids !== undefined && (
                <span className="flex items-center gap-1">
                  <Users className="h-3.5 w-3.5" /> {gig._count.bids} proposals submitted
                </span>
              )}
              {gig.locationPreference && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {gig.locationPreference}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="rounded-2xl border border-border bg-white p-7">
            <h2 className="text-sm font-semibold text-ink mb-3">Project Description</h2>
            <p className="text-sm text-muted leading-relaxed whitespace-pre-line">{gig.description}</p>

            {gig.skills && gig.skills.length > 0 && (
              <div className="mt-6 pt-6 border-t border-border">
                <h2 className="text-sm font-semibold text-ink mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {gig.skills.map((skill) => (
                    <span key={skill} className="text-xs font-medium text-brandGreen bg-brandGreen/10 border border-brandGreen/20 rounded-full px-3 py-1">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Posted by */}
          {gig.client && (
            <div className="rounded-2xl border border-border bg-white p-7">
              <h2 className="text-sm font-semibold text-ink mb-1">Posted by</h2>
              <p className="text-sm text-muted">
                {gig.client.firstName} {gig.client.lastName}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* Budget Card */}
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="h-4 w-4 text-brandGreen" />
              <span className="text-xs text-muted font-medium">Budget</span>
            </div>
            <p className="text-xl font-extrabold text-ink">{budgetStr}</p>
            <p className="text-xs text-muted mt-1">{pricingLabels[gig.pricingType] ?? gig.pricingType}</p>

            <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs text-muted">
              {gig.experienceLevel && (
                <div className="flex justify-between">
                  <span>Experience</span>
                  <span className="font-semibold text-ink">{experienceLabels[gig.experienceLevel] ?? gig.experienceLevel}</span>
                </div>
              )}
              {gig.deadlineDays && (
                <div className="flex justify-between">
                  <span>Deadline</span>
                  <span className="font-semibold text-ink">{gig.deadlineDays} days</span>
                </div>
              )}
              {gig.locationPreference && (
                <div className="flex justify-between">
                  <span>Location</span>
                  <span className="font-semibold text-ink">{gig.locationPreference}</span>
                </div>
              )}
            </div>
          </div>

          {/* Submit Proposal */}
          <div className="rounded-2xl border border-brandGreen/20 bg-white p-6">
            <h3 className="text-sm font-semibold text-ink mb-4 flex items-center gap-2">
              <ExternalLink className="h-4 w-4 text-brandGreen" />
              Submit a Proposal
            </h3>
            <BidProposalForm gigId={gig.id} currency={gig.currency} />
          </div>
        </aside>
      </div>
    </div>
  );
}
