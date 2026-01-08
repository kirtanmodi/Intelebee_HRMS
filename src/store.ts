import { configureStore, combineReducers } from '@reduxjs/toolkit';
import authReducer from './features/auth/authSlice';
import employeesReducer from './features/employees/employeesSlice';
import attendanceReducer from './features/attendance/attendanceSlice';
import leavesReducer from './features/leaves/leavesSlice';
import performanceReducer from './features/performance/performanceSlice';
import recruitmentReducer from './features/recruitment/recruitmentSlice';
import policiesReducer from './features/policies/policiesSlice';
import settingsReducer from './features/settings/settingsSlice';
import { loadState, saveState } from './utils/localStorage';
import { seedData, getInitialState } from './data/seedData';

const rootReducer = combineReducers({
  auth: authReducer,
  employees: employeesReducer,
  attendance: attendanceReducer,
  leaves: leavesReducer,
  performance: performanceReducer,
  recruitment: recruitmentReducer,
  policies: policiesReducer,
  settings: settingsReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

const persistedState = loadState<RootState | undefined>(undefined);

const preloadedState: RootState = persistedState ?? getInitialState();

export const store = configureStore({
  reducer: rootReducer,
  preloadedState,
});

store.subscribe(() => {
  saveState(store.getState());
});

export type AppDispatch = typeof store.dispatch;

export function resetStore() {
  const freshState = seedData();
  Object.keys(freshState).forEach(key => {
    const sliceKey = key as keyof RootState;
    const action = { type: `${sliceKey}/set${sliceKey.charAt(0).toUpperCase() + sliceKey.slice(1)}`, payload: freshState[sliceKey] };
    store.dispatch(action);
  });
}
