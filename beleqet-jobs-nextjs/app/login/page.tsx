"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginAction } from "@/lib/actions";
import { KeyRound, Mail, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-pageBg">
      <div className="w-full max-w-md bg-white border border-border rounded-2xl shadow-xl p-8 relative overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-brandGreen/5 rounded-full blur-3xl -mr-10 -mt-10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-brandGreen/5 rounded-full blur-3xl -ml-10 -mb-10" />

        <div className="text-center mb-8 relative">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brandGreen text-white text-xl font-black mb-4 shadow-lg shadow-brandGreen/20">
            B
          </span>
          <h2 className="text-2xl font-bold text-ink">Welcome back to Beleqet</h2>
          <p className="text-muted text-sm mt-2">Enter your credentials to access your account</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 relative">
          <div>
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-muted shrink-0" />
              <input
                type="email"
                name="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-xl border border-border pl-10 pr-4 py-3 text-sm text-ink placeholder:text-muted outline-none focus:border-brandGreen focus:ring-1 focus:ring-brandGreen transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                Password
              </label>
              <Link href="/auth/forgot" className="text-xs text-brandGreen hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-3 h-5 w-5 text-muted shrink-0" />
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-border pl-10 pr-4 py-3 text-sm text-ink placeholder:text-muted outline-none focus:border-brandGreen focus:ring-1 focus:ring-brandGreen transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 rounded-full bg-brandGreen text-white text-sm font-semibold py-3.5 hover:bg-darkGreen disabled:opacity-50 transition-all flex items-center justify-center gap-2 group"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                Sign In
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-sm text-muted mt-8">
          Don&apos;t have an account?{" "}
          <Link href="/register" className="text-brandGreen font-semibold hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
