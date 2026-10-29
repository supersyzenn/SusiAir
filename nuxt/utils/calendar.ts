export function monthCells(year:number,month:number): {date:string;day:number;current:boolean}[] {
  const first=new Date(Date.UTC(year,month-1,1));
  const offset=(first.getUTCDay()+6)%7;
  const days=new Date(Date.UTC(year,month,0)).getUTCDate();
  return Array.from({length:Math.ceil((offset+days)/7)*7},(_,i)=>{
    const date=new Date(Date.UTC(year,month-1,1-offset+i));
    return {date:date.toISOString().slice(0,10),day:date.getUTCDate(),current:date.getUTCMonth()===month-1};
  });
}
export function adjacentMonth(year:number,month:number,delta:number): {year:number;month:number} {
  const date=new Date(Date.UTC(year,month-1+delta,1));
  return {year:date.getUTCFullYear(),month:date.getUTCMonth()+1};
}
export function scheduleMonth(value:unknown):{year:number;month:number}|null {
  if(typeof value!=='string' || !/^(19|20|21)\d{2}-(0[1-9]|1[0-2])$/.test(value)) return null;
  const [year,month]=value.split('-').map(Number);
  return {year:year!,month:month!};
}
export function isScheduleDate(value:unknown):boolean {
  if(typeof value!=='string' || !/^(19|20|21)\d{2}-(0[1-9]|1[0-2])-\d{2}$/.test(value)) return false;
  const milliseconds=Date.parse(`${value}T00:00:00Z`);
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString().slice(0,10)===value;
}
