import { BadRequestException, Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';
import { dailyHours, dateMs, rollingHours, shiftDate } from '../common/calculations';
import { SummaryQueryDto } from '../common/query.dto';
@Injectable()
export class FlightHoursService {
  constructor(private readonly data:DataService) {}
  daily(from:string, to:string) {
    if (from > to) throw new BadRequestException('from must be on or before to');
    if ((dateMs(to)-dateMs(from))/86400000 > 3659) throw new BadRequestException('Date range cannot exceed 3660 days');
    const rows=this.data.flights.flightHours;
    const days=dailyHours(rows,from,to);
    const totalHours=Math.round(days.reduce((sum,day)=>sum+day.hours,0)*100)/100;
    const flyingDays=days.filter(day=>day.hours>0).length;
    const dates=rows.map(day=>day.date).sort();
    return {
      from,to,today:this.data.today,dataStart:dates[0] ?? null,dataEnd:dates.at(-1) ?? null,days,
      statistics:{totalHours,flyingDays,averageFlyingDayHours:flyingDays?Math.round(totalHours/flyingDays*100)/100:0},
    };
  }
  summary(range:SummaryQueryDto['range']) {
    const { today } = this.data;
    const { flightHours, limits, chartBounds } = this.data.flights;
    const bounds = chartBounds[range];
    const cards = ([['daily','Daily',1],['weekly','Weekly',7],['monthly','Monthly',30],['annual','Annual',365]] as const)
      .map(([key,label,windowDays]) => ({ key,label,windowDays,limit:limits[key],hours:rollingHours(flightHours,today,windowDays) }));
    const series = Array.from({ length:15 }, (_,i) => {
      const date = shiftDate(today,i-7);
      return { date,hours:rollingHours(flightHours,date,bounds.windowDays),projected:date>today };
    });
    return { today,range,windowDays:bounds.windowDays,limit:bounds.limit,max:bounds.max,cards,series };
  }
}
