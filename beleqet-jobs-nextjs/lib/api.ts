import { cookies } from "next/headers";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000/api/v1";

async function refreshTokens() {
  const cookieStore = cookies();
  const refreshToken = cookieStore.get("refreshToken")?.value;
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BACKEND_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: refreshToken }),
    });
    if (!res.ok) throw new Error("Failed to refresh token");

    const data = await res.json();
    cookieStore.set("accessToken", data.accessToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      path: "/", 
      sameSite: "strict" 
    });
    cookieStore.set("refreshToken", data.refreshToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production", 
      path: "/", 
      sameSite: "strict" 
    });
    return data.accessToken;
  } catch (err) {
    // Clear cookies on failure
    cookieStore.delete("accessToken");
    cookieStore.delete("refreshToken");
    cookieStore.delete("user");
    return null;
  }
}

export async function fetchBackend(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  
  let token: string | undefined;
  try {
    const cookieStore = cookies();
    token = cookieStore.get("accessToken")?.value;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  } catch (err) {
    // ignore
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  let response = await fetch(`${BACKEND_URL}${path}`, {
    ...options,
    headers,
  });

  // Handle unauthorized refresh logic
  if (response.status === 401 && path !== "/auth/login" && path !== "/auth/refresh") {
    const newToken = await refreshTokens();
    if (newToken) {
      headers.set("Authorization", `Bearer ${newToken}`);
      response = await fetch(`${BACKEND_URL}${path}`, {
        ...options,
        headers,
      });
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${response.status}`);
  }

  return response.json();
}
