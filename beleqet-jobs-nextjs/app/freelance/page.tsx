import Link from "next/link";
import { getFreelanceJobs, type FreelanceJob } from "@/lib/fetchers";
import FreelanceListing from "@/components/FreelanceListing";

type FreelanceJobsResult = { items: FreelanceJob[]; total: number; page: number; limit: number; totalPages: number };

export const metadata = {
  title: "Browse Freelance Gigs | Beleqet",
  description: "Find and bid on freelance projects across Ethiopia. Connect with clients looking for skilled freelancers.",
};

export default async function FreelancePage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const page = Number(searchParams.page ?? "1");
  const params: Record<string, string | number> = { page, limit: 12 };
  if (searchParams.q) params.q = searchParams.q;
  if (searchParams.category) params.category = searchParams.category;

  let initialData: FreelanceJobsResult = { items: [], total: 0, page: 1, limit: 12, totalPages: 0 };
  try {
    const data = await getFreelanceJobs(params);
    // The backend may return items directly or nested
    initialData = data;
  } catch {
    // silently fall back to empty state
  }

  return (
    <div>
      {/* Page Hero */}
      <div className="bg-gradient-to-br from-primary via-primary2 to-darkGreen text-white relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 opacity-25 [background-image:radial-gradient(circle_at_80%_20%,rgba(34,197,94,0.3),transparent_40%)]" />
        <div className="container-page relative py-12">
          <nav className="text-xs text-white/50 mb-4">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span className="mx-2">/</span>
            <span>Freelance Gigs</span>
          </nav>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Find Freelance Projects</h1>
          <p className="text-white/70 max-w-xl text-sm leading-relaxed">
            Browse open gigs posted by clients. Submit proposals, set your price, and win projects that match your expertise.
          </p>
          <div className="flex items-center gap-3 mt-6 flex-wrap">
            <div className="rounded-xl bg-white/10 border border-white/15 px-4 py-2 text-xs font-medium">
              {initialData.total} gigs available
            </div>
            <div className="rounded-xl bg-white/10 border border-white/15 px-4 py-2 text-xs font-medium">
              Escrow-protected payments
            </div>
            <div className="rounded-xl bg-white/10 border border-white/15 px-4 py-2 text-xs font-medium">
              ETB & USD budgets
            </div>
          </div>
        </div>
      </div>

      <FreelanceListing
        initialItems={initialData.items}
        initialTotal={initialData.total}
        initialPage={page}
      />
    </div>
  );
}
