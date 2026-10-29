import { mkdir, writeFile } from 'node:fs/promises';
const origin='https://susiair.com';
try {
  const response=await fetch(origin,{signal:AbortSignal.timeout(20000)});
  if(!response.ok) throw new Error(`Website returned ${response.status}`);
  const html=await response.text();
  const tags=html.match(/<img\b[^>]*>/gi) || [];
  const logo=tags.find(tag=>/logo/i.test(tag));
  const source=logo?.match(/\bsrc=["']([^"']+)["']/i)?.[1]?.replaceAll('&amp;','&');
  if(!source) throw new Error('No official logo image found. Supply a verified asset manually.');
  const url=new URL(source,origin);
  if(url.protocol!=='https:') throw new Error('Expected HTTPS asset');
  const image=await fetch(url,{signal:AbortSignal.timeout(20000)});
  if(!image.ok) throw new Error(`Logo returned ${image.status}`);
  const type=image.headers.get('content-type') || '';
  if(!type.startsWith('image/') || type.includes('svg')) throw new Error(`Expected a raster image, got ${type}`);
  const bytes=Buffer.from(await image.arrayBuffer());
  if(bytes.length>2_000_000) throw new Error('Unexpectedly large logo');
  const output=new URL('../nuxt/public/susiair-logo.png',import.meta.url);
  await mkdir(new URL('../nuxt/public/',import.meta.url),{recursive:true});
  await writeFile(output,bytes);
  console.log(`Official logo downloaded from ${url.href}. Review the image before publishing.`);
} catch(error) {console.error(`Logo download failed: ${error.message}`);process.exitCode=1;}
