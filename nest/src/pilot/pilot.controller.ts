import { Controller, Get, Query } from '@nestjs/common';
import { PilotService } from './pilot.service';
import { EmptyQueryDto } from '../common/query.dto';
@Controller('pilot')
export class PilotController {
  constructor(private readonly service:PilotService) {}
  @Get('me') me(@Query() _query:EmptyQueryDto) { return this.service.me(); }
}
