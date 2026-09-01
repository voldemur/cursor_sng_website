import { AdminApp } from "@/components/admin/AdminApp";
import { usingDevelopmentPassword } from "@/lib/auth/password";
import { readContent } from "@/lib/content/store";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const content = await readContent();
  return <AdminApp initial={content} developmentPassword={usingDevelopmentPassword()} />;
}
