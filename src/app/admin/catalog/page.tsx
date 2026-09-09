import { redirect } from "next/navigation";
import {
  AdminCatalog,
  type CatalogProduct,
} from "@/components/admin/AdminCatalog";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { listProductRecords } from "@/lib/products-db";

export const metadata = {
  title: "Catalog – CreatorDrop Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminCatalogPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const records = await listProductRecords({ activeOnly: false });
  const products: CatalogProduct[] = records.map((p) => ({
    ...p,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="min-h-full bg-bg-primary text-text-primary">
      <AdminCatalog initialProducts={products} />
    </div>
  );
}
