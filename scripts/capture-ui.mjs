import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
const output=new URL('../output/ui/',import.meta.url);
await mkdir(output,{recursive:true});
const browser=await chromium.launch({headless:true});
try {
  for(const [name,viewport] of [['compact',{width:320,height:844}],['mobile',{width:390,height:844}],['tablet',{width:768,height:1024}],['desktop',{width:1440,height:1000}],['wide',{width:1920,height:1080}],['ultrawide',{width:2560,height:1080}]]) {
    const touch=['compact','mobile','tablet'].includes(name);
    const context=await browser.newContext({viewport,deviceScaleFactor:1,isMobile:touch,hasTouch:touch});
    const page=await context.newPage();
    const errors=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.goto('http://localhost:3000/sign-in');
    await page.getByLabel('Username').waitFor();
    await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:new URL(`${name}-sign-in.png`,output).pathname,fullPage:true});
    await page.getByLabel('Username').fill('johndoe');
    await page.getByLabel('Password',{exact:true}).fill('susiairtest');
    await page.getByRole('button',{name:'Sign in',exact:true}).click();
    await page.getByRole('heading',{name:'John Doe'}).waitFor();
    await page.locator('.chart-card svg').waitFor();
    await page.locator('.avatar').evaluate(image=>image.decode());
    await page.screenshot({path:new URL(`${name}-home.png`,output).pathname,fullPage:true});
    await page.getByRole('link',{name:'Schedule',exact:true}).click();
    await page.getByRole('button',{name:/15 May 2026/}).waitFor();
    await page.screenshot({path:new URL(`${name}-schedule.png`,output).pathname,fullPage:true});
    await page.getByRole('button',{name:/^15 May 2026/}).click();
    await page.getByRole('heading',{name:'Detail page coming soon'}).waitFor();
    await page.screenshot({path:new URL(`${name}-schedule-detail.png`,output).pathname,fullPage:true});
    await page.getByRole('link',{name:'Back to schedule'}).click();
    await page.getByRole('link',{name:'Logbook',exact:true}).click();
    await page.getByTestId('logbook-total').waitFor();
    await page.locator('.logbook-table').waitFor();
    await page.screenshot({path:new URL(`${name}-logbook.png`,output).pathname,fullPage:true});
    console.log(JSON.stringify({viewport:name,pageErrors:errors,horizontalOverflow:await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth),favicon:await page.locator('link[rel="icon"]').getAttribute('href')}));
    await context.close();
  }
} finally {await browser.close();}
