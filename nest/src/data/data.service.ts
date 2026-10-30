import { Global, Injectable, Module } from '@nestjs/common';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { z } from 'zod';
import { isCalendarDate } from '../common/calculations';

const date = z.string().refine(isCalendarDate, 'Invalid calendar date');
const color = z.string().regex(/^#[0-9a-f]{6}$/i);
const flightSchema = z.object({
  pilot: z.object({ name: z.string().min(1), totalFlightHours: z.number().nonnegative() }),
  limits: z.object({ daily: z.number().positive(), weekly: z.number().positive(), monthly: z.number().positive(), annual: z.number().positive() }),
  chartBounds: z.record(z.object({ limit: z.number().positive(), max: z.number().positive(), windowDays: z.number().int().positive(), displayRangeDays: z.number().int().positive() })),
  flightHours: z.array(z.object({ date, hours: z.number().nonnegative() })),
});
const documentSchema = z.object({
  thresholds: z.object({ warningDays: z.number().int().nonnegative() }),
  documents: z.array(z.object({ id: z.string(), label: z.string(), expiryDate: date })),
});
const scheduleSchema = z.object({
  legend: z.array(z.object({ code: z.string(), label: z.string(), color })),
  schedules: z.array(z.object({
    id: z.string(), duty_date: date, status: z.number().int(), base_name: z.string(), base_color: color,
    duty_type: z.string(), count_schedules: z.number().int().nonnegative(), count_logbooks: z.number().int().nonnegative(),
  })),
});

@Injectable()
export class DataService {
  readonly today = process.env.APP_TODAY || '2026-05-15';
  readonly flights = flightSchema.parse(this.read('mock-flight-hours.json'));
  readonly documents = documentSchema.parse(this.read('mock-documents.json'));
  readonly schedules = scheduleSchema.parse(this.read('mock-schedules.json'));
  constructor() {
    if (!isCalendarDate(this.today)) throw new Error('APP_TODAY must be a real YYYY-MM-DD date');
    const dates = this.flights.flightHours.map(row => row.date);
    if (new Set(dates).size !== dates.length) throw new Error('Flight data contains duplicate dates');
    for (const range of ['1w', '1m', '3m', '6m', '1y']) {
      if (!this.flights.chartBounds[range]) throw new Error(`Missing chart bounds for ${range}`);
    }
    const codes = new Set(this.schedules.legend.map(item => item.code));
    if (this.schedules.schedules.some(row => !codes.has(row.duty_type))) throw new Error('Unknown schedule duty type');
  }
  private read(name: string): unknown {
    const candidates = [
      process.env.DATA_DIR ? resolve(process.env.DATA_DIR, name) : null,
      resolve(__dirname, '../../data', name),
      resolve(__dirname, '../data', name),
      resolve(process.cwd(), 'data', name),
      resolve(process.cwd(), 'nest/data', name),
    ].filter(Boolean) as string[];

    for (const filePath of candidates) {
      if (existsSync(filePath)) {
        return JSON.parse(readFileSync(filePath, 'utf8'));
      }
    }
    return JSON.parse(readFileSync(resolve(process.env.DATA_DIR || resolve(__dirname, '../../data'), name), 'utf8'));
  }
}
@Global()
@Module({ providers: [DataService], exports: [DataService] })
export class DataModule { }
