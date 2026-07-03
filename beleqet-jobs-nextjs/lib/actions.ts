"use server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fetchBackend } from "./api";

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email and password are required" };
  }

  try {
    const data = await fetchBackend("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    const cookieStore = cookies();
    cookieStore.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    });
    cookieStore.set("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    });
    cookieStore.set("user", JSON.stringify(data.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    });

    return { success: true, user: data.user };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to log in" };
  }
}

export async function registerAction(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  if (!firstName || !lastName || !email || !password || !role) {
    return { error: "All fields are required" };
  }

  try {
    const data = await fetchBackend("/auth/register", {
      method: "POST",
      body: JSON.stringify({ firstName, lastName, email, password, role }),
    });

    const cookieStore = cookies();
    cookieStore.set("accessToken", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    });
    cookieStore.set("refreshToken", data.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    });
    cookieStore.set("user", JSON.stringify(data.user), {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "strict",
    });

    return { success: true, user: data.user };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Failed to register" };
  }
}

export async function logoutAction(): Promise<void> {
  try {
    await fetchBackend("/auth/logout", { method: "POST" });
  } catch {
    // Ignore backend error — clear cookies regardless
  }

  const cookieStore = cookies();
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");
  cookieStore.delete("user");
  redirect("/");
}

export async function getSession(): Promise<{
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
} | null> {
  try {
    const cookieStore = cookies();
    const userStr = cookieStore.get("user")?.value;
    if (userStr) {
      return JSON.parse(userStr);
    }
  } catch {
    // ignore
  }
  return null;
}
