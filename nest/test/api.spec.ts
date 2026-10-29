import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/configure-app';
import { JwtService } from '@nestjs/jwt';

describe('real Nest API integration', () => {
  let app: INestApplication;
  let token: string;
  beforeAll(async () => {
    process.env.APP_TODAY = '2026-05-15';
    app = (await Test.createTestingModule({ imports: [AppModule] }).compile()).createNestApplication();
    configureApp(app);
    await app.init();
    const res = await request(app.getHttpServer()).post('/auth/login').send({ username: 'johndoe', password: 'susiairtest' });
    token = res.body.accessToken;
  });
  afterAll(async () => { await app?.close(); });
  const get = (path: string) => request(app.getHttpServer()).get(path).auth(token, { type: 'bearer' });
  it('returns a signed token and rejects bad credentials', async () => {
    expect(typeof token).toBe('string');
    const res = await request(app.getHttpServer()).post('/auth/login').send({ username: 'johndoe', password: 'wrong' }).expect(401);
    expect(res.body).toMatchObject({ statusCode: 401, code: 'UNAUTHORIZED', path: '/auth/login' });
  });
  it.each(['/pilot/me', '/documents', '/flight-hours/summary', '/flight-hours?from=2026-05-01&to=2026-05-15', '/schedules?year=2026&month=05', '/health'])('protects %s', async path => {
    await request(app.getHttpServer()).get(path).expect(401);
    await request(app.getHttpServer()).get(path).auth('forged', { type: 'bearer' }).expect(401);
  });
  it('rejects expired signed tokens', async () => {
    const expired = app.get(JwtService).sign({ sub: 'johndoe' }, { expiresIn: -1 });
    await request(app.getHttpServer()).get('/pilot/me').auth(expired, { type: 'bearer' }).expect(401);
  });
  it('uses seed profile and configured date', async () => {
    const res = await get('/pilot/me').expect(200);
    expect(res.body).toMatchObject({ name: 'John Doe', totalFlightHours: 1444.5, today: '2026-05-15' });
    expect(res.body.avatarUrl).toMatch(/avatar.svg$/);
  });
  it('returns daily history metadata and server totals without including unrequested future dates', async () => {
    const res=await get('/flight-hours?from=2026-05-01&to=2026-05-15').expect(200);
    expect(res.body).toMatchObject({from:'2026-05-01',to:'2026-05-15',today:'2026-05-15',dataStart:'2024-12-27',dataEnd:'2026-05-31',statistics:{totalHours:44,flyingDays:10,averageFlyingDayHours:4.4}});
    expect(res.body.days).toHaveLength(15);
    expect(res.body.days[14]).toEqual({date:'2026-05-15',hours:6.4});
    expect(res.body.days.every((day:{date:string})=>day.date<='2026-05-15')).toBe(true);
  });
  it('returns calendar-month statistics rather than rolling-30-day totals',async()=>{
    const res=await get('/flight-hours?from=2026-04-01&to=2026-04-30').expect(200);
    expect(res.body.statistics).toEqual({totalHours:101.6,flyingDays:23,averageFlyingDayHours:4.42});
    expect(res.body.days).toHaveLength(30);
  });
  it('returns zero statistics for a range with no recorded hours',async()=>{
    const res=await get('/flight-hours?from=2024-12-01&to=2024-12-02').expect(200);
    expect(res.body.statistics).toEqual({totalHours:0,flyingDays:0,averageFlyingDayHours:0});
    expect(res.body.days).toEqual([{date:'2024-12-01',hours:0},{date:'2024-12-02',hours:0}]);
  });
  it('returns all chart bounds, 15 dates, and server-calculated cards', async () => {
    for (const [range, windowDays, limit, max] of [['1w',7,40,45],['1m',30,100,125],['3m',90,300,325],['6m',180,600,625],['1y',365,1050,1200]]) {
      const res = await get(`/flight-hours/summary?range=${range}`).expect(200);
      expect(res.body).toMatchObject({ today: '2026-05-15', range, windowDays, limit, max });
      expect(res.body.series).toHaveLength(15);
      expect(res.body.series[0]).toMatchObject({ date: '2026-05-08', projected: false });
      expect(res.body.series[7]).toMatchObject({ date: '2026-05-15', projected: false });
      expect(res.body.series[14]).toMatchObject({ date: '2026-05-22', projected: true });
      expect(res.body.cards.map((c: {limit:number}) => c.limit)).toEqual([8,40,100,1050]);
    }
  });
  it('uses May 15 despite document seed May 31', async () => {
    const res = await get('/documents').expect(200);
    expect(res.body.documents.find((d: {id:string}) => d.id === 'doc_license')).toMatchObject({ daysRemaining: 14, status: 'soon' });
    expect(res.body.documents.find((d: {id:string}) => d.id === 'doc_security')).toMatchObject({ daysRemaining: -14, status: 'expired' });
  });
  it('filters months and accepts zero-padded month', async () => {
    const res = await get('/schedules?year=2026&month=05').expect(200);
    expect(res.body.schedules.length).toBeGreaterThan(0);
    expect(res.body.schedules.every((s: {duty_date:string}) => s.duty_date.startsWith('2026-05-'))).toBe(true);
    expect(res.body.legend).toHaveLength(10);
    expect((await get('/schedules?year=2027&month=1').expect(200)).body.schedules).toEqual([]);
  });
  it.each([
    '/flight-hours?from=2026-02-30&to=2026-03-02', '/flight-hours?from=2026-05-16&to=2026-05-15',
    '/flight-hours?from=2026-05-01', '/flight-hours?from=2000-01-01&to=2026-01-01',
    '/flight-hours/summary?range=2w', '/schedules?year=2026&month=13',
    '/schedules?year=abc&month=05', '/schedules?year=2026&month=1e1', '/documents?unexpected=1',
  ])('rejects invalid parameters: %s', async path => {
    const res = await get(path).expect(400);
    expect(res.body).toMatchObject({ statusCode:400, code:'BAD_REQUEST' });
    expect(res.body.message).toBeDefined();
  });
});
