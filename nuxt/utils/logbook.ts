export function logbookRange(month:string,today:string):{from:string;to:string}|null {
  if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return null;
  const from=`${month}-01`;
  if(from>today) return null;
  const [year,monthNumber]=month.split('-').map(Number);
  const end=new Date(Date.UTC(year!,monthNumber!,0)).toISOString().slice(0,10);
  return {from,to:end<today?end:today};
}
export function historyBounds(today:string,dataStart:string|null,dataEnd:string|null):{firstMonth:string;lastMonth:string;lastDate:string}|null {
  if(!dataStart || !dataEnd || dataStart>today) return null;
  const lastDate=dataEnd<today?dataEnd:today;
  return {firstMonth:dataStart.slice(0,7),lastMonth:lastDate.slice(0,7),lastDate};
}
