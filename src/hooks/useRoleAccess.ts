import { useAppSelector } from './useAppStore';
import type { Role } from '../types';

type Permission = 
  | 'view_all_employees'
  | 'view_team_employees'
  | 'edit_employees'
  | 'view_all_attendance'
  | 'view_team_attendance'
  | 'view_self_attendance'
  | 'edit_attendance'
  | 'view_all_leaves'
  | 'approve_leaves_manager'
  | 'approve_leaves_hr'
  | 'view_all_performance'
  | 'view_team_performance'
  | 'view_self_performance'
  | 'edit_performance'
  | 'view_recruitment'
  | 'edit_recruitment'
  | 'view_policies'
  | 'edit_policies'
  | 'view_settings'
  | 'edit_settings';

const rolePermissions: Record<Role, Permission[]> = {
  admin: [
    'view_all_employees', 'edit_employees',
    'view_all_attendance', 'edit_attendance',
    'view_all_leaves', 'approve_leaves_manager', 'approve_leaves_hr',
    'view_all_performance', 'edit_performance',
    'view_recruitment', 'edit_recruitment',
    'view_policies', 'edit_policies',
    'view_settings', 'edit_settings',
  ],
  hr: [
    'view_all_employees', 'edit_employees',
    'view_all_attendance', 'edit_attendance',
    'view_all_leaves', 'approve_leaves_hr',
    'view_all_performance', 'edit_performance',
    'view_recruitment', 'edit_recruitment',
    'view_policies', 'edit_policies',
  ],
  manager: [
    'view_team_employees',
    'view_team_attendance',
    'view_all_leaves', 'approve_leaves_manager',
    'view_team_performance', 'view_self_performance', 'edit_performance',
    'view_policies',
  ],
  employee: [
    'view_self_attendance',
    'view_all_leaves',
    'view_self_performance',
    'view_policies',
  ],
};

export function useRoleAccess() {
  const currentRole = useAppSelector(state => state.auth.currentRole);
  const currentUserId = useAppSelector(state => state.auth.currentUserId);

  const hasPermission = (permission: Permission): boolean => {
    return rolePermissions[currentRole]?.includes(permission) ?? false;
  };

  const canViewRoute = (route: string): boolean => {
    switch (route) {
      case '/dashboard':
        return true;
      case '/employees':
        return currentRole !== 'employee';
      case '/attendance':
        return true;
      case '/leaves':
        return true;
      case '/performance':
        return true;
      case '/recruitment':
        return currentRole === 'admin' || currentRole === 'hr';
      case '/payslips':
        return true;
      case '/policies':
        return true;
      case '/my-profile':
        return true;
      case '/settings':
        return currentRole === 'admin';
      default:
        return true;
    }
  };

  const canEdit = (feature: string): boolean => {
    switch (feature) {
      case 'payslips':
        return currentRole === 'admin' || currentRole === 'hr';
      case 'employees':
        return currentRole === 'admin' || currentRole === 'hr';
      case 'attendance':
        return currentRole === 'admin' || currentRole === 'hr';
      default:
        return currentRole === 'admin' || currentRole === 'hr';
    }
  };

  const isReadOnly = (feature: string): boolean => {
    switch (feature) {
      case 'employees':
        return currentRole === 'manager';
      case 'attendance':
        return currentRole === 'manager' || currentRole === 'employee';
      case 'policies':
        return currentRole === 'manager' || currentRole === 'employee';
      default:
        return false;
    }
  };

  return {
    currentRole,
    currentUserId,
    hasPermission,
    canViewRoute,
    isReadOnly,
    canEdit,
  };
}
