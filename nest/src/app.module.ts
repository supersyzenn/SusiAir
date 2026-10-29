import { Controller, Get, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DataModule } from './data/data.service';
import { PilotModule } from './pilot/pilot.module';
import { FlightHoursModule } from './flight-hours/flight-hours.module';
import { DocumentsModule } from './documents/documents.module';
import { SchedulesModule } from './schedules/schedules.module';
@Controller()
class HealthController { @Get('health') health() { return { status:'ok' }; } }
@Module({ imports:[DataModule,AuthModule,PilotModule,FlightHoursModule,DocumentsModule,SchedulesModule],controllers:[HealthController] })
export class AppModule {}
