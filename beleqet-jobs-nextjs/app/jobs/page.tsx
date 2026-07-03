import { Suspense } from "react";
import JobsListing from "@/components/JobsListing";
import { getJobs, getCategories } from "@/lib/fetchers";

export const metadata = {
  title: "Find Jobs | Beleqet Jobs",
  description: "Discover thousands of verified job opportunities across Ethiopia. Filter by category, type, and location.",
};

export default async function JobsPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const page = Number(searchParams.page ?? "1");
  const params: Record<string, string | number> = { page, limit: 12 };
  if (searchParams.q) params.q = searchParams.q;
  if (searchParams.loc) params.location = searchParams.loc;
  if (searchParams.category) params.categoryId = searchParams.category;
  if (searchParams.type) params.type = searchParams.type;

  const [jobsData, categories] = await Promise.all([getJobs(params), getCategories()]);

  return (
    <Suspense fallback={<div className="container-page py-20 text-center text-muted">Loading jobs…</div>}>
      <JobsListing
        initialJobs={jobsData.items}
        initialTotal={jobsData.total}
        initialPage={page}
        categories={categories}
      />
    </Suspense>
  );
}
