import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Settings } from '../../types';
import type { RootState } from '../../store';

const initialState: Settings = {
  companyName: 'INTELEBEE LLC',
  ptoMonthlyAccrual: 12,
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setSettings(state, action: PayloadAction<Settings>) {
      state.companyName = action.payload.companyName;
      state.ptoMonthlyAccrual = action.payload.ptoMonthlyAccrual;
    },
    updatePTOAccrual(state, action: PayloadAction<number>) {
      state.ptoMonthlyAccrual = action.payload;
    },
  },
});

export const { setSettings, updatePTOAccrual } = settingsSlice.actions;

export const selectSettings = (state: RootState) => state.settings;
export const selectCompanyName = (state: RootState) => state.settings.companyName;
export const selectPTOAccrual = (state: RootState) => state.settings.ptoMonthlyAccrual;

export default settingsSlice.reducer;
