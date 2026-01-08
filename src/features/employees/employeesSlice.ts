import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Employee } from "../../types";
import type { RootState } from "../../store";

interface EmployeesState {
  list: Employee[];
}

const initialState: EmployeesState = {
  list: [],
};

const employeesSlice = createSlice({
  name: "employees",
  initialState,
  reducers: {
    setEmployees(state, action: PayloadAction<Employee[]>) {
      state.list = action.payload;
    },
    addEmployee(state, action: PayloadAction<Employee>) {
      state.list.push(action.payload);
    },
    updateEmployee(state, action: PayloadAction<Employee>) {
      const index = state.list.findIndex((e) => e.id === action.payload.id);
      if (index !== -1) {
        state.list[index] = action.payload;
      }
    },
    deleteEmployee(state, action: PayloadAction<string>) {
      state.list = state.list.filter((e) => e.id !== action.payload);
    },
  },
});

export const { setEmployees, addEmployee, updateEmployee, deleteEmployee } = employeesSlice.actions;

export const selectAllEmployees = (state: RootState) => state.employees.list;

export const selectActiveEmployees = (state: RootState) => state.employees.list.filter((e) => e.status === "active");

export const selectEmployeeById = (id: string) => (state: RootState) => state.employees.list.find((e) => e.id === id);

export const selectTeamMembers = (managerId: string) => (state: RootState) => state.employees.list.filter((e) => e.managerId === managerId);

export const selectEmployeesByDepartment = (department: string) => (state: RootState) =>
  state.employees.list.filter((e) => e.department === department);

export default employeesSlice.reducer;
