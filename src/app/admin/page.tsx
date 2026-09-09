import { redirect } from "next/navigation";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { getAnalyticsSummary } from "@/lib/analytics";
import { listProducts } from "@/lib/products-db";

export const metadata = {
  title: "Admin – CreatorDrop",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const [analytics, products] = await Promise.all([
    getAnalyticsSummary(),
    listProducts({ activeOnly: false }),
  ]);

  return (
    <div className="min-h-full bg-bg-primary text-text-primary">
      <AdminDashboard analytics={analytics} productCount={products.length} />
    </div>
  );
}
