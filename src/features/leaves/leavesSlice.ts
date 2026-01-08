import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { LeaveRequest, LeaveBalance, Holiday } from '../../types';
import type { RootState } from '../../store';
import { getMonthsBetween, isCurrentYear } from '../../utils/dates';

interface LeavesState {
  requests: LeaveRequest[];
  balances: LeaveBalance[];
  holidays: Holiday[];
}

const initialState: LeavesState = {
  requests: [],
  balances: [],
  holidays: [],
};

const leavesSlice = createSlice({
  name: 'leaves',
  initialState,
  reducers: {
    setLeaves(state, action: PayloadAction<LeavesState>) {
      state.requests = action.payload.requests;
      state.balances = action.payload.balances;
      state.holidays = action.payload.holidays;
    },
    addLeaveRequest(state, action: PayloadAction<LeaveRequest>) {
      state.requests.push(action.payload);
    },
    updateLeaveRequest(state, action: PayloadAction<LeaveRequest>) {
      const index = state.requests.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.requests[index] = action.payload;
      }
    },
    deleteLeaveRequest(state, action: PayloadAction<string>) {
      state.requests = state.requests.filter(r => r.id !== action.payload);
    },
    approveByManager(state, action: PayloadAction<{ id: string; note?: string }>) {
      const request = state.requests.find(r => r.id === action.payload.id);
      if (request && request.status === 'pending') {
        request.status = 'manager_approved';
        request.managerNote = action.payload.note;
      }
    },
    approveByHR(state, action: PayloadAction<{ id: string; note?: string }>) {
      const request = state.requests.find(r => r.id === action.payload.id);
      if (request && (request.status === 'pending' || request.status === 'manager_approved')) {
        request.status = 'approved';
        request.hrNote = action.payload.note;
      }
    },
    rejectLeave(state, action: PayloadAction<{ id: string; note?: string; byHR?: boolean }>) {
      const request = state.requests.find(r => r.id === action.payload.id);
      if (request) {
        request.status = 'rejected';
        if (action.payload.byHR) {
          request.hrNote = action.payload.note;
        } else {
          request.managerNote = action.payload.note;
        }
      }
    },
    updateBalance(state, action: PayloadAction<LeaveBalance>) {
      const index = state.balances.findIndex(b => b.employeeId === action.payload.employeeId);
      if (index !== -1) {
        state.balances[index] = action.payload;
      } else {
        state.balances.push(action.payload);
      }
    },
    setHolidays(state, action: PayloadAction<Holiday[]>) {
      state.holidays = action.payload;
    },
  },
});

export const {
  setLeaves,
  addLeaveRequest,
  updateLeaveRequest,
  deleteLeaveRequest,
  approveByManager,
  approveByHR,
  rejectLeave,
  updateBalance,
  setHolidays,
} = leavesSlice.actions;

export const selectAllLeaveRequests = (state: RootState) => state.leaves.requests;

export const selectEmployeeLeaves = (employeeId: string) => (state: RootState) =>
  state.leaves.requests.filter(r => r.employeeId === employeeId);

export const selectPendingRequests = (state: RootState) =>
  state.leaves.requests.filter(r => r.status === 'pending' || r.status === 'manager_approved');

export const selectPendingForManager = (managerId: string) => (state: RootState) => {
  const teamMemberIds = state.employees.list
    .filter(e => e.managerId === managerId)
    .map(e => e.id);
  return state.leaves.requests.filter(
    r => teamMemberIds.includes(r.employeeId) && r.status === 'pending'
  );
};

export const selectPendingForHR = (state: RootState) =>
  state.leaves.requests.filter(r => r.status === 'manager_approved');

export const selectHolidays = (state: RootState) => state.leaves.holidays;

export const selectUpcomingHolidays = (count: number = 2) => (state: RootState) => {
  const today = new Date().toISOString().split('T')[0];
  return state.leaves.holidays
    .filter(h => (h.observed || h.date) >= today)
    .sort((a, b) => (a.observed || a.date).localeCompare(b.observed || b.date))
    .slice(0, count);
};

export const selectPTOBalance = (employeeId: string) => (state: RootState) => {
  const employee = state.employees.list.find(e => e.id === employeeId);
  if (!employee) return { accrued: 0, used: 0, available: 0 };

  const monthlyAccrual = state.settings?.ptoMonthlyAccrual ?? 12;
  const monthsWorked = getMonthsBetween(employee.joinDate);
  const accrued = monthsWorked * monthlyAccrual;

  const used = state.leaves.requests
    .filter(
      r =>
        r.employeeId === employeeId &&
        r.type === 'pto' &&
        r.status === 'approved' &&
        isCurrentYear(r.startDate)
    )
    .reduce((sum, r) => sum + r.hours, 0);

  return {
    accrued,
    used,
    available: Math.max(0, accrued - used),
  };
};

export const selectLeaveBalance = (employeeId: string) => (state: RootState) =>
  state.leaves.balances.find(b => b.employeeId === employeeId);

export default leavesSlice.reducer;
