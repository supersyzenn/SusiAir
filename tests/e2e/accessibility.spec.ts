import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for(const screen of ['sign-in','home','schedule']) {
  test(`${screen} meets automated WCAG AA checks`,async({page})=>{
    if(screen!=='sign-in') {
      const response=await page.request.post('http://localhost:3001/auth/login',{data:{username:'johndoe',password:'susiairtest'}});
      const {accessToken}=await response.json();
      await page.addInitScript(token=>sessionStorage.setItem('susiair-token',token),accessToken);
    }
    await page.goto(screen==='home'?'/':`/${screen}`);
    if(screen==='home') await page.getByRole('heading',{name:'John Doe'}).waitFor();
    if(screen==='schedule') await page.getByRole('button',{name:/15 May 2026/}).waitFor();
    if(screen==='sign-in') await page.getByLabel('Username').waitFor();
    await page.evaluate(()=>document.fonts.ready);
    const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(results.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([]);
  });
}

test('chart labels remain readable and dates can be inspected with a keyboard',async({page})=>{
  const response=await page.request.post('http://localhost:3001/auth/login',{data:{username:'johndoe',password:'susiairtest'}});
  const {accessToken}=await response.json();
  await page.addInitScript(token=>sessionStorage.setItem('susiair-token',token),accessToken);
  await page.goto('/');
  await page.getByRole('heading',{name:'John Doe'}).waitFor();
  await expect.poll(()=>page.locator('.flight-chart svg .axis-label').first().evaluate(label=>{
    const svg=label.closest('svg')!;
    return parseFloat(getComputedStyle(label).fontSize)*svg.getBoundingClientRect().width/svg.viewBox.baseVal.width;
  })).toBeGreaterThanOrEqual(10);
  const slider=page.getByRole('slider',{name:'Selected chart date'});
  await slider.focus();
  await slider.press('End');
  await expect(page.getByTestId('chart-selection')).toContainText('22 May 2026');
  await expect(page.getByTestId('chart-selection')).toContainText('Projected');
  await slider.press('Home');
  await expect(page.getByTestId('chart-selection')).toContainText('8 May 2026');
  await expect(page.getByTestId('chart-selection')).toContainText('Recorded');
});

test('numeric cards stay inside their surfaces at narrow and tablet widths',async({page})=>{
  const response=await page.request.post('http://localhost:3001/auth/login',{data:{username:'johndoe',password:'susiairtest'}});
  const {accessToken}=await response.json();
  await page.addInitScript(token=>sessionStorage.setItem('susiair-token',token),accessToken);
  await page.goto('/');
  await page.getByRole('heading',{name:'John Doe'}).waitFor();
  for(const width of [320,768,1024]) {
    await page.setViewportSize({width,height:844});
    await expect.poll(()=>page.locator('.limit-value').evaluateAll(values=>values.every(value=>value.scrollWidth<=value.clientWidth+1)),{message:`Flight totals must fit their cards at ${width}px`}).toBe(true);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBe(true);
  }
});
