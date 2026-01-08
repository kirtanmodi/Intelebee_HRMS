import { useAppSelector, useAppDispatch } from "../hooks/useAppStore";
import { setRole, setCurrentUser } from "../features/auth/authSlice";
import type { Role } from "../types";
import { Shield, ShieldCheck, Users, User } from "lucide-react";

const roles: { value: Role; label: string; icon: typeof Shield; userId: string }[] = [
  { value: "admin", label: "Admin", icon: ShieldCheck, userId: "emp-001" }, // Supratim (CEO)
  { value: "hr", label: "HR", icon: Shield, userId: "emp-002" }, // Bonnhi (HR Manager)
  { value: "manager", label: "Manager", icon: Users, userId: "emp-001" }, // Supratim acts as manager
  { value: "employee", label: "Employee", icon: User, userId: "emp-009" }, // Kirtan (Software Engineer)
];

export function RoleSwitcher() {
  const dispatch = useAppDispatch();
  const currentRole = useAppSelector((state) => state.auth.currentRole);

  const current = roles.find((r) => r.value === currentRole) || roles[0];
  const Icon = current.icon;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = roles.find((r) => r.value === e.target.value);
    if (selected) {
      dispatch(setRole(selected.value));
      dispatch(setCurrentUser(selected.userId));
    }
  };

  return (
    <div className="flex items-center gap-2 bg-surface-100 rounded-lg px-3 py-2">
      <Icon className="w-4 h-4 text-primary-600" />
      <select
        value={currentRole}
        onChange={handleChange}
        className="bg-transparent text-sm font-medium text-surface-700 focus:outline-none cursor-pointer"
      >
        {roles.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
    </div>
  );
}
