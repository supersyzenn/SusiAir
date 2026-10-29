export type Range = '1w'|'1m'|'3m'|'6m'|'1y';
export interface Pilot { name:string; totalFlightHours:number; avatarUrl:string; today:string }
export interface LimitCard { key:string; label:string; hours:number; limit:number; windowDays:number }
export interface Summary { today:string;range:Range;windowDays:number;limit:number;max:number;cards:LimitCard[];series:{date:string;hours:number;projected:boolean}[] }
export interface PilotDocument { id:string;label:string;expiryDate:string;daysRemaining:number;status:'safe'|'soon'|'expired' }
export interface DocumentsResponse { today:string;warningDays:number;documents:PilotDocument[] }
export interface Schedule { id:string;duty_date:string;status:number;base_name:string;base_color:string;duty_type:string;count_schedules:number;count_logbooks:number }
export interface LegendItem { code:string;label:string;color:string }
export interface SchedulesResponse { today:string;year:number;month:number;legend:LegendItem[];schedules:Schedule[] }
export interface DailyHoursResponse {
  from:string;to:string;today:string;dataStart:string|null;dataEnd:string|null;
  days:{date:string;hours:number}[];
  statistics:{totalHours:number;flyingDays:number;averageFlyingDayHours:number};
}
