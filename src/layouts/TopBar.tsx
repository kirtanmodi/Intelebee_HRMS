import { useAppSelector } from '../hooks/useAppStore';
import { RoleSwitcher } from '../components/RoleSwitcher';
import { Bell, Search } from 'lucide-react';

interface TopBarProps {
  title: string;
}

export function TopBar({ title }: TopBarProps) {
  const currentUserId = useAppSelector(state => state.auth.currentUserId);
  const employees = useAppSelector(state => state.employees.list);
  const currentUser = employees.find(e => e.id === currentUserId);

  return (
    <header className="h-16 bg-white border-b border-surface-200 px-6 flex items-center justify-between">
      <h1 className="text-xl font-semibold text-surface-900">{title}</h1>

      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 w-64 bg-surface-50 border border-surface-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        <button className="relative p-2 text-surface-500 hover:text-surface-700 hover:bg-surface-100 rounded-lg transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-accent-500 rounded-full" />
        </button>

        <RoleSwitcher />

        <div className="flex items-center gap-3 pl-4 border-l border-surface-200">
          <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center text-white font-medium text-sm">
            {currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-surface-900">{currentUser?.name || 'User'}</p>
            <p className="text-xs text-surface-500">{currentUser?.designation || 'Employee'}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
