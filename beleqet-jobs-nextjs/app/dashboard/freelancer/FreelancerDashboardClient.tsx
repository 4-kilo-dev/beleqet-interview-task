"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, Briefcase, Send, Clock, CheckCircle, XCircle, Loader2, ArrowRight, TrendingUp } from "lucide-react";

type SessionUser = { id: string; firstName: string; lastName: string; email: string; role: string };

type Application = {
  id: string;
  status: string;
  createdAt: string;
  job: { id: string; title: string; company?: { name: string } };
};

type Bid = {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
  deliveryDays: number;
  freelanceJob: { id: string; title: string };
};

type WalletData = { balance: number; currency: string; transactions?: Array<{ id: string; amount: number; type: string; createdAt: string; description?: string }> };

const statusStyles: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  PENDING: { label: "Pending", cls: "bg-orangeAccent/10 text-orangeAccent", icon: <Clock className="h-3 w-3" /> },
  REVIEWING: { label: "Reviewing", cls: "bg-cyanAccent/10 text-cyanAccent", icon: <Clock className="h-3 w-3" /> },
  SHORTLISTED: { label: "Shortlisted", cls: "bg-purpleAccent/10 text-purpleAccent", icon: <TrendingUp className="h-3 w-3" /> },
  ACCEPTED: { label: "Accepted", cls: "bg-brandGreen/10 text-brandGreen", icon: <CheckCircle className="h-3 w-3" /> },
  REJECTED: { label: "Rejected", cls: "bg-redAccent/10 text-redAccent", icon: <XCircle className="h-3 w-3" /> },
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "1d ago";
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function FreelancerDashboardClient({ user }: { user: SessionUser }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [appsRes, bidsRes, walletRes] = await Promise.all([
          fetch("/api/applications?type=my"),
          fetch("/api/freelance/my-bids"),
          fetch("/api/wallet"),
        ]);
        if (appsRes.ok) {
          const d = await appsRes.json();
          setApplications(Array.isArray(d) ? d : d.items ?? []);
        }
        if (bidsRes.ok) {
          const d = await bidsRes.json();
          setBids(Array.isArray(d) ? d : d.items ?? []);
        }
        if (walletRes.ok) {
          setWallet(await walletRes.json());
        }
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const acceptedApps = applications.filter((a) => a.status === "ACCEPTED").length;
  const pendingApps = applications.filter((a) => a.status === "PENDING" || a.status === "REVIEWING").length;
  const activeBids = bids.filter((b) => b.status === "PENDING" || b.status === "ACCEPTED").length;

  return (
    <div className="bg-pageBg min-h-[80vh]">
      <div className="container-page py-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-ink">
            Welcome back, <span className="text-brandGreen">{user.firstName}</span> 👋
          </h1>
          <p className="text-muted text-sm mt-1">Here&apos;s an overview of your job applications and freelance bids.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-brandGreen" />
          </div>
        ) : (
          <>
            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={<Briefcase className="h-5 w-5 text-brandGreen" />} label="Total Applications" value={applications.length} />
              <StatCard icon={<CheckCircle className="h-5 w-5 text-brandGreen" />} label="Accepted" value={acceptedApps} />
              <StatCard icon={<Clock className="h-5 w-5 text-orangeAccent" />} label="Under Review" value={pendingApps} />
              <StatCard icon={<Send className="h-5 w-5 text-cyanAccent" />} label="Active Bids" value={activeBids} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
              <div className="space-y-6">
                {/* Applications */}
                <div className="bg-white rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold text-ink flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-brandGreen" /> Job Applications
                    </h2>
                    <Link href="/jobs" className="text-xs text-brandGreen hover:underline font-medium flex items-center gap-1">
                      Browse jobs <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  {applications.length === 0 ? (
                    <div className="text-center py-8 text-muted">
                      <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">You haven&apos;t applied to any jobs yet.</p>
                      <Link href="/jobs" className="inline-block mt-3 text-sm text-brandGreen font-medium hover:underline">
                        Find jobs →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {applications.slice(0, 8).map((app) => {
                        const s = statusStyles[app.status] ?? { label: app.status, cls: "bg-muted/10 text-muted", icon: null };
                        return (
                          <div key={app.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-pageBg transition-colors gap-3">
                            <div className="min-w-0">
                              <Link href={`/jobs/${app.job.id}`} className="text-sm font-semibold text-ink hover:text-brandGreen line-clamp-1">
                                {app.job.title}
                              </Link>
                              <p className="text-xs text-muted mt-0.5">{app.job.company?.name ?? "—"} · {timeAgo(app.createdAt)}</p>
                            </div>
                            <span className={`shrink-0 inline-flex items-center gap-1 text-[11px] font-semibold rounded-full px-2.5 py-1 ${s.cls}`}>
                              {s.icon}{s.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Bids */}
                <div className="bg-white rounded-2xl border border-border p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-semibold text-ink flex items-center gap-2">
                      <Send className="h-4 w-4 text-cyanAccent" /> Freelance Proposals
                    </h2>
                    <Link href="/freelance" className="text-xs text-brandGreen hover:underline font-medium flex items-center gap-1">
                      Browse gigs <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>

                  {bids.length === 0 ? (
                    <div className="text-center py-8 text-muted">
                      <Send className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">No proposals submitted yet.</p>
                      <Link href="/freelance" className="inline-block mt-3 text-sm text-brandGreen font-medium hover:underline">
                        Find gigs →
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {bids.slice(0, 6).map((bid) => (
                        <div key={bid.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-pageBg transition-colors gap-3">
                          <div className="min-w-0">
                            <Link href={`/freelance/${bid.freelanceJob.id}`} className="text-sm font-semibold text-ink hover:text-brandGreen line-clamp-1">
                              {bid.freelanceJob.title}
                            </Link>
                            <p className="text-xs text-muted mt-0.5">
                              {bid.currency} {bid.amount.toLocaleString()} · {bid.deliveryDays}d delivery · {timeAgo(bid.createdAt)}
                            </p>
                          </div>
                          <span className={`shrink-0 text-[11px] font-semibold rounded-full px-2.5 py-1 ${
                            bid.status === "ACCEPTED" ? "bg-brandGreen/10 text-brandGreen" :
                            bid.status === "REJECTED" ? "bg-redAccent/10 text-redAccent" :
                            "bg-orangeAccent/10 text-orangeAccent"
                          }`}>
                            {bid.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Wallet */}
              <aside className="space-y-5">
                <WalletCard wallet={wallet} />
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

function WalletCard({ wallet }: { wallet: WalletData | null }) {
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [amount, setAmount] = useState("");
  const [withdrawing, setWithdrawing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleWithdraw(e: React.FormEvent) {
    e.preventDefault();
    setWithdrawing(true);
    try {
      const res = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: Number(amount) }),
      });
      const d = await res.json();
      setMessage(res.ok ? "Withdrawal initiated successfully!" : d.message ?? "Withdrawal failed");
      if (res.ok) setShowWithdraw(false);
    } finally {
      setWithdrawing(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-border p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="h-5 w-5 text-brandGreen" />
        <h2 className="font-semibold text-ink">My Wallet</h2>
      </div>

      {wallet ? (
        <>
          <p className="text-3xl font-extrabold text-ink">
            {wallet.currency} {(wallet.balance ?? 0).toLocaleString()}
          </p>
          <p className="text-xs text-muted mt-1">Available balance</p>

          <button
            onClick={() => setShowWithdraw(!showWithdraw)}
            className="w-full mt-5 rounded-full bg-brandGreen text-white text-sm font-semibold py-2.5 hover:bg-darkGreen transition-colors"
          >
            Withdraw Funds
          </button>

          {showWithdraw && (
            <form onSubmit={handleWithdraw} className="mt-4 space-y-3">
              <input
                type="number"
                required
                min={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount to withdraw"
                className="w-full rounded-xl border border-border px-3 py-2.5 text-sm outline-none focus:border-brandGreen transition-all"
              />
              <button
                type="submit"
                disabled={withdrawing}
                className="w-full rounded-full bg-darkGreen text-white text-sm py-2.5 font-semibold hover:opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2"
              >
                {withdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Confirm Withdrawal"}
              </button>
            </form>
          )}
          {message && <p className="text-xs text-center mt-2 text-muted">{message}</p>}

          {/* Recent Transactions */}
          {wallet.transactions && wallet.transactions.length > 0 && (
            <div className="mt-5 pt-5 border-t border-border">
              <h3 className="text-xs font-semibold text-ink mb-3">Recent Transactions</h3>
              <div className="space-y-2.5">
                {wallet.transactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between text-xs">
                    <div>
                      <p className="font-medium text-ink">{tx.description ?? tx.type}</p>
                      <p className="text-muted">{timeAgo(tx.createdAt)}</p>
                    </div>
                    <span className={`font-bold ${tx.amount > 0 ? "text-brandGreen" : "text-redAccent"}`}>
                      {tx.amount > 0 ? "+" : ""}{tx.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-6 text-muted">
          <Wallet className="h-8 w-8 mx-auto mb-2 opacity-30" />
          <p className="text-sm">Wallet not available</p>
        </div>
      )}
    </div>
  );
}
