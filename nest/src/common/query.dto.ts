import { IsIn, IsOptional, IsString, Matches, registerDecorator } from 'class-validator';
import { isCalendarDate } from './calculations';

export class EmptyQueryDto {}
function CalendarDate() {
  return (object: object, propertyName: string) => registerDecorator({
    name:'calendarDate', target:object.constructor, propertyName,
    options:{ message:`${propertyName} must be a real YYYY-MM-DD date` },
    validator:{ validate:(value: unknown) => typeof value === 'string' && isCalendarDate(value) },
  });
}
export class DateRangeDto {
  @IsString() @CalendarDate() from!: string;
  @IsString() @CalendarDate() to!: string;
}
export class SummaryQueryDto {
  @IsOptional() @IsIn(['1w','1m','3m','6m','1y']) range: '1w'|'1m'|'3m'|'6m'|'1y' = '1w';
}
export class ScheduleQueryDto {
  @IsString() @Matches(/^(19|20|21)\d{2}$/, { message:'year must be between 1900 and 2199' }) year!: string;
  @IsString() @Matches(/^(0?[1-9]|1[0-2])$/, { message:'month must be between 1 and 12' }) month!: string;
}
