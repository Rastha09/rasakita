import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  LayoutDashboard, 
  Store, 
  Users, 
  Settings,
  LogOut,
  ShieldCheck,
  BarChart3,
  Package,
  Wallet,
  FileBarChart
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { NotificationBell } from '@/components/admin/NotificationBell';
import { useSuperAdmin } from '@/hooks/useSuperAdmin';

interface SuperAdminLayoutProps {
  children: ReactNode;
}

const menuItems = [
  { path: '/superadmin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { path: '/superadmin/users', icon: Users, label: 'Users' },
  { path: '/superadmin/toko', icon: Store, label: 'Kelola Toko' },
  { path: '/superadmin/produk', icon: Package, label: 'Semua Produk' },
  { path: '/superadmin/orders', icon: BarChart3, label: 'Pesanan', badge: true },
  { path: '/superadmin/keuangan', icon: Wallet, label: 'Keuangan' },
  { path: '/superadmin/laporan', icon: FileBarChart, label: 'Laporan' },
  { path: '/superadmin/settings', icon: Settings, label: 'Pengaturan' },
];

export function SuperAdminLayout({ children }: SuperAdminLayoutProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { signOut, profile } = useAuth();
  const { stats } = useSuperAdmin();
  const newOrders = stats?.newOrders ?? 0;

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-primary to-warning flex items-center justify-center">
            <ShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-sidebar-foreground">Super Admin</h2>
            <p className="text-xs text-sidebar-foreground/60">{profile?.full_name || 'Administrator'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path, item.exact);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors relative",
                active 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />}
              <Icon className="h-5 w-5" />
              <span className="font-medium flex-1">{item.label}</span>
              {item.badge && newOrders > 0 && (
                <span className="h-5 min-w-[20px] rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-bold px-1">
                  {newOrders}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center text-xs font-bold text-sidebar-foreground">
            {profile?.full_name?.charAt(0)?.toUpperCase() || 'S'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{profile?.full_name || 'Super Admin'}</p>
            <p className="text-xs text-sidebar-foreground/50">Super Admin</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          onClick={() => {
            signOut();
            setOpen(false);
          }}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Keluar
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border lg:hidden">
        <div className="flex items-center justify-between h-14 px-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0 bg-sidebar border-sidebar-border">
              <NavContent />
            </SheetContent>
          </Sheet>
          
          <h1 className="font-semibold">Super Admin</h1>
          
          <NotificationBell />
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-72 lg:flex-col bg-sidebar border-r border-sidebar-border">
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="hidden lg:flex items-center justify-end h-14 px-6 border-b border-border">
          <NotificationBell />
        </div>
        <div className="p-4 lg:p-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
