import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Policy, Acknowledgement } from '../../types';
import type { RootState } from '../../store';

interface PoliciesState {
  list: Policy[];
  acknowledgements: Acknowledgement[];
}

const initialState: PoliciesState = {
  list: [],
  acknowledgements: [],
};

const policiesSlice = createSlice({
  name: 'policies',
  initialState,
  reducers: {
    setPolicies(state, action: PayloadAction<PoliciesState>) {
      state.list = action.payload.list;
      state.acknowledgements = action.payload.acknowledgements;
    },
    addPolicy(state, action: PayloadAction<Policy>) {
      state.list.push(action.payload);
    },
    updatePolicy(state, action: PayloadAction<Policy>) {
      const index = state.list.findIndex(p => p.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    deletePolicy(state, action: PayloadAction<string>) {
      state.list = state.list.filter(p => p.id !== action.payload);
    },
    acknowledgePolicy(state, action: PayloadAction<Acknowledgement>) {
      const existing = state.acknowledgements.find(
        a => a.policyId === action.payload.policyId && a.employeeId === action.payload.employeeId
      );
      if (!existing) {
        state.acknowledgements.push(action.payload);
      }
    },
  },
});

export const {
  setPolicies,
  addPolicy,
  updatePolicy,
  deletePolicy,
  acknowledgePolicy,
} = policiesSlice.actions;

export const selectAllPolicies = (state: RootState) => state.policies.list;

export const selectPolicyById = (id: string) => (state: RootState) =>
  state.policies.list.find(p => p.id === id);

export const selectAcknowledgements = (state: RootState) => state.policies.acknowledgements;

export const selectEmployeeAcknowledgements = (employeeId: string) => (state: RootState) =>
  state.policies.acknowledgements.filter(a => a.employeeId === employeeId);

export const selectUnacknowledgedPolicies = (employeeId: string) => (state: RootState) => {
  const acknowledged = state.policies.acknowledgements
    .filter(a => a.employeeId === employeeId)
    .map(a => a.policyId);
  return state.policies.list.filter(p => !acknowledged.includes(p.id));
};

export const selectPolicyAcknowledgementStatus = (policyId: string, employeeId: string) => (state: RootState) =>
  state.policies.acknowledgements.some(a => a.policyId === policyId && a.employeeId === employeeId);

export default policiesSlice.reducer;
