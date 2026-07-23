import AdminHeader from "@/components/admin/AdminHeader";
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
      <div className="flex h-screen bg-md-background font-sans text-md-on-background">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AdminHeader />
          {/* Same gutters and bottom air as the reader-facing <main>. */}
          <main className="flex-1 overflow-y-auto page-transition px-5 sm:px-8 lg:px-14 xl:px-20 pb-16">
            <div className="max-w-[1440px]">{children}</div>
          </main>
        </div>
      </div>
    </ToastProvider>
  );
}
