'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badgeCount?: number;
}

const ICONS = {
  dashboard: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </svg>
  ),
  inventory: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M21 8l-9-5-9 5 9 5 9-5z" />
      <path d="M3 8v8l9 5 9-5V8" />
      <path d="M12 13v8" />
    </svg>
  ),
  activeRides: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="5.5" cy="17.5" r="3.5" />
      <circle cx="18.5" cy="17.5" r="3.5" />
      <path d="M15 6a1 1 0 100-2 1 1 0 000 2z" />
      <path d="M12 17.5V11l-3-3 3-4h4.5l2 4-4 1.5" />
    </svg>
  ),
  history: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" />
    </svg>
  ),
  aadhaar: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="2" />
      <path d="M5 17c.5-2 2-3 4-3s3.5 1 4 3" />
      <path d="M14 9h5M14 13h5" />
    </svg>
  ),
  deposits: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
    </svg>
  ),
  waitlist: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="9" cy="7" r="3" />
      <path d="M2 21v-2a6 6 0 0112 0v2" />
      <path d="M17 8v4M17 16h.01" />
    </svg>
  ),
  revenue: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 21h18" />
      <rect x="6" y="11" width="3" height="7" />
      <rect x="11" y="7" width="3" height="11" />
      <rect x="16" y="14" width="3" height="4" />
    </svg>
  ),
  settings: (
    <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h0a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h0a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v0a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z" />
    </svg>
  ),
};

interface AdminSidebarProps {
  pendingDepositsCount: number;
  onNavigate?: () => void;
}

export default function AdminSidebar({ pendingDepositsCount, onNavigate }: AdminSidebarProps) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: ICONS.dashboard },
    { label: 'Inventory', href: '/admin/inventory', icon: ICONS.inventory },
    { label: 'Active Rides', href: '/admin/rides/active', icon: ICONS.activeRides },
    { label: 'Ride History', href: '/admin/rides/history', icon: ICONS.history },
    { label: 'Aadhaar Verify', href: '/admin/aadhaar', icon: ICONS.aadhaar },
    { label: 'Deposit Returns', href: '/admin/deposits', icon: ICONS.deposits, badgeCount: pendingDepositsCount },
    { label: 'Waitlist', href: '/admin/waitlist', icon: ICONS.waitlist },
    { label: 'Revenue', href: '/admin/revenue', icon: ICONS.revenue },
    { label: 'Settings', href: '/admin/settings', icon: ICONS.settings },
  ];

  return (
    <nav className="flex flex-col gap-1 px-3 py-4">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(item.href + '/');
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-[13px] font-semibold transition-colors ${
              active
                ? 'bg-[#0F6E56] text-white'
                : 'text-[#9fd8bc] hover:bg-[#163a2c] hover:text-white'
            }`}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {!!item.badgeCount && item.badgeCount > 0 && (
              <span className="bg-[#e84c4c] text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                {item.badgeCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
