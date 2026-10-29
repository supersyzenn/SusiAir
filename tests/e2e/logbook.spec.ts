import {test,expect,type Page} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function login(page:Page) {
  const response=await page.request.post('http://localhost:3001/auth/login',{data:{username:'johndoe',password:'susiairtest'}});
  const {accessToken}=await response.json();
  await page.addInitScript(token=>sessionStorage.setItem('susiair-token',token),accessToken);
}
test('Logbook shows recorded daily hours, server totals and a zero-day filter',async({page})=>{
  await login(page);await page.goto('/logbook');
  await expect(page.getByRole('heading',{name:'May 2026'})).toBeVisible();
  await expect(page.getByTestId('logbook-total')).toHaveText('44 h');
  await expect(page.getByTestId('logbook-flying-days')).toHaveText('10');
  await expect(page.getByTestId('logbook-average')).toHaveText('4.4 h');
  await expect(page.locator('.logbook-table tbody tr')).toHaveCount(15);
  await expect(page.locator('.logbook-table tbody tr').first()).toContainText('15 May');
  await expect(page.getByRole('button',{name:'Next month'})).toBeDisabled();
  await page.getByRole('checkbox',{name:'Flying days only'}).check();
  await expect(page.locator('.logbook-table tbody tr')).toHaveCount(10);
  await page.getByRole('button',{name:'Previous month'}).click();
  await expect(page.getByRole('heading',{name:'April 2026'})).toBeVisible();
  await expect(page.getByTestId('logbook-total')).toHaveText('101.6 h');
  await expect(page.locator('.logbook-table tbody tr')).toHaveCount(23);
  await page.getByRole('button',{name:'Latest month'}).click();
  await expect(page.getByRole('heading',{name:'May 2026'})).toBeVisible();
  await expect(page.getByTestId('logbook-total')).toHaveText('44 h');
});
test('Logbook handles outage/retry and empty source history',async({page})=>{
  await login(page);
  await page.route('**/flight-hours?**',route=>route.abort());
  await page.goto('/logbook');
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await page.unroute('**/flight-hours?**');
  await page.getByRole('button',{name:'Try again'}).click();
  await expect(page.getByTestId('logbook-total')).toHaveText('44 h');
  await page.route('**/flight-hours?**',async route=>{
    const response=await route.fetch();const body=await response.json();
    body.dataStart=null;body.dataEnd=null;body.days=[];body.statistics={totalHours:0,flyingDays:0,averageFlyingDayHours:0};
    await route.fulfill({response,json:body});
  });
  await page.reload();
  await expect(page.getByText('No flight hours recorded yet.',{exact:true})).toBeVisible();
  await expect(page.getByRole('button',{name:'Previous month'})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Next month'})).toBeDisabled();
});
test('Logbook ignores a delayed older month response',async({page})=>{
  await login(page);
  await page.route('**/flight-hours?**',async route=>{
    if(new URL(route.request().url()).searchParams.get('from')==='2026-04-01') await new Promise(resolve=>setTimeout(resolve,300));
    await route.continue();
  });
  await page.goto('/logbook');
  await expect(page.getByTestId('logbook-total')).toHaveText('44 h');
  const delayed=page.waitForResponse(r=>new URL(r.url()).pathname==='/flight-hours' && new URL(r.url()).searchParams.get('from')==='2026-04-01');
  await page.getByRole('button',{name:'Previous month'}).click();
  await page.getByRole('button',{name:'Previous month'}).click();
  await expect(page.getByRole('heading',{name:'March 2026'})).toBeVisible();
  await expect(page.locator('.logbook-table tbody tr')).toHaveCount(31);
  await delayed;
  await expect(page.locator('.logbook-table tbody tr').first()).toContainText('31 Mar');
});
test('Logbook is accessible and stays inside narrow viewports',async({page})=>{
  await login(page);await page.goto('/logbook');
  await expect(page.getByTestId('logbook-total')).toHaveText('44 h');
  await page.evaluate(()=>document.fonts.ready);
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  await page.setViewportSize({width:320,height:844});
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
});
test('Logbook obeys the source start month and clamps a business date beyond source end',async({page})=>{
  await login(page);
  await page.route('**/pilot/me',async route=>{
    const response=await route.fetch();const body=await response.json();body.today='2026-07-15';
    await route.fulfill({response,json:body});
  });
  await page.route('**/flight-hours?**',async route=>{
    const response=await route.fetch();const body=await response.json();body.today='2026-07-15';body.dataStart='2026-04-01';
    await route.fulfill({response,json:body});
  });
  await page.goto('/logbook');
  await expect(page.getByRole('heading',{name:'May 2026'})).toBeVisible();
  await expect(page.getByText('Through 31 May 2026',{exact:true})).toBeVisible();
  await expect(page.locator('.logbook-table tbody tr')).toHaveCount(31);
  await expect(page.getByRole('button',{name:'Next month'})).toBeDisabled();
  await page.getByRole('button',{name:'Previous month'}).click();
  await expect(page.getByRole('heading',{name:'April 2026'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Previous month'})).toBeDisabled();
  await page.getByRole('button',{name:'Latest month'}).click();
  await expect(page.getByRole('heading',{name:'May 2026'})).toBeVisible();
});
