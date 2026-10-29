import { DataService } from '../src/data/data.service';
import { FlightHoursService } from '../src/flight-hours/flight-hours.service';

describe('daily history source boundaries',()=>{
  it('represents an empty source with null bounds and finite zero statistics',()=>{
    const data=new DataService();
    data.flights.flightHours.length=0;
    const result=new FlightHoursService(data).daily('2026-05-01','2026-05-02');
    expect(result.dataStart).toBeNull();expect(result.dataEnd).toBeNull();
    expect(result.statistics).toEqual({totalHours:0,flyingDays:0,averageFlyingDayHours:0});
    expect(result.days).toEqual([{date:'2026-05-01',hours:0},{date:'2026-05-02',hours:0}]);
  });
  it('finds true source bounds even when source rows are unsorted',()=>{
    const data=new DataService();
    data.flights.flightHours.reverse();
    const result=new FlightHoursService(data).daily('2026-05-01','2026-05-15');
    expect(result.dataStart).toBe('2024-12-27');expect(result.dataEnd).toBe('2026-05-31');
    expect(result.statistics).toEqual({totalHours:44,flyingDays:10,averageFlyingDayHours:4.4});
  });
});
