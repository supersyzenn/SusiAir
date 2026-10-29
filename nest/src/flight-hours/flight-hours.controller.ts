import { Controller, Get, Query } from '@nestjs/common';
import { DateRangeDto, SummaryQueryDto } from '../common/query.dto';
import { FlightHoursService } from './flight-hours.service';
@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly service:FlightHoursService) {}
  @Get() daily(@Query() query:DateRangeDto) { return this.service.daily(query.from,query.to); }
  @Get('summary') summary(@Query() query:SummaryQueryDto) { return this.service.summary(query.range); }
}
