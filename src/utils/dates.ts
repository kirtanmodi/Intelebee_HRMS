export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateShort(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

export function getMonthsBetween(startDate: string, endDate: string = new Date().toISOString()): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(0, months);
}

export function isCurrentYear(date: string): boolean {
  return new Date(date).getFullYear() === new Date().getFullYear();
}

export function getHoursBetweenDates(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const diffDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return diffDays * 8;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}
