import type { 
  Employee, 
  AttendanceRecord, 
  LeaveRequest, 
  LeaveBalance, 
  Holiday,
  Goal,
  Review,
  Job,
  Candidate,
  Policy,
  Acknowledgement,
  Settings 
} from '../types';

export const holidays: Holiday[] = [
  { id: 'hol-1', name: "New Year's Day", date: '2026-01-01' },
  { id: 'hol-2', name: 'Republic Day', date: '2026-01-26' },
  { id: 'hol-3', name: 'Holi', date: '2026-03-04' },
  { id: 'hol-4', name: 'Independence Day', date: '2026-08-15', observed: '2026-08-14' },
  { id: 'hol-5', name: 'Gandhi Jayanti', date: '2026-10-02' },
  { id: 'hol-6', name: 'Diwali', date: '2026-11-08', observed: '2026-11-09' },
  { id: 'hol-7', name: 'Christmas', date: '2026-12-25' },
];

export const employees: Employee[] = [
  {
    id: 'emp-001',
    name: 'Rajesh Kumar',
    email: 'rajesh.kumar@intelebee.com',
    department: 'Engineering',
    designation: 'Engineering Manager',
    joinDate: '2023-03-15',
    status: 'active',
    phone: '+91 98765 43210',
    address: 'Mumbai, Maharashtra',
  },
  {
    id: 'emp-002',
    name: 'Priya Sharma',
    email: 'priya.sharma@intelebee.com',
    department: 'Human Resources',
    designation: 'HR Manager',
    joinDate: '2023-01-10',
    status: 'active',
    phone: '+91 98765 43211',
    address: 'Delhi, NCR',
  },
  {
    id: 'emp-003',
    name: 'Amit Patel',
    email: 'amit.patel@intelebee.com',
    department: 'Engineering',
    designation: 'Senior Developer',
    joinDate: '2023-06-20',
    managerId: 'emp-001',
    status: 'active',
    phone: '+91 98765 43212',
    address: 'Bangalore, Karnataka',
  },
  {
    id: 'emp-004',
    name: 'Sneha Reddy',
    email: 'sneha.reddy@intelebee.com',
    department: 'Engineering',
    designation: 'Frontend Developer',
    joinDate: '2024-02-01',
    managerId: 'emp-001',
    status: 'active',
    phone: '+91 98765 43213',
    address: 'Hyderabad, Telangana',
  },
  {
    id: 'emp-005',
    name: 'Vikram Singh',
    email: 'vikram.singh@intelebee.com',
    department: 'Design',
    designation: 'Design Lead',
    joinDate: '2023-08-01',
    status: 'active',
    phone: '+91 98765 43214',
    address: 'Pune, Maharashtra',
  },
  {
    id: 'emp-006',
    name: 'Ananya Gupta',
    email: 'ananya.gupta@intelebee.com',
    department: 'Design',
    designation: 'UI/UX Designer',
    joinDate: '2024-04-15',
    managerId: 'emp-005',
    status: 'active',
    phone: '+91 98765 43215',
    address: 'Chennai, Tamil Nadu',
  },
  {
    id: 'emp-007',
    name: 'Rohit Mehta',
    email: 'rohit.mehta@intelebee.com',
    department: 'Engineering',
    designation: 'Backend Developer',
    joinDate: '2024-01-10',
    managerId: 'emp-001',
    status: 'active',
    phone: '+91 98765 43216',
    address: 'Ahmedabad, Gujarat',
  },
  {
    id: 'emp-008',
    name: 'Kavya Nair',
    email: 'kavya.nair@intelebee.com',
    department: 'Marketing',
    designation: 'Marketing Manager',
    joinDate: '2023-05-20',
    status: 'active',
    phone: '+91 98765 43217',
    address: 'Kochi, Kerala',
  },
  {
    id: 'emp-009',
    name: 'Arjun Desai',
    email: 'arjun.desai@intelebee.com',
    department: 'Marketing',
    designation: 'Content Specialist',
    joinDate: '2024-06-01',
    managerId: 'emp-008',
    status: 'active',
    phone: '+91 98765 43218',
    address: 'Jaipur, Rajasthan',
  },
  {
    id: 'emp-010',
    name: 'Meera Iyer',
    email: 'meera.iyer@intelebee.com',
    department: 'Human Resources',
    designation: 'HR Executive',
    joinDate: '2024-03-01',
    managerId: 'emp-002',
    status: 'active',
    phone: '+91 98765 43219',
    address: 'Bangalore, Karnataka',
  },
  {
    id: 'emp-011',
    name: 'Suresh Pillai',
    email: 'suresh.pillai@intelebee.com',
    department: 'Finance',
    designation: 'Finance Manager',
    joinDate: '2023-02-15',
    status: 'active',
    phone: '+91 98765 43220',
    address: 'Mumbai, Maharashtra',
  },
  {
    id: 'emp-012',
    name: 'Neha Kapoor',
    email: 'neha.kapoor@intelebee.com',
    department: 'Engineering',
    designation: 'QA Engineer',
    joinDate: '2024-05-20',
    managerId: 'emp-001',
    status: 'active',
    phone: '+91 98765 43221',
    address: 'Noida, UP',
  },
];

const generateAttendance = (): AttendanceRecord[] => {
  const records: AttendanceRecord[] = [];
  
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    if (date.getDay() === 0 || date.getDay() === 6) continue;
    
    employees.forEach(emp => {
      const rand = Math.random();
      let status: 'present' | 'wfh' | 'absent';
      if (rand < 0.7) status = 'present';
      else if (rand < 0.9) status = 'wfh';
      else status = 'absent';
      
      records.push({
        id: `att-${emp.id}-${dateStr}`,
        employeeId: emp.id,
        date: dateStr,
        status,
        checkIn: status !== 'absent' ? '09:00' : undefined,
        checkOut: status !== 'absent' ? '18:00' : undefined,
      });
    });
  }
  
  return records;
};

export const leaveRequests: LeaveRequest[] = [
  {
    id: 'leave-001',
    employeeId: 'emp-003',
    type: 'pto',
    startDate: '2026-01-20',
    endDate: '2026-01-22',
    hours: 24,
    reason: 'Family vacation',
    status: 'pending',
    createdAt: '2026-01-08',
  },
  {
    id: 'leave-002',
    employeeId: 'emp-004',
    type: 'sick',
    startDate: '2026-01-06',
    endDate: '2026-01-06',
    hours: 8,
    reason: 'Not feeling well',
    status: 'approved',
    managerNote: 'Approved',
    hrNote: 'Take care',
    createdAt: '2026-01-05',
  },
  {
    id: 'leave-003',
    employeeId: 'emp-007',
    type: 'regional',
    startDate: '2026-01-15',
    endDate: '2026-01-15',
    hours: 8,
    reason: 'Makar Sankranti celebration',
    status: 'manager_approved',
    managerNote: 'Approved for regional holiday',
    createdAt: '2026-01-04',
  },
  {
    id: 'leave-004',
    employeeId: 'emp-006',
    type: 'pto',
    startDate: '2026-02-10',
    endDate: '2026-02-12',
    hours: 24,
    reason: 'Personal work',
    status: 'pending',
    createdAt: '2026-01-07',
  },
  {
    id: 'leave-005',
    employeeId: 'emp-009',
    type: 'emergency',
    startDate: '2026-01-03',
    endDate: '2026-01-03',
    hours: 8,
    reason: 'Family emergency',
    status: 'approved',
    managerNote: 'Approved',
    hrNote: 'Approved',
    createdAt: '2026-01-02',
  },
];

export const leaveBalances: LeaveBalance[] = employees.map(emp => ({
  employeeId: emp.id,
  sick: 40,
  festival: 16,
  emergency: 16,
  regional: 24,
}));

export const goals: Goal[] = [
  {
    id: 'goal-001',
    employeeId: 'emp-003',
    title: 'Complete API refactoring',
    description: 'Refactor legacy REST APIs to GraphQL',
    progress: 60,
    dueDate: '2026-03-31',
    status: 'in_progress',
    createdBy: 'emp-001',
  },
  {
    id: 'goal-002',
    employeeId: 'emp-004',
    title: 'Implement design system',
    description: 'Build reusable component library',
    progress: 40,
    dueDate: '2026-02-28',
    status: 'in_progress',
    createdBy: 'emp-001',
  },
  {
    id: 'goal-003',
    employeeId: 'emp-006',
    title: 'Mobile app redesign',
    description: 'Complete UI/UX redesign for mobile app',
    progress: 80,
    dueDate: '2026-01-31',
    status: 'in_progress',
    createdBy: 'emp-005',
  },
  {
    id: 'goal-004',
    employeeId: 'emp-007',
    title: 'Database optimization',
    description: 'Optimize database queries and indexing',
    progress: 100,
    dueDate: '2025-12-31',
    status: 'completed',
    createdBy: 'emp-001',
  },
  {
    id: 'goal-005',
    employeeId: 'emp-009',
    title: 'Content strategy Q1',
    description: 'Develop content strategy for Q1 2026',
    progress: 25,
    dueDate: '2026-01-15',
    status: 'in_progress',
    createdBy: 'emp-008',
  },
];

export const reviews: Review[] = [
  {
    id: 'rev-001',
    employeeId: 'emp-003',
    reviewerId: 'emp-001',
    period: 'H2 2025',
    rating: 4,
    feedback: 'Excellent technical skills. Great team player. Areas to improve: documentation.',
    createdAt: '2025-12-20',
  },
  {
    id: 'rev-002',
    employeeId: 'emp-004',
    reviewerId: 'emp-001',
    period: 'H2 2025',
    rating: 4,
    feedback: 'Strong frontend skills. Takes initiative. Continue growing leadership capabilities.',
    createdAt: '2025-12-21',
  },
  {
    id: 'rev-003',
    employeeId: 'emp-006',
    reviewerId: 'emp-005',
    period: 'H2 2025',
    rating: 5,
    feedback: 'Outstanding design work. Consistently exceeds expectations.',
    createdAt: '2025-12-22',
  },
];

export const jobs: Job[] = [
  {
    id: 'job-001',
    title: 'Senior React Developer',
    department: 'Engineering',
    description: 'We are looking for an experienced React developer to join our frontend team.',
    requirements: ['5+ years React experience', 'TypeScript proficiency', 'State management expertise'],
    status: 'open',
    postedDate: '2026-01-02',
  },
  {
    id: 'job-002',
    title: 'DevOps Engineer',
    department: 'Engineering',
    description: 'Join our infrastructure team to build and maintain our cloud systems.',
    requirements: ['AWS/GCP experience', 'Kubernetes', 'CI/CD pipelines', 'Terraform'],
    status: 'open',
    postedDate: '2026-01-05',
  },
  {
    id: 'job-003',
    title: 'Product Designer',
    department: 'Design',
    description: 'Design user experiences for our products.',
    requirements: ['Figma expertise', 'User research skills', 'Design systems experience'],
    status: 'open',
    postedDate: '2025-12-20',
  },
];

export const candidates: Candidate[] = [
  {
    id: 'cand-001',
    jobId: 'job-001',
    name: 'Rahul Verma',
    email: 'rahul.verma@email.com',
    phone: '+91 99876 54321',
    stage: 'interview',
    notes: 'Strong technical background',
    appliedDate: '2026-01-03',
  },
  {
    id: 'cand-002',
    jobId: 'job-001',
    name: 'Pooja Singh',
    email: 'pooja.singh@email.com',
    phone: '+91 99876 54322',
    stage: 'applied',
    appliedDate: '2026-01-06',
  },
  {
    id: 'cand-003',
    jobId: 'job-002',
    name: 'Karthik Menon',
    email: 'karthik.menon@email.com',
    phone: '+91 99876 54323',
    stage: 'offer',
    notes: 'Excellent AWS knowledge',
    appliedDate: '2025-12-28',
  },
  {
    id: 'cand-004',
    jobId: 'job-003',
    name: 'Divya Krishnan',
    email: 'divya.k@email.com',
    phone: '+91 99876 54324',
    stage: 'interview',
    notes: 'Portfolio looks great',
    appliedDate: '2025-12-25',
  },
  {
    id: 'cand-005',
    jobId: 'job-001',
    name: 'Sanjay Rao',
    email: 'sanjay.rao@email.com',
    phone: '+91 99876 54325',
    stage: 'rejected',
    notes: 'Lacks required experience',
    appliedDate: '2026-01-02',
  },
];

export const policies: Policy[] = [
  {
    id: 'pol-001',
    title: 'Leave Policy',
    description: 'Company leave and time-off policy',
    content: `# Leave Policy

## PTO (Paid Time Off)
- Employees accrue 12 hours of PTO per month
- PTO cannot be carried forward to the next calendar year
- PTO requests require manager and HR approval

## Sick Leave
- 40 hours of sick leave per year
- Medical certificate required for leaves > 2 days

## Festival Leave
- 16 hours per year for festival celebrations

## Emergency Leave
- 16 hours per year for emergencies
- Requires immediate notification to manager

## Regional/Local Holidays
- Up to 24 hours (3 days) per year
- Requires manager approval
- For local/regional celebrations not in company holiday list`,
    category: 'HR',
    effectiveDate: '2026-01-01',
    version: '2.0',
  },
  {
    id: 'pol-002',
    title: 'Work From Home Policy',
    description: 'Guidelines for remote work',
    content: `# Work From Home Policy

## Eligibility
- All employees who have completed probation
- Role must be conducive to remote work

## Guidelines
- Must be available during core hours (10 AM - 6 PM)
- Reliable internet connection required
- Must attend all scheduled meetings
- Weekly WFH limit: 2 days (unless approved otherwise)

## Approval
- Notify manager at least 24 hours in advance
- Update attendance status in HRMS`,
    category: 'HR',
    effectiveDate: '2026-01-01',
    version: '1.5',
  },
  {
    id: 'pol-003',
    title: 'Code of Conduct',
    description: 'Professional behavior guidelines',
    content: `# Code of Conduct

## Core Values
- Integrity and honesty
- Respect for colleagues
- Professional behavior

## Workplace Guidelines
- Maintain professional communication
- Respect diversity and inclusion
- No harassment or discrimination
- Protect company confidential information

## Violations
- Violations will be reviewed by HR
- Actions may include warnings, suspension, or termination`,
    category: 'Compliance',
    effectiveDate: '2025-01-01',
    version: '1.0',
  },
  {
    id: 'pol-004',
    title: 'Holiday Calendar 2026',
    description: 'Official company holidays for 2026',
    content: `# Company Holidays 2026

| Holiday | Date | Day | Notes |
|---------|------|-----|-------|
| New Year's Day | Jan 1, 2026 | Thursday | |
| Republic Day | Jan 26, 2026 | Monday | |
| Holi | Mar 4, 2026 | Wednesday | |
| Independence Day | Aug 15, 2026 | Saturday | Observed Aug 14 (Fri) |
| Gandhi Jayanti | Oct 2, 2026 | Friday | |
| Diwali | Nov 8, 2026 | Sunday | Observed Nov 9 (Mon) |
| Christmas | Dec 25, 2026 | Friday | |

Total: 7 company holidays`,
    category: 'HR',
    effectiveDate: '2026-01-01',
    version: '1.0',
  },
];

export const acknowledgements: Acknowledgement[] = [
  {
    id: 'ack-001',
    policyId: 'pol-001',
    employeeId: 'emp-001',
    acknowledgedAt: '2026-01-02',
  },
  {
    id: 'ack-002',
    policyId: 'pol-002',
    employeeId: 'emp-001',
    acknowledgedAt: '2026-01-02',
  },
  {
    id: 'ack-003',
    policyId: 'pol-003',
    employeeId: 'emp-001',
    acknowledgedAt: '2026-01-02',
  },
  {
    id: 'ack-004',
    policyId: 'pol-004',
    employeeId: 'emp-001',
    acknowledgedAt: '2026-01-02',
  },
];

export const settings: Settings = {
  companyName: 'INTELEBEE LLC',
  ptoMonthlyAccrual: 12,
};

export function seedData() {
  return {
    auth: {
      currentRole: 'admin' as const,
      currentUserId: 'emp-001',
    },
    employees: {
      list: employees,
    },
    attendance: {
      records: generateAttendance(),
    },
    leaves: {
      requests: leaveRequests,
      balances: leaveBalances,
      holidays,
    },
    performance: {
      goals,
      reviews,
    },
    recruitment: {
      jobs,
      candidates,
    },
    policies: {
      list: policies,
      acknowledgements,
    },
    settings,
  };
}

export function getInitialState() {
  return seedData();
}
