import AdminSidebar from "@/components/admin/AdminSidebar";
import { ToastProvider } from "@/components/admin/Toast";

export const metadata = {
  title: "Admin",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <div className="flex h-screen bg-background font-mono text-[15px]">
        <AdminSidebar />
        <main className="flex-1 p-10 overflow-y-auto page-transition">{children}</main>
      </div>
    </ToastProvider>
  );
}
