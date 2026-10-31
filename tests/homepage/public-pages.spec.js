const {test,expect}=require('@playwright/test');
const {pages}=require('../../scripts/public-pages');
for(const width of [1440,390])test(`public information and guides work without JavaScript at ${width}px`,async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width,height:900}});
  const page=await context.newPage();
  for(const [slug,document] of Object.entries(pages)){
    const response=await page.goto('http://127.0.0.1:3000/'+slug);
    expect(response.status()).toBe(200);
    await expect(page.getByRole('heading',{name:document.title,exact:true})).toBeVisible();
    await expect(page.getByRole('navigation',{name:'Footer navigation'}).getByRole('link',{name:'Privacy Policy'})).toHaveAttribute('href','/privacy');
    expect(await page.locator('body').evaluate(body=>body.scrollWidth<=innerWidth)).toBe(true);
  }
  await page.goto('http://127.0.0.1:3000/contact');
  await expect(page.getByRole('link',{name:'Email admin@devharbour.in'})).toHaveAttribute('href','mailto:admin@devharbour.in');
  await page.goto('http://127.0.0.1:3000/resources');
  await page.locator('.cards a').first().click();
  await expect(page).toHaveURL(/\/guides\/choose-a-course$/);
  await page.goBack();await expect(page.getByRole('heading',{name:'Developer Learning Guides',exact:true})).toBeVisible();
  await page.screenshot({path:`.local/public-guides-${width}.png`,fullPage:true});
  await context.close();
});
test('homepage links reach real public information pages and preserve browser navigation',async({page})=>{
  await page.goto('/',{waitUntil:'domcontentloaded'});
  const home=page.locator('#dh-homepage');
  await expect(home.getByRole('heading',{name:'A little direction. A better next step.'})).toBeAttached();
  await home.locator('footer').getByRole('link',{name:'About',exact:true}).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('heading',{name:'About DevHarbour',exact:true})).toBeVisible();
  await page.reload();await expect(page.getByRole('heading',{name:'About DevHarbour',exact:true})).toBeVisible();
  await page.goBack();await expect(page.locator('#dh-homepage h1')).toBeVisible();
  const response=await page.goto('/not-a-real-page');expect(response.status()).toBe(404);
  await expect(page.getByRole('heading',{name:'Page not found'})).toBeVisible();
});
test('short certificate verification links use the existing public verifier',async({page})=>{
  // A synthetic ID and mocked read-only response avoid accessing participant records.
  await page.route('**/api/certificates/verify/navigation-test',route=>route.fulfill({status:404,json:{verified:false,error:'Certificate not found.'}}));
  await page.goto('/verify/navigation-test',{waitUntil:'domcontentloaded'});
  await expect(page.locator('#v-certificate')).toHaveClass(/on/);
  await expect(page.locator('#intro')).toHaveClass(/out/);
});
