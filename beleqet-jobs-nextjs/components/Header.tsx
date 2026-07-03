import Link from "next/link";
import { getSession, logoutAction } from "@/lib/actions";
import { LogOut, User as UserIcon, LayoutDashboard } from "lucide-react";

const navItems = [
  { label: "Find Jobs", href: "/jobs" },
  { label: "Browse Gigs", href: "/freelance" },
  { label: "About Us", href: "/about" },
  { label: "CV Maker", href: "/cv-maker" },
];

export default async function Header() {
  const user = await getSession();

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-border">
      <div className="container-page flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 font-extrabold text-lg text-primary">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-brandGreen text-white text-sm">
            B
          </span>
          <span>
            Beleqet <span className="text-brandGreen">Job</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-ink">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-brandGreen transition-colors">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={user.role === "EMPLOYER" ? "/dashboard/employer" : "/dashboard/freelancer"}
                className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-brandGreen transition-colors"
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <div className="hidden sm:flex items-center gap-1 text-sm font-medium text-muted">
                <UserIcon className="h-4 w-4" />
                <span>{user.firstName}</span>
              </div>
              <form action={logoutAction} className="inline-block">
                <button
                  type="submit"
                  className="p-2 text-muted hover:text-red-500 rounded-full hover:bg-pageBg transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-sm font-medium text-ink hover:text-brandGreen transition-colors"
            >
              Login / Sign Up
            </Link>
          )}

          {(!user || user.role === "EMPLOYER") && (
            <Link
              href="/post-job"
              className="inline-flex items-center rounded-full bg-brandGreen px-4 py-2 text-sm font-semibold text-white hover:bg-darkGreen transition-colors"
            >
              Post a Job
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
