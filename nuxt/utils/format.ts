export const hours = (value:number) => new Intl.NumberFormat('en-US',{ maximumFractionDigits:1 }).format(value);
export const formatDate = (date:string, options:Intl.DateTimeFormatOptions = { day:'numeric',month:'short',year:'numeric' }) => new Intl.DateTimeFormat('en-GB',{ ...options,timeZone:'UTC' }).format(new Date(`${date}T00:00:00Z`));
export function errorMessage(error:unknown): string {
  const e = error as { data?:{message?:string|string[]};message?:string };
  const message = e?.data?.message;
  if (message) return Array.isArray(message) ? message.join('. ') : message;
  return 'We could not reach the operations service. Please try again.';
}
