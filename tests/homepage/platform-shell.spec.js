const {test,expect}=require('@playwright/test');
test.beforeEach(async({page})=>{await page.route('**/api/auth/me',r=>r.fulfill({json:{user:{id:'nav-test',username:'navtest'}}}));});
test('shared navbar remains visible without legacy sidebar on platform routes',async({page})=>{
 for(const route of ['/courses','/practice','/timer','/workspace','/projects','/roadmaps','/community','/settings']){
  await page.goto(route,{waitUntil:'domcontentloaded'});const host=page.locator('#dh-platform-navigation');await expect(host).toBeVisible();await expect(host.locator('.nav-group').first()).toBeVisible();await expect(page.locator('.app>.sb')).toBeHidden();
 }
});
test('theme control in account dropdown persists independently of settings',async({page})=>{
 await page.goto('/settings',{waitUntil:'domcontentloaded'});const host=page.locator('#dh-platform-navigation');const before=await page.locator('html').getAttribute('data-theme');await host.getByRole('button',{name:'Open account options'}).click();await host.getByRole('button',{name:/Theme:/}).click();const after=before==='dark'?'light':'dark';await expect(page.locator('html')).toHaveAttribute('data-theme',after);await page.reload({waitUntil:'domcontentloaded'});await expect(page.locator('html')).toHaveAttribute('data-theme',after);
});
test('slow external fonts do not block grouped navigation',async({page})=>{
 await page.route('https://fonts.googleapis.com/**',r=>r.abort());await page.goto('/courses',{waitUntil:'domcontentloaded'});const host=page.locator('#dh-platform-navigation');await expect(host.getByRole('navigation',{name:'Main navigation',exact:true}).locator('.nav-group')).toHaveCount(5);
});
