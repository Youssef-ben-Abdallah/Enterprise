import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Package, Truck, MapPin, Calendar, Clock, Sun, Moon, BarChart3 } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}

const navItems = [
  { path: '/',          label: 'Overview',         icon: Home,      color: 'text-teal-400' },
  { path: '/products',  label: 'Products',          icon: Package,   color: 'text-indigo-400' },
  { path: '/suppliers', label: 'Suppliers',          icon: Truck,     color: 'text-rose-400' },
  { path: '/locations', label: 'Locations',          icon: MapPin,    color: 'text-amber-400' },
  { path: '/time',      label: 'Time Intelligence',  icon: Calendar,  color: 'text-blue-400' },
  { path: '/delivery',  label: 'Delivery',           icon: Clock,     color: 'text-emerald-400' },
];

function Clock12() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return (
    <span className="text-xs font-mono tabular-nums" style={{ color: 'var(--text-muted)' }}>
      {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </span>
  );
}

export function Layout() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const currentPage = navItems.find(n => n.path === location.pathname);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-canvas)', color: 'var(--text-primary)' }}>

      {/* Ambient Background Orbs (dark mode) */}
      <div className="bg-orb w-[600px] h-[600px] -top-48 -left-48"
        style={{ background: 'var(--glow-orb-1)' }} />
      <div className="bg-orb w-[400px] h-[400px] top-1/2 right-0"
        style={{ background: 'var(--glow-orb-2)', animationDelay: '10s' }} />

      {/* ── Sidebar ── */}
      <aside
        className="relative z-10 w-56 flex flex-col flex-shrink-0"
        style={{
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <div
          className="h-14 flex items-center gap-2.5 px-5"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--glow-accent)', border: '1px solid var(--border-accent)' }}>
            <BarChart3 className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          </div>
          <div>
            <p className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>
              Enterprise
            </p>
            <p className="text-[10px] font-medium leading-tight" style={{ color: 'var(--text-muted)' }}>
              DWH Dashboard
            </p>
          </div>
        </div>

        {/* Nav section label */}
        <div className="px-4 pt-5 pb-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Navigation
          </p>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn('nav-item', isActive && 'active')}
              >
                <Icon className={cn('w-4 h-4 flex-shrink-0', isActive ? item.color : '')} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar footer */}
        <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <div className="w-2 h-2 rounded-full bg-emerald-400 flex-shrink-0" style={{ boxShadow: '0 0 6px rgba(52,211,153,0.8)' }} />
            Live · SSAS Connected
          </div>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">

        {/* Top Bar */}
        <header
          className="h-14 flex items-center justify-between px-6 flex-shrink-0"
          style={{
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border)',
          }}
        >
          {/* Page title */}
          <div className="flex items-center gap-3">
            {currentPage && (
              <>
                <div className="w-1.5 h-5 rounded-full" style={{ background: 'var(--accent)' }} />
                <h1 className="font-semibold text-base" style={{ color: 'var(--text-primary)' }}>
                  {currentPage.label}
                </h1>
              </>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">
            <Clock12 />
            <div className="w-px h-5" style={{ background: 'var(--border)' }} />
            <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="Toggle theme"
              title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {theme === 'dark'
                ? <Sun className="w-4 h-4" />
                : <Moon className="w-4 h-4" />
              }
            </button>
          </div>
        </header>

        {/* Page content */}
        <div
          className="flex-1 overflow-y-auto p-6"
          style={{ background: 'var(--bg-canvas)' }}
        >
          <div className="page-enter max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
