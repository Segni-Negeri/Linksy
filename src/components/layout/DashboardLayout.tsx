import { ReactNode } from 'react';
import { useUser } from '../../hooks/useUser';
import { useRouter } from 'next/router';

interface DashboardLayoutProps {
  children: ReactNode;
  title: string;
  showPlanInfo?: boolean;
  linksCount?: number;
}

export function DashboardLayout({ 
  children, 
  title, 
  showPlanInfo = false, 
  linksCount = 0 
}: DashboardLayoutProps) {
  const { user, loading } = useUser();
  const router = useRouter();

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-emerald-500 flex items-center justify-center text-white font-bold">⛓️</div>
              <span className="font-semibold text-lg">Linksy</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-500">Loading...</div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex">
        <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
          <div className="p-4 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-md bg-emerald-500 flex items-center justify-center text-white font-bold">⛓️</div>
              <span className="font-semibold text-lg">Linksy</span>
            </div>
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-slate-500">Please sign in to access your dashboard.</div>
        </div>
      </div>
    );
  }

  // Get current path for active navigation
  const currentPath = router.pathname;
  const isActive = (path: string) => currentPath === path;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-8 w-8 rounded-md bg-emerald-500 flex items-center justify-center text-white font-bold">⛓️</div>
            <span className="font-semibold text-lg">Linksy</span>
          </a>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <a 
            href="/dashboard" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive('/dashboard') 
                ? 'text-emerald-600 bg-emerald-50' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>📊</span>
            Dashboard
          </a>
          <a 
            href="/dashboard/new" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive('/dashboard/new') 
                ? 'text-emerald-600 bg-emerald-50' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>➕</span>
            Create Link
          </a>
          <a 
            href="/dashboard" 
            className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive('/dashboard') 
                ? 'text-emerald-600 bg-emerald-50' 
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>🔗</span>
            My Links
          </a>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
            <div className="flex items-center gap-3">
              {showPlanInfo && (
                <div className="text-sm text-slate-500">Free Plan — {linksCount}/10 links</div>
              )}
              <div className="h-8 w-8 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                {user.email?.charAt(0).toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

