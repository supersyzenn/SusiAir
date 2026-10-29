import { test, expect, type Page } from '@playwright/test';
async function authenticatedSession(page:Page) {
  const response=await page.request.post('http://localhost:3001/auth/login',{data:{username:'johndoe',password:'susiairtest'}});
  expect(response.ok()).toBe(true);
  const {accessToken}=await response.json();
  await page.addInitScript(token=>sessionStorage.setItem('susiair-token',token),accessToken);
}
test('pilot signs in, reviews limits, browses months, and signs out', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveURL(/sign-in/);
  await page.getByLabel('Username').fill('johndoe');
  await page.getByLabel('Password', { exact:true }).fill('wrong');
  await page.getByRole('button', { name:'Sign in',exact:true }).click();
  await expect(page.locator('form').getByRole('alert')).toContainText('Incorrect username or password');
  await page.getByLabel('Password', { exact:true }).fill('susiairtest');
  await page.getByRole('button', { name:'Sign in',exact:true }).click();
  await expect(page.getByRole('heading', { name:'John Doe' })).toBeVisible();
  await expect(page.getByText('1,444.5')).toBeVisible();
  await expect(page.getByRole('heading', { name:'Hours to limit' })).toBeVisible();
  await page.getByRole('button', { name:'1m',exact:true }).click();
  await expect(page.getByTestId('limit-label')).toHaveText('100 h limit');
  await page.getByRole('button', { name:'1y',exact:true }).click();
  await expect(page.getByTestId('limit-label')).toHaveText('1050 h limit');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await expect(page.getByText('Expired', { exact:true })).toBeVisible();
  await page.getByRole('link', { name:'Schedule',exact:true }).click();
  await expect(page.getByRole('heading', { name:'May 2026' })).toBeVisible();
  await page.getByRole('button', { name:'Next month' }).click();
  await expect(page.getByRole('heading', { name:'June 2026' })).toBeVisible();
  await page.getByRole('button', { name:'Previous month' }).click();
  await page.getByRole('button', { name:/15 May 2026/ }).click();
  await expect(page.getByRole('heading', { name:'Detail page coming soon' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.getByRole('button', { name:'Sign out' }).click();
  await expect(page).toHaveURL(/sign-in/);
});
test('API outage shows retry and no fabricated data', async ({ page }) => {
  await authenticatedSession(page);
  await page.route('**/pilot/me', route => route.abort());
  await page.goto('/');
  await expect(page.getByRole('main').getByRole('alert')).toBeVisible();
  await expect(page.getByRole('button', { name:'Try again' })).toBeVisible();
  await page.unroute('**/pilot/me');
  await page.getByRole('button', { name:'Try again' }).click();
  await expect(page.getByRole('heading', { name:'John Doe' })).toBeVisible();
});
test('unauthorized API response clears saved session', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('susiair-token','expired-token'));
  await page.goto('/');
  await expect(page).toHaveURL(/sign-in/);
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('susiair-token'))).toBeNull();
});
test('rapid month navigation ignores delayed earlier responses and crosses years', async ({page})=>{
  await authenticatedSession(page);
  await page.route('**/schedules?**',async route=>{
    if(new URL(route.request().url()).searchParams.get('month')==='04') await new Promise(resolve=>setTimeout(resolve,300));
    await route.continue();
  });
  await page.goto('/schedule');
  await expect(page.getByRole('heading',{name:'May 2026'})).toBeVisible();
  await expect(page.getByRole('button',{name:/15 May 2026/})).toBeVisible();
  const delayed=page.waitForResponse(response=>new URL(response.url()).pathname==='/schedules' && new URL(response.url()).searchParams.get('month')==='04');
  await page.getByRole('button',{name:'Previous month'}).click();
  await page.getByRole('button',{name:'Previous month'}).click();
  await expect(page.getByRole('heading',{name:'March 2026'})).toBeVisible();
  await expect(page.getByText('No duties scheduled for March 2026.')).toBeVisible();
  await delayed;
  await expect(page.getByText('No duties scheduled for March 2026.')).toBeVisible();
  for(let i=0;i<3;i++) await page.getByRole('button',{name:'Previous month'}).click();
  await expect(page.getByRole('heading',{name:'December 2025'})).toBeVisible();
  await page.getByRole('button',{name:'Next month'}).click();
  await expect(page.getByRole('heading',{name:'January 2026'})).toBeVisible();
  await expect(page.getByText('No duties scheduled for January 2026.')).toBeVisible();
});
test('dashboard exposes chart overflow without widening the viewport', async({page})=>{
  await authenticatedSession(page);
  // Deliberately alter one real response to exercise the above-scale visual case.
  await page.route('**/flight-hours/summary?range=1w',async route=>{
    const response=await route.fetch();
    const body=await response.json();
    body.series[7].hours=70;
    await route.fulfill({response,json:body});
  });
  await page.goto('/');
  await expect(page.getByText('Values above the chart scale',{exact:false})).toBeVisible();
  await expect(page.locator('.overflow-marker')).toHaveCount(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  await page.getByText('View daily totals',{exact:true}).click();
  await expect(page.getByRole('row').filter({hasText:'15 May 2026'})).toContainText('70');
});
for(const host of ['0.0.0.0','127.0.0.1']) {
  test(`login works when local app is opened through ${host}`,async({page,browserName})=>{
    test.skip(host==='0.0.0.0' && browserName==='webkit','WebKit does not navigate to the wildcard bind address; use localhost or 127.0.0.1.');
    await page.goto(`http://${host}:3000/sign-in`);
    await page.getByLabel('Username').fill('johndoe');
    await page.getByLabel('Password',{exact:true}).fill('susiairtest');
    await page.getByRole('button',{name:'Sign in',exact:true}).click();
    await expect(page.getByRole('heading',{name:'John Doe'})).toBeVisible();
    await expect(page.getByRole('main').getByRole('alert')).toHaveCount(0);
  });
}
