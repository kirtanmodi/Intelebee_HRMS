export type Role = 'admin' | 'hr' | 'manager' | 'employee';

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  designation: string;
  joinDate: string;
  managerId?: string;
  avatar?: string;
  status: 'active' | 'inactive';
  phone?: string;
  address?: string;
}

export type AttendanceStatus = 'present' | 'wfh' | 'absent';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  notes?: string;
}

export type LeaveType = 'sick' | 'pto' | 'festival' | 'emergency' | 'regional';

export type LeaveStatus = 'pending' | 'manager_approved' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  hours: number;
  reason: string;
  status: LeaveStatus;
  managerNote?: string;
  hrNote?: string;
  createdAt: string;
}

export interface LeaveBalance {
  employeeId: string;
  sick: number;
  festival: number;
  emergency: number;
  regional: number;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  observed?: string;
}

export interface Goal {
  id: string;
  employeeId: string;
  title: string;
  description: string;
  progress: number;
  dueDate: string;
  status: 'in_progress' | 'completed' | 'overdue';
  createdBy: string;
}

export interface Review {
  id: string;
  employeeId: string;
  reviewerId: string;
  period: string;
  rating: number;
  feedback: string;
  createdAt: string;
}

export type CandidateStage = 'applied' | 'interview' | 'offer' | 'hired' | 'rejected';

export interface Job {
  id: string;
  title: string;
  department: string;
  description: string;
  requirements: string[];
  status: 'open' | 'closed';
  postedDate: string;
}

export interface Candidate {
  id: string;
  jobId: string;
  name: string;
  email: string;
  phone: string;
  resume?: string;
  stage: CandidateStage;
  notes?: string;
  appliedDate: string;
}

export interface Policy {
  id: string;
  title: string;
  description: string;
  content: string;
  category: string;
  effectiveDate: string;
  version: string;
}

export interface Acknowledgement {
  id: string;
  policyId: string;
  employeeId: string;
  acknowledgedAt: string;
}

export interface Settings {
  companyName: string;
  ptoMonthlyAccrual: number;
}

export interface Payslip {
  id: string;
  employeeId: string;
  month: number;
  year: number;
  basicSalary: number;
  allowances: number;
  deductions: number;
  netPay: number;
  generatedAt: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  timestamp: string;
}
