import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Role } from '../../types';

interface AuthState {
  currentRole: Role;
  currentUserId: string;
}

const initialState: AuthState = {
  currentRole: 'admin',
  currentUserId: 'emp-001',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setRole(state, action: PayloadAction<Role>) {
      state.currentRole = action.payload;
    },
    setCurrentUser(state, action: PayloadAction<string>) {
      state.currentUserId = action.payload;
    },
  },
});

export const { setRole, setCurrentUser } = authSlice.actions;
export default authSlice.reducer;
