import { Controller, Get, Query } from '@nestjs/common';
import { ScheduleQueryDto } from '../common/query.dto';
import { SchedulesService } from './schedules.service';
@Controller('schedules')
export class SchedulesController {
  constructor(private readonly service:SchedulesService) {}
  @Get() list(@Query() query:ScheduleQueryDto) { return this.service.list(Number(query.year),Number(query.month)); }
}
