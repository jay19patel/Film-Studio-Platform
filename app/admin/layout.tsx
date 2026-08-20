'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Camera,
  LayoutDashboard,
  CalendarDays,
  Gem,
  Package,
  Inbox,
  LogOut,
  Menu,
  X,
  User,
} from 'lucide-react';

interface SidebarLink {
  name: string;
  href: string;
  icon: any;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Guard routing - check if authenticated
  useEffect(() => {
    // If the path is /admin/login, we don't apply the sidebar/auth check wrapper
    if (pathname === '/admin/login') {
      setIsAuthenticated(true);
      return;
    }

    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          setIsAuthenticated(false);
          router.replace('/admin/login');
        } else {
          const data = await res.json();
          setIsAuthenticated(true);
          setAdminEmail(data.user?.email || 'Admin');
        }
      } catch (err) {
        setIsAuthenticated(false);
        router.replace('/admin/login');
      }
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setIsAuthenticated(false);
      router.replace('/admin/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const navLinks: SidebarLink[] = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Wedding Packages', href: '/admin/packages', icon: Package },
    { name: 'Crew Resources', href: '/admin/resources', icon: CalendarDays },
    { name: 'Physical Add-ons', href: '/admin/addons', icon: Gem },
    { name: 'Portfolio Showcase', href: '/admin/portfolio', icon: Camera },
    { name: 'Equipment Gear', href: '/admin/equipment', icon: Camera },
    { name: 'Client Inquiries', href: '/admin/inquiries', icon: Inbox },
  ];

  // While checking auth, show a beautiful screen loading spinner
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <div className="w-10 h-10 border-4 border-maroon border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-gray-500 text-sm font-bold tracking-wider uppercase">Verifying Admin Session...</p>
      </div>
    );
  }

  // If path is login, just render children directly without dashboard shell
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      
      {/* Mobile Header Bar */}
      <header className="md:hidden bg-white text-neutral-900 px-4 py-4 flex items-center justify-between border-b border-gray-200 sticky top-0 z-40">
        <Link href="/admin/dashboard" className="flex items-center gap-2">
          <div className="bg-maroon text-white p-1.5 rounded-lg">
            <Camera className="h-5 w-5" />
          </div>
          <span className="font-serif text-lg font-bold tracking-widest uppercase text-neutral-900">CamBuddy Panel</span>
        </Link>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-neutral-500 hover:text-maroon p-1"
        >
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Desktop Sidebar Panel */}
      <aside className="hidden md:flex md:w-64 bg-white text-neutral-600 flex-col flex-shrink-0 border-r border-gray-200 sticky top-0 h-screen shadow-sm">
        {/* Brand */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-2">
          <div className="bg-maroon text-white p-2 rounded-xl">
            <Camera className="h-5 w-5" />
          </div>
          <span className="font-serif text-xl tracking-widest uppercase font-bold text-neutral-900">CamBuddy</span>
        </div>

        {/* User profile capsule */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2.5">
          <div className="bg-gray-50 p-2 rounded-full text-maroon border border-gray-200">
            <User className="h-4.5 w-4.5" />
          </div>
          <div className="truncate">
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Logged In As</p>
            <p className="text-sm text-neutral-900 font-bold truncate max-w-[150px]">{adminEmail}</p>
          </div>
        </div>

        {/* Sidebar Nav links */}
        <nav className="flex-grow p-4 space-y-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive
                    ? 'bg-maroon/5 text-maroon border-l-2 border-maroon'
                    : 'text-neutral-500 hover:bg-gray-50 hover:text-neutral-900'
                }`}
              >
                <Icon className="h-4.5 w-4.5" />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          {/* Backdrop overlay */}
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          
          {/* Drawer card */}
          <div className="relative flex flex-col w-64 max-w-xs bg-white text-neutral-600 h-full z-10 animate-slideRight">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <span className="font-serif text-lg tracking-widest uppercase font-bold text-neutral-900">CamBuddy</span>
              <button onClick={() => setIsMobileOpen(false)} className="text-neutral-400 hover:text-maroon">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <nav className="flex-grow p-4 space-y-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? 'bg-maroon/5 text-maroon border-l-2 border-maroon'
                        : 'text-neutral-500 hover:bg-gray-50 hover:text-neutral-900'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                    {link.name}
                  </Link>
                );
              })}
            </nav>
            
            <div className="p-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setIsMobileOpen(false);
                  handleLogout();
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-neutral-500 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer"
              >
                <LogOut className="h-4.5 w-4.5" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Panel Content Area */}
      <div className="flex-grow flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header bar for Desktop */}
        <header className="hidden md:flex bg-white border-b border-gray-100 h-16 items-center justify-between px-8 sticky top-0 z-30 shadow-sm">
          <h2 className="font-serif text-lg tracking-widest uppercase font-bold text-neutral-900">
            {navLinks.find((l) => pathname === l.href)?.name || 'Admin Panel'}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-[10px] bg-maroon/5 text-maroon font-bold border border-maroon/20 px-3 py-1 rounded-md uppercase tracking-widest">
              Studio Owner Role
            </span>
            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-maroon font-bold uppercase tracking-widest"
              target="_blank"
            >
              View Public Site
            </Link>
          </div>
        </header>

        {/* Page children container */}
        <main className="p-4 md:p-8 flex-grow">{children}</main>
      </div>
    </div>
  );
}
