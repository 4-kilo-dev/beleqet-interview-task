import { redirect } from "next/navigation";
import { getSession } from "@/lib/actions";
import FreelancerDashboardClient from "./FreelancerDashboardClient";

export const metadata = {
  title: "Freelancer Dashboard | Beleqet",
};

export default async function FreelancerDashboard() {
  const user = await getSession();
  if (!user) redirect("/login?next=/dashboard/freelancer");
  if (user.role === "EMPLOYER") redirect("/dashboard/employer");

  return <FreelancerDashboardClient user={user} />;
}
