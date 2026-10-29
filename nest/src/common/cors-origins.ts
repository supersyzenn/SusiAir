export function corsOrigins(value:string, environment:string | undefined):string[] {
  const configured=value.split(',').map(origin=>origin.trim()).filter(Boolean);
  if(environment==='production') return configured;
  const allowed=new Set(configured);
  const localHosts=['localhost','127.0.0.1','0.0.0.0'];
  for(const origin of configured) {
    const url=new URL(origin);
    if(!['http:','https:'].includes(url.protocol) || !localHosts.includes(url.hostname)) continue;
    for(const host of localHosts) allowed.add(`${url.protocol}//${host}${url.port?`:${url.port}`:''}`);
  }
  return [...allowed];
}
