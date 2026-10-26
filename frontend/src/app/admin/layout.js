'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Tractor,
  PackageSearch,
  Store,
  ShoppingCart,
  Truck,
  LogOut,
  Menu,
  X,
  Star,
  Tag
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AdminLayout({ children }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user || user.role === 'customer') {
        router.push('/');
      }
    }
  }, [user, loading, router]);

  if (loading || !user || user.role === 'customer') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Farmers', href: '/admin/farmers', icon: Tractor },
    { label: 'Procurement', href: '/admin/procurement', icon: PackageSearch },
    { label: 'Warehouse', href: '/admin/warehouse', icon: Store },
    { label: 'Products', href: '/admin/products', icon: Store }, // reusing icon
    { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
    { label: 'Deliveries', href: '/admin/deliveries', icon: Truck },
    { label: 'Feedback', href: '/admin/feedback', icon: Star },
    { label: 'Promotions', href: '/admin/promotions', icon: Tag },
    { label: 'Users', href: '/admin/users', icon: Users },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 bg-white border-r w-64 z-50 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:flex-shrink-0 flex flex-col ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center px-6 border-b">
          <Link href="/" className="font-serif text-2xl text-green-800 font-bold tracking-tight">
            Fresh Roots <span className="text-sm font-sans text-slate-500 font-normal">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-green-50 text-green-700' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
                onClick={() => setIsMobileOpen(false)}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? 'text-green-600' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-800 font-bold">
              {user.first_name?.[0] || user.username?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user.first_name || user.username}
              </p>
              <p className="text-xs text-slate-500 truncate capitalize">
                {user.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <Button 
            variant="outline" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b bg-white md:hidden">
          <Link href="/" className="font-serif text-xl text-green-800 font-bold">
            Fresh Roots
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(true)}>
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-slate-50 p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
