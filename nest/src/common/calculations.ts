export type FlightDay = { date: string; hours: number };
const DAY = 86_400_000;
export const dateMs = (date: string): number => Date.parse(`${date}T00:00:00.000Z`);
export const shiftDate = (date: string, days: number): string => new Date(dateMs(date) + days * DAY).toISOString().slice(0, 10);
export const isCalendarDate = (value: string): boolean => /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(dateMs(value)) && new Date(dateMs(value)).toISOString().slice(0, 10) === value;
export function rollingHours(rows: FlightDay[], end: string, windowDays: number): number {
  const start = shiftDate(end, 1 - windowDays);
  return Math.round(rows.reduce((sum, row) => row.date >= start && row.date <= end ? sum + row.hours : sum, 0) * 100) / 100;
}
export function dailyHours(rows: FlightDay[], from: string, to: string): FlightDay[] {
  const byDate = new Map(rows.map(row => [row.date, row.hours]));
  const days: FlightDay[] = [];
  for (let date = from; date <= to; date = shiftDate(date, 1)) days.push({ date, hours: byDate.get(date) ?? 0 });
  return days;
}
export function documentState(expiry: string, today: string, warningDays: number): { daysRemaining: number; status: 'expired' | 'soon' | 'safe' } {
  const daysRemaining = Math.round((dateMs(expiry) - dateMs(today)) / DAY);
  return { daysRemaining, status: daysRemaining <= 0 ? 'expired' : daysRemaining <= warningDays ? 'soon' : 'safe' };
}
