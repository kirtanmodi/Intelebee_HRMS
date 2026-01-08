import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CalendarDays,
  Target,
  Briefcase,
  FileText,
  DollarSign,
  UserCircle,
  Settings,
  LogOut
} from 'lucide-react';
import { useRoleAccess } from '../hooks/useRoleAccess';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employees', label: 'Employees', icon: Users },
  { path: '/attendance', label: 'Attendance', icon: CalendarCheck },
  { path: '/leaves', label: 'Leaves', icon: CalendarDays },
  { path: '/performance', label: 'Performance', icon: Target },
  { path: '/recruitment', label: 'Recruitment', icon: Briefcase },
  { path: '/payslips', label: 'Payslips', icon: DollarSign },
  { path: '/policies', label: 'Policies', icon: FileText },
  { path: '/my-profile', label: 'My Profile', icon: UserCircle },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const { canViewRoute } = useRoleAccess();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-surface-900 text-white flex flex-col">
      <div className="px-4 py-5 border-b border-surface-800">
        <div className="flex items-center gap-2">
          <img 
            src="/logo.webp" 
            alt="Intelebee" 
            className="h-10 w-auto"
          />
        </div>
        <p className="text-xs text-surface-400 tracking-widest mt-1 pl-1">HRMS</p>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        {navItems.map(item => {
          if (!canViewRoute(item.path)) return null;
          
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                    : 'text-surface-300 hover:bg-surface-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-3 border-t border-surface-800">
        <NavLink
          to="/login"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-surface-400 hover:bg-surface-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </NavLink>
      </div>
    </aside>
  );
}
