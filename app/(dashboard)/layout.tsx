import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { initDb } from '@/lib/db';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize database on server start
  initDb();
  
  return (
    <>
      <Sidebar />
      <div className="flex flex-1 flex-col min-w-0">
        <Header />
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </>
  );
}
