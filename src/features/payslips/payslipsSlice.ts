import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Payslip } from '../../types';

interface PayslipsState {
  list: Payslip[];
}

const initialState: PayslipsState = {
  list: [],
};

const payslipsSlice = createSlice({
  name: 'payslips',
  initialState,
  reducers: {
    generatePayslip: (state, action: PayloadAction<Payslip>) => {
      const exists = state.list.find(
        p => p.employeeId === action.payload.employeeId && 
             p.month === action.payload.month && 
             p.year === action.payload.year
      );
      if (!exists) {
        state.list.push(action.payload);
      }
    },
    setPayslips: (state, action: PayloadAction<Payslip[]>) => {
      state.list = action.payload;
    },
  },
});

export const { generatePayslip, setPayslips } = payslipsSlice.actions;

export const selectPayslips = (state: { payslips: PayslipsState }) => state.payslips.list;

export const selectEmployeePayslips = (employeeId: string) => (state: { payslips: PayslipsState }) =>
  state.payslips.list.filter(p => p.employeeId === employeeId);

export const selectPayslipByMonthYear = (employeeId: string, month: number, year: number) => 
  (state: { payslips: PayslipsState }) =>
    state.payslips.list.find(
      p => p.employeeId === employeeId && p.month === month && p.year === year
    );

export default payslipsSlice.reducer;
