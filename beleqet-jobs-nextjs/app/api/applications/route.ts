import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api/v1";

function authHeaders() {
  const token = cookies().get("accessToken")?.value;
  return token ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } : null;
}

// GET /api/applications?type=my|job&jobId=xxx
export async function GET(req: NextRequest) {
  const headers = authHeaders();
  if (!headers) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") ?? "my";
  const jobId = searchParams.get("jobId");

  let path = "/applications/my";
  if (type === "job" && jobId) path = `/applications/job/${jobId}`;

  const res = await fetch(`${BACKEND_URL}${path}`, { headers, next: { revalidate: 0 } });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

// PATCH /api/applications/:id/status { status }
export async function PATCH(req: NextRequest) {
  const headers = authHeaders();
  if (!headers) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id, status } = body;
  const res = await fetch(`${BACKEND_URL}/applications/${id}/status`, {
    method: "PATCH",
    headers,
    body: JSON.stringify({ status }),
  });
  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}
