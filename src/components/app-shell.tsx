'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  LayoutDashboard,
  LogOut,
  ReceiptText,
  Repeat,
  Settings,
  Tags,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/context/auth-context';

const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard },
  { href: '/transactions', label: 'Transactions', shortLabel: 'Ledger', icon: ReceiptText },
  { href: '/subscriptions', label: 'Subscriptions', shortLabel: 'Subs', icon: Repeat },
  { href: '/categories', label: 'Categories', shortLabel: 'Tags', icon: Tags },
  { href: '/settings', label: 'Settings', shortLabel: 'Settings', icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="size-5 text-primary" strokeWidth={1.75} />
            <span className="font-display text-xl font-semibold tracking-tight">
              Ledger<span className="text-gold">.</span>
            </span>
          </Link>

          <nav className="hidden flex-1 items-center gap-1 sm:flex">
            {NAV_ITEMS.map(item => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm transition-colors',
                    active
                      ? 'bg-accent font-medium text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <span
              className="hidden max-w-48 truncate text-sm text-muted-foreground md:inline"
              title={user?.email}
            >
              {user?.email}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => void signOut()}
              className="gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" strokeWidth={1.75} />
              <span className="hidden sm:inline">Sign out</span>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-24 pt-8 sm:px-6 sm:pb-12">
        {children}
      </main>

      {/* Mobile bottom tab bar */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur sm:hidden">
        <div className="grid grid-cols-5">
          {NAV_ITEMS.map(item => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 py-2.5 text-[11px]',
                  active ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <Icon className="size-5" strokeWidth={active ? 2 : 1.5} />
                {item.shortLabel}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
