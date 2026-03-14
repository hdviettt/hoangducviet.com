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
      <div className="flex min-h-screen bg-background font-mono">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-hidden">{children}</main>
      </div>
    </ToastProvider>
  );
}
