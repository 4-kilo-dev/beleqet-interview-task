import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api/v1";

async function withAuth(path: string, method = "GET", body?: unknown) {
  const cookieStore = cookies();
  const token = cookieStore.get("accessToken")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const res = await fetch(`${BACKEND_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
    next: { revalidate: 0 },
  });

  const data = await res.json().catch(() => ({}));
  return NextResponse.json(data, { status: res.status });
}

export async function GET() {
  return withAuth("/wallet");
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  return withAuth("/wallet/withdraw", "POST", body);
}
