import { Outlet, Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

export function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <Header currentPath={location.pathname} />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function Header({ currentPath }: { currentPath: string }) {
  return (
    <header className="border-b border-border bg-card">
      <div className="flex items-center justify-between px-6 py-3">
        <Link to="/" className="text-xl font-bold">
          ToDoDay
        </Link>

        <nav className="flex items-center gap-4">
          <NavLink to="/" active={currentPath === '/'}>
            Today
          </NavLink>
          <NavLink to="/settings" active={currentPath === '/settings'}>
            Settings
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </header>
  );
}

function NavLink({
  to,
  active,
  children,
}: {
  to: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className={cn(
        'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
        active
          ? 'bg-primary/10 text-primary'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      )}
    >
      {children}
    </Link>
  );
}
