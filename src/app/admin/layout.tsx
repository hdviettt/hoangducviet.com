import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
