import { redirect } from "next/navigation";
import { getSession } from "@/lib/actions";
import EmployerDashboardClient from "./EmployerDashboardClient";

export const metadata = {
  title: "Employer Dashboard | Beleqet",
};

export default async function EmployerDashboard() {
  const user = await getSession();
  if (!user) redirect("/login?next=/dashboard/employer");
  if (user.role !== "EMPLOYER" && user.role !== "ADMIN") redirect("/dashboard/freelancer");

  return <EmployerDashboardClient user={user} />;
}
