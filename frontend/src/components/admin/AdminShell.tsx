'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AdminSidebar from './AdminSidebar';

interface AdminShellProps {
  adminPhone: string;
  pendingDepositsCount: number;
  children: React.ReactNode;
}

export default function AdminShell({ adminPhone, pendingDepositsCount, children }: AdminShellProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0a1f17' }}>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-[240px] bg-[#071912] border-r border-[#163a2c] flex-shrink-0">
        <div className="px-5 py-5 border-b border-[#163a2c]">
          <span className="font-display text-[16px] text-white">PAAVAN Admin</span>
        </div>
        <AdminSidebar pendingDepositsCount={pendingDepositsCount} />
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-[100] md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setDrawerOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[260px] bg-[#071912] border-r border-[#163a2c] flex flex-col">
            <div className="px-5 py-5 border-b border-[#163a2c] flex items-center justify-between">
              <span className="font-display text-[16px] text-white">PAAVAN Admin</span>
              <button onClick={() => setDrawerOpen(false)} className="text-[#9fd8bc] p-1" aria-label="Close menu">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <AdminSidebar pendingDepositsCount={pendingDepositsCount} onNavigate={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-[60px] bg-[#0d2a20] border-b border-[#163a2c] flex items-center justify-between px-4 sm:px-6 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDrawerOpen(true)}
              className="md:hidden text-[#9fd8bc] p-1"
              aria-label="Open menu"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
              </svg>
            </button>
            <span className="font-display text-[15px] text-white hidden sm:inline">PAAVAN Admin</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[12px] text-[#9fd8bc]">+91 {adminPhone}</span>
            <button
              onClick={handleLogout}
              className="text-[12px] font-semibold text-[#f5b0b0] hover:text-white px-3 py-1.5 rounded-[6px] border border-[#3a1414] hover:bg-[#3a1414] transition-colors"
            >
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</main>
      </div>
    </div>
  );
}
