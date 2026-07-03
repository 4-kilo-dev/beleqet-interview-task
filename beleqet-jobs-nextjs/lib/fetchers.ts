const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api/v1";

// Shape of a job returned by the backend
export type ApiJob = {
  id: string;
  title: string;
  description: string;
  requirements?: string;
  location: string;
  type: string;
  status: string;
  featured: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  company: {
    id: string;
    name: string;
    logoUrl?: string;
    website?: string;
    description?: string;
    industry?: string;
  };
  category: {
    id: string;
    slug: string;
    label: string;
    icon?: string;
  };
  _count?: { applications: number };
};

export type ApiCategory = {
  id: string;
  slug: string;
  label: string;
  icon?: string;
};

export type JobsResponse = {
  items: ApiJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type FreelanceJob = {
  id: string;
  title: string;
  description: string;
  budgetMin: number;
  budgetMax: number;
  currency: string;
  pricingType: string;
  deadlineDays: number;
  skills: string[];
  status: string;
  featured: boolean;
  createdAt: string;
  locationPreference?: string;
  experienceLevel?: string;
  category: {
    id: string;
    slug: string;
    label: string;
  };
  client: {
    id: string;
    firstName: string;
    lastName: string;
  };
  _count?: { bids: number };
};

export type FreelanceJobsResponse = {
  items: FreelanceJob[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function getJobs(params: Record<string, string | number> = {}): Promise<JobsResponse> {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  ).toString();
  const res = await fetch(`${BACKEND_URL}/jobs${qs ? `?${qs}` : ""}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch jobs");
  return res.json();
}

export async function getJob(id: string): Promise<ApiJob> {
  const res = await fetch(`${BACKEND_URL}/jobs/${id}`, {
    next: { revalidate: 120 },
  });
  if (!res.ok) throw new Error("Failed to fetch job");
  return res.json();
}

export async function getCategories(): Promise<ApiCategory[]> {
  const res = await fetch(`${BACKEND_URL}/jobs/categories`, {
    next: { revalidate: 300 },
  });
  if (!res.ok) return [];
  return res.json();
}

export async function getFreelanceJobs(
  params: Record<string, string | number> = {}
): Promise<FreelanceJobsResponse> {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  ).toString();
  const res = await fetch(`${BACKEND_URL}/freelance/jobs${qs ? `?${qs}` : ""}`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error("Failed to fetch freelance jobs");
  return res.json();
}

export async function getFreelanceJob(id: string): Promise<FreelanceJob & { bids?: unknown[] }> {
  const res = await fetch(`${BACKEND_URL}/freelance/jobs/${id}`, {
    next: { revalidate: 120 },
  });
  if (!res.ok) throw new Error("Failed to fetch freelance job");
  return res.json();
}
