import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Goal, Review } from '../../types';
import type { RootState } from '../../store';

interface PerformanceState {
  goals: Goal[];
  reviews: Review[];
}

const initialState: PerformanceState = {
  goals: [],
  reviews: [],
};

const performanceSlice = createSlice({
  name: 'performance',
  initialState,
  reducers: {
    setPerformance(state, action: PayloadAction<PerformanceState>) {
      state.goals = action.payload.goals;
      state.reviews = action.payload.reviews;
    },
    addGoal(state, action: PayloadAction<Goal>) {
      state.goals.push(action.payload);
    },
    updateGoal(state, action: PayloadAction<Goal>) {
      const index = state.goals.findIndex(g => g.id === action.payload.id);
      if (index !== -1) {
        state.goals[index] = action.payload;
      }
    },
    deleteGoal(state, action: PayloadAction<string>) {
      state.goals = state.goals.filter(g => g.id !== action.payload);
    },
    addReview(state, action: PayloadAction<Review>) {
      state.reviews.push(action.payload);
    },
    updateReview(state, action: PayloadAction<Review>) {
      const index = state.reviews.findIndex(r => r.id === action.payload.id);
      if (index !== -1) {
        state.reviews[index] = action.payload;
      }
    },
  },
});

export const {
  setPerformance,
  addGoal,
  updateGoal,
  deleteGoal,
  addReview,
  updateReview,
} = performanceSlice.actions;

export const selectAllGoals = (state: RootState) => state.performance.goals;

export const selectEmployeeGoals = (employeeId: string) => (state: RootState) =>
  state.performance.goals.filter(g => g.employeeId === employeeId);

export const selectAllReviews = (state: RootState) => state.performance.reviews;

export const selectEmployeeReviews = (employeeId: string) => (state: RootState) =>
  state.performance.reviews.filter(r => r.employeeId === employeeId);

export const selectReviewsByReviewer = (reviewerId: string) => (state: RootState) =>
  state.performance.reviews.filter(r => r.reviewerId === reviewerId);

export default performanceSlice.reducer;
