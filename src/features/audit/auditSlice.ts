import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AuditLog } from '../../types';

interface AuditState {
  logs: AuditLog[];
}

const initialState: AuditState = {
  logs: [],
};

const auditSlice = createSlice({
  name: 'audit',
  initialState,
  reducers: {
    addAuditLog: (state, action: PayloadAction<AuditLog>) => {
      state.logs.unshift(action.payload);
      if (state.logs.length > 100) {
        state.logs = state.logs.slice(0, 100);
      }
    },
    setAuditLogs: (state, action: PayloadAction<AuditLog[]>) => {
      state.logs = action.payload;
    },
    clearAuditLogs: (state) => {
      state.logs = [];
    },
  },
});

export const { addAuditLog, setAuditLogs, clearAuditLogs } = auditSlice.actions;

export const selectAuditLogs = (state: { audit: AuditState }) => state.audit.logs;

export default auditSlice.reducer;
