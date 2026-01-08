import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "./layouts/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { EmployeesPage } from "./pages/EmployeesPage";
import { EmployeeDetailPage } from "./pages/EmployeeDetailPage";
import { AttendancePage } from "./pages/AttendancePage";
import { LeavesPage } from "./pages/LeavesPage";
import { PerformancePage } from "./pages/PerformancePage";
import { RecruitmentPage } from "./pages/RecruitmentPage";
import { PoliciesPage } from "./pages/PoliciesPage";
import { SettingsPage } from "./pages/SettingsPage";
import { PayslipsPage } from "./pages/PayslipsPage";
import { MyProfilePage } from "./pages/MyProfilePage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <DashboardPage />,
      },
      {
        path: "employees",
        element: <EmployeesPage />,
      },
      {
        path: "employees/:id",
        element: <EmployeeDetailPage />,
      },
      {
        path: "attendance",
        element: <AttendancePage />,
      },
      {
        path: "leaves",
        element: <LeavesPage />,
      },
      {
        path: "performance",
        element: <PerformancePage />,
      },
      {
        path: "recruitment",
        element: <RecruitmentPage />,
      },
      {
        path: "policies",
        element: <PoliciesPage />,
      },
      {
        path: "payslips",
        element: <PayslipsPage />,
      },
      {
        path: "my-profile",
        element: <MyProfilePage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
      },
    ],
  },
]);
