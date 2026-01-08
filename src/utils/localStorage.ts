const STORAGE_KEY = 'intelebee_hrms_state';

export function loadState<T>(defaultState: T): T {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return defaultState;
    return JSON.parse(serialized) as T;
  } catch {
    return defaultState;
  }
}

export function saveState<T>(state: T): void {
  try {
    const serialized = JSON.stringify(state);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch {
    // Ignore write errors
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore errors
  }
}
