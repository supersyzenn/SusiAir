import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';
@Injectable()
export class SchedulesService {
  constructor(private readonly data:DataService) {}
  list(year:number,month:number) {
    const prefix = `${year}-${String(month).padStart(2,'0')}-`;
    return { today:this.data.today,year,month,legend:this.data.schedules.legend,schedules:this.data.schedules.schedules.filter(row => row.duty_date.startsWith(prefix)).sort((a,b) => a.duty_date.localeCompare(b.duty_date)) };
  }
}
