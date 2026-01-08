import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AttendanceRecord } from '../../types';
import type { RootState } from '../../store';
import { getTodayString } from '../../utils/dates';

interface AttendanceState {
  records: AttendanceRecord[];
}

const initialState: AttendanceState = {
  records: [],
};

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    setAttendance(state, action: PayloadAction<AttendanceRecord[]>) {
      state.records = action.payload;
    },
    addAttendance(state, action: PayloadAction<AttendanceRecord>) {
      state.records.push(action.payload);
    },
    updateAttendance(state, action: PayloadAction<AttendanceRecord>) {
      const index = state.records.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.records[index] = action.payload;
      }
    },
    deleteAttendance(state, action: PayloadAction<string>) {
      state.records = state.records.filter(r => r.id !== action.payload);
    },
  },
});

export const { setAttendance, addAttendance, updateAttendance, deleteAttendance } = attendanceSlice.actions;

export const selectAllAttendance = (state: RootState) => state.attendance.records;

export const selectTodayAttendance = (state: RootState) => {
  const today = getTodayString();
  return state.attendance.records.filter(r => r.date === today);
};

export const selectEmployeeAttendance = (employeeId: string) => (state: RootState) =>
  state.attendance.records.filter(r => r.employeeId === employeeId);

export const selectAttendanceByDate = (date: string) => (state: RootState) =>
  state.attendance.records.filter(r => r.date === date);

export const selectAttendancePercentage = (state: RootState) => {
  const today = getTodayString();
  const todayRecords = state.attendance.records.filter(r => r.date === today);
  const activeEmployees = state.employees.list.filter(e => e.status === 'active').length;
  if (activeEmployees === 0) return 0;
  const present = todayRecords.filter(r => r.status === 'present' || r.status === 'wfh').length;
  return Math.round((present / activeEmployees) * 100);
};

export default attendanceSlice.reducer;
