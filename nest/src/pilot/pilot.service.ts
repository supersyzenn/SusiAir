import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';
@Injectable()
export class PilotService {
  constructor(private readonly data:DataService) {}
  me() { return { ...this.data.flights.pilot,avatarUrl:process.env.PILOT_AVATAR_URL || 'http://localhost:3000/avatar.svg',today:this.data.today }; }
}
