"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase, Users, CheckCircle, XCircle, Clock,
  TrendingUp, Loader2, ArrowRight, Plus, ChevronDown, ChevronUp
} from "lucide-react";

type SessionUser = { id: string; firstName: string; lastName: string; email: string; role: string };

type Application = {
  id: string;
  status: string;
  createdAt: string;
  coverLetter?: string;
  aiScore?: number;
  applicant?: { id: string; firstName: string; lastName: string; email: string };
  job: { id: string; title: string };
};

type JobWithApps = {
  id: string;
  title: string;
  status: string;
  location: string;
  type: string;
  createdAt: string;
  _count?: { applications: number };
};

const statusStyles: Record<string, { label: string; cls: string }> = {
  PENDING: { label: "Pending", cls: "bg-orangeAccent/10 text-orangeAccent" },
  REVIEWING: { label: "Reviewing", cls: "bg-cyanAccent/10 text-cyanAccent" },
  SHORTLISTED: { label: "Shortlisted", cls: "bg-purpleAccent/10 text-purpleAccent" },
  ACCEPTED: { label: "Accepted", cls: "bg-brandGreen/10 text-brandGreen" },
  REJECTED: { label: "Rejected", cls: "bg-redAccent/10 text-redAccent" },
};

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: "Full Time", PART_TIME: "Part Time", REMOTE: "Remote",
  HYBRID: "Hybrid", CONTRACT: "Contract",
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function EmployerDashboardClient({ user }: { user: SessionUser }) {
  const [jobs, setJobs] = useState<JobWithApps[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [expandedJob, setExpandedJob] = useState<string | null>(null);

  useEffect(() => {
    async function loadJobs() {
      setLoading(true);
      try {
        const res = await fetch(`/api/jobs?limit=50`);
        if (res.ok) {
          const d = await res.json();
          setJobs(d.items ?? []);
        }
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, []);

  async function loadApplications(jobId: string) {
    setSelectedJob(jobId);
    try {
      const res = await fetch(`/api/applications?type=job&jobId=${jobId}`);
      if (res.ok) {
        const d = await res.json();
        setApplications(Array.isArray(d) ? d : d.items ?? []);
      }
    } catch { /* ignore */ }
  }

  async function updateStatus(appId: string, status: string) {
    setUpdatingId(appId);
    try {
      await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: appId, status }),
      });
      setApplications((prev) => prev.map((a) => a.id === appId ? { ...a, status } : a));
    } finally {
      setUpdatingId(null);
    }
  }

  const totalApps = jobs.reduce((acc, j) => acc + (j._count?.applications ?? 0), 0);
  const activeJobs = jobs.filter((j) => j.status === "OPEN" || j.status === "ACTIVE").length;
  const closedJobs = jobs.length - activeJobs;

  return (
    <div className="bg-pageBg min-h-[80vh]">
      <div className="container-page py-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-ink">
              Employer Dashboard · <span className="text-brandGreen">{user.firstName}</span>
            </h1>
            <p className="text-muted text-sm mt-1">Manage your job postings and review applicants.</p>
          </div>
          <Link
            href="/post-job"
            className="inline-flex items-center gap-2 rounded-full bg-brandGreen text-white text-sm font-semibold px-5 py-2.5 hover:bg-darkGreen transition-colors"
          >
            <Plus className="h-4 w-4" /> Post a Job
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-brandGreen" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<Briefcase className="h-5 w-5 text-brandGreen" />} label="Total Jobs Posted" value={jobs.length} />
              <StatCard icon={<TrendingUp className="h-5 w-5 text-cyanAccent" />} label="Active Listings" value={activeJobs} />
              <StatCard icon={<Users className="h-5 w-5 text-purpleAccent" />} label="Total Applicants" value={totalApps} />
              <StatCard icon={<Clock className="h-5 w-5 text-orangeAccent" />} label="Closed Jobs" value={closedJobs} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
              {/* Jobs List */}
              <div className="bg-white rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-semibold text-ink flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-brandGreen" /> Your Job Listings
                  </h2>
                  <Link href="/post-job" className="text-xs text-brandGreen hover:underline font-medium flex items-center gap-1">
                    <Plus className="h-3 w-3" /> New Job
                  </Link>
                </div>

                {jobs.length === 0 ? (
                  <div className="text-center py-10 text-muted">
                    <Briefcase className="h-10 w-10 mx-auto mb-3 opacity-20" />
                    <p className="text-sm font-medium">No jobs posted yet</p>
                    <Link href="/post-job" className="inline-block mt-3 text-sm text-brandGreen font-semibold hover:underline">
                      Post your first job →
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {jobs.map((job) => (
                      <div key={job.id} className="rounded-xl border border-border overflow-hidden">
                        <button
                          onClick={() => {
                            setExpandedJob(expandedJob === job.id ? null : job.id);
                            if (expandedJob !== job.id) loadApplications(job.id);
                          }}
                          className="w-full flex items-center justify-between p-4 hover:bg-pageBg transition-colors text-left gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-ink line-clamp-1">{job.title}</p>
                            <p className="text-xs text-muted mt-0.5">
                              {jobTypeLabels[job.type] ?? job.type} · {job.location} · {timeAgo(job.createdAt)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-semibold text-muted bg-pageBg rounded-full px-2.5 py-1">
                              {job._count?.applications ?? 0} applicants
                            </span>
                            <span className={`text-[11px] font-semibold rounded-full px-2 py-0.5 ${
                              job.status === "OPEN" || job.status === "ACTIVE"
                                ? "bg-brandGreen/10 text-brandGreen"
                                : "bg-muted/10 text-muted"
                            }`}>
                              {job.status}
                            </span>
                            {expandedJob === job.id ? <ChevronUp className="h-4 w-4 text-muted" /> : <ChevronDown className="h-4 w-4 text-muted" />}
                          </div>
                        </button>

                        {expandedJob === job.id && (
                          <div className="border-t border-border bg-pageBg/50 p-4">
                            {selectedJob !== job.id ? (
                              <div className="text-center py-3"><Loader2 className="h-5 w-5 animate-spin text-muted mx-auto" /></div>
                            ) : applications.length === 0 ? (
                              <p className="text-xs text-muted text-center py-3">No applications yet for this job.</p>
                            ) : (
                              <div className="space-y-3">
                                {applications.map((app) => {
                                  const s = statusStyles[app.status] ?? { label: app.status, cls: "bg-muted/10 text-muted" };
                                  return (
                                    <div key={app.id} className="bg-white rounded-lg border border-border p-3">
                                      <div className="flex items-start justify-between gap-2">
                                        <div className="min-w-0">
                                          <p className="text-sm font-semibold text-ink">
                                            {app.applicant?.firstName} {app.applicant?.lastName}
                                          </p>
                                          <p className="text-xs text-muted">{app.applicant?.email}</p>
                                          {app.aiScore != null && (
                                            <p className="text-xs text-purpleAccent font-medium mt-0.5">AI Score: {app.aiScore}/100</p>
                                          )}
                                        </div>
                                        <span className={`shrink-0 text-[11px] font-semibold rounded-full px-2.5 py-1 ${s.cls}`}>
                                          {s.label}
                                        </span>
                                      </div>
                                      {app.coverLetter && (
                                        <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">{app.coverLetter}</p>
                                      )}
                                      <div className="flex gap-2 mt-3">
                                        <button
                                          onClick={() => updateStatus(app.id, "SHORTLISTED")}
                                          disabled={updatingId === app.id || app.status === "SHORTLISTED"}
                                          className="flex-1 rounded-full bg-purpleAccent/10 text-purpleAccent text-xs font-semibold py-1.5 hover:bg-purpleAccent/20 disabled:opacity-40 transition-colors flex items-center justify-center gap-1"
                                        >
                                          {updatingId === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <TrendingUp className="h-3 w-3" />}
                                          Shortlist
                                        </button>
                                        <button
                                          onClick={() => updateStatus(app.id, "ACCEPTED")}
                                          disabled={updatingId === app.id || app.status === "ACCEPTED"}
                                          className="flex-1 rounded-full bg-brandGreen/10 text-brandGreen text-xs font-semibold py-1.5 hover:bg-brandGreen/20 disabled:opacity-40 transition-colors flex items-center justify-center gap-1"
                                        >
                                          {updatingId === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle className="h-3 w-3" />}
                                          Accept
                                        </button>
                                        <button
                                          onClick={() => updateStatus(app.id, "REJECTED")}
                                          disabled={updatingId === app.id || app.status === "REJECTED"}
                                          className="flex-1 rounded-full bg-redAccent/10 text-redAccent text-xs font-semibold py-1.5 hover:bg-redAccent/20 disabled:opacity-40 transition-colors flex items-center justify-center gap-1"
                                        >
                                          {updatingId === app.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <XCircle className="h-3 w-3" />}
                                          Reject
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions Sidebar */}
              <aside className="space-y-5">
                <div className="bg-white rounded-2xl border border-border p-6">
                  <h2 className="font-semibold text-ink mb-4">Quick Actions</h2>
                  <div className="space-y-3">
                    <Link
                      href="/post-job"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-pageBg transition-colors group"
                    >
                      <span className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-brandGreen/10 text-brandGreen">
                        <Plus className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink group-hover:text-brandGreen transition-colors">Post a New Job</p>
                        <p className="text-xs text-muted">Find your next hire</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted ml-auto group-hover:text-brandGreen transition-colors" />
                    </Link>
                    <Link
                      href="/jobs"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-pageBg transition-colors group"
                    >
                      <span className="h-9 w-9 inline-flex items-center justify-center rounded-lg bg-cyanAccent/10 text-cyanAccent">
                        <Briefcase className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-ink group-hover:text-brandGreen transition-colors">Browse All Jobs</p>
                        <p className="text-xs text-muted">See the job market</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted ml-auto group-hover:text-brandGreen transition-colors" />
                    </Link>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-gradient-to-br from-primary to-darkGreen rounded-2xl p-6 text-white">
                  <h3 className="font-semibold text-sm mb-1">Hiring Overview</h3>
                  <p className="text-white/60 text-xs mb-4">Performance at a glance</p>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Active Listings</span>
                      <span className="font-bold">{activeJobs}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Total Applications</span>
                      <span className="font-bold">{totalApps}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70">Avg. per job</span>
                      <span className="font-bold">{jobs.length > 0 ? (totalApps / jobs.length).toFixed(1) : "0"}</span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-white rounded-2xl border border-border p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-pageBg">{icon}</span>
        <span className="text-xs text-muted font-medium">{label}</span>
      </div>
      <p className="text-3xl font-extrabold text-ink">{value}</p>
    </div>
  );
}
