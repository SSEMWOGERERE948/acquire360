import { type ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Boxes,
  Briefcase,
  Building2,
  FileText,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Users,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';

const navItems = [
  ['Overview', '/admin', LayoutDashboard],
  ['Company profile', '/admin/company', Building2],
  ['Services', '/admin/services', Boxes],
  ['Projects', '/admin/projects', Briefcase],
  ['Products', '/admin/products', Boxes],
  ['Team', '/admin/team', Users],
  ['Clients', '/admin/clients', Users],
  ['Media library', '/admin/media', ImageIcon],
  ['Enquiries', '/admin/rfqs', FileText],
] as const;

export function AdminGuard({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) setLocation('/admin/login');
  }, [isLoading, user, setLocation]);

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-[hsl(var(--muted-foreground))]">Loading admin dashboard…</div>;
  }
  if (!user) return null;

  return <AdminShell>{children}</AdminShell>;
}

function NavLinks({ location, onNavigate }: { location: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 p-4">
      {navItems.map(([label, href, Icon]) => (
        <Link
          key={href}
          href={href}
          onClick={onNavigate}
          data-testid={`link-admin-nav-${label.toLowerCase().replace(/\s+/g, '-')}`}
          className={`flex items-center gap-3 rounded px-3 py-2.5 text-sm font-semibold transition-colors ${
            location === href
              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
              : 'text-[hsl(var(--foreground)/.75)] hover:bg-[hsl(var(--muted))]'
          }`}
        >
          <Icon size={16} /> {label}
        </Link>
      ))}
    </nav>
  );
}

function AdminShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-[100dvh] bg-[hsl(var(--muted)/.35)]">
      <div className="flex min-h-[100dvh]">
        <aside className="hidden w-64 shrink-0 border-r border-[hsl(var(--border))] bg-[hsl(var(--card))] md:block">
          <div className="border-b border-[hsl(var(--border))] p-6">
            <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--secondary))]">Acquire 360</p>
            <p className="mt-1 text-sm font-bold text-[hsl(var(--primary))]">Admin dashboard</p>
          </div>
          <NavLinks location={location} />
        </aside>
        <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <SheetContent side="left" className="w-64 p-0">
            <SheetTitle className="sr-only">Admin navigation</SheetTitle>
            <div className="border-b border-[hsl(var(--border))] p-6">
              <p className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--secondary))]">Acquire 360</p>
              <p className="mt-1 text-sm font-bold text-[hsl(var(--primary))]">Admin dashboard</p>
            </div>
            <NavLinks location={location} onNavigate={() => setMobileNavOpen(false)} />
          </SheetContent>
        </Sheet>
        <div className="flex min-h-[100dvh] flex-1 flex-col">
          <header className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-6 py-4">
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={() => setMobileNavOpen(true)}
                className="text-[hsl(var(--primary))] md:hidden"
                aria-label="Open admin navigation"
                data-testid="button-admin-mobile-menu"
              >
                <Menu size={22} />
              </button>
              <Link href="/" className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--secondary))]" data-testid="link-admin-view-site">
                ← View public site
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <span className="hidden text-sm font-semibold text-[hsl(var(--primary))] sm:inline">{user?.name}</span>
              <Button size="sm" variant="outline" onClick={() => logout()} data-testid="button-admin-logout">
                <LogOut size={14} className="mr-2" /> Log out
              </Button>
            </div>
          </header>
          <main className="flex-1 p-6 md:p-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
