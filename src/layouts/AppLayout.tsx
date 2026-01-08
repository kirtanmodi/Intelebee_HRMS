import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/employees": "Employees",
  "/attendance": "Attendance",
  "/leaves": "Leave Management",
  "/performance": "Performance",
  "/recruitment": "Recruitment",
  "/policies": "Policies",
  "/settings": "Settings",
};

export function AppLayout() {
  const location = useLocation();
  const basePath = "/" + location.pathname.split("/")[1];
  const title = pageTitles[basePath] || "HRMS";

  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />
      <div className="ml-64">
        <TopBar title={title} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
