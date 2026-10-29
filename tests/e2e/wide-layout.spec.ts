import {test,expect,type Page} from '@playwright/test';
async function login(page:Page) {
  const response=await page.request.post('http://localhost:3001/auth/login',{data:{username:'johndoe',password:'susiairtest'}});
  const {accessToken}=await response.json();
  await page.addInitScript(token=>sessionStorage.setItem('susiair-token',token),accessToken);
}
test('app screens use the available wide viewport and keep their content inside it',async({page})=>{
  await login(page);
  for(const width of [1920,2560]) {
    await page.setViewportSize({width,height:1080});
    for(const path of ['/','/schedule','/logbook']) {
      await page.goto(path);
      if(path==='/') await page.getByRole('heading',{name:'John Doe'}).waitFor();
      if(path==='/schedule') await page.getByRole('button',{name:/15 May 2026/}).waitFor();
      if(path==='/logbook') await page.getByTestId('logbook-total').waitFor();
      const layout=await page.locator('main').evaluate(main=>({width:main.getBoundingClientRect().width,scroll:document.documentElement.scrollWidth,viewport:window.innerWidth}));
      expect(layout.width,`${path} should fill ${width}px viewport`).toBeGreaterThanOrEqual(width*.98);
      expect(layout.scroll).toBeLessThanOrEqual(layout.viewport);
    }
  }
});
test('schedule detail stays a dated placeholder and returns to the selected month',async({page})=>{
  await login(page);await page.goto('/schedule');
  await page.getByRole('button',{name:/15 May 2026/}).waitFor();
  await page.getByRole('button',{name:'Previous month'}).click();
  await expect(page.getByRole('heading',{name:'April 2026'})).toBeVisible();
  await page.getByRole('button',{name:/^8 Apr 2026/}).click();
  await expect(page.getByRole('heading',{name:'Detail page coming soon'})).toBeVisible();
  await expect(page.getByText('Duty details for 8 Apr 2026 will be available here.',{exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Back to schedule'}).click();
  await expect(page.getByRole('heading',{name:'April 2026'})).toBeVisible();
  await page.getByRole('button',{name:'Today',exact:true}).click();
  await expect(page.getByRole('heading',{name:'May 2026'})).toBeVisible();
});
test('impossible schedule detail dates show the not-found page',async({page})=>{
  await login(page);await page.goto('/schedule/2026-02-30');
  await expect(page.getByRole('heading',{name:'Page not found'})).toBeVisible();
});
