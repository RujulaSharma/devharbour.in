const {test,expect}=require('@playwright/test');
for(const width of [1440,390])test(`grouped navigation works at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 await page.route('**/api/auth/me',r=>r.fulfill({json:{user:{id:'group-test',username:'groupuser'}}}));
 await page.goto('/courses',{waitUntil:'domcontentloaded'});
 const host=page.locator('#dh-platform-navigation'),nav=host.getByRole('navigation',{name:'Main navigation',exact:true});
 const group=name=>nav.locator('details').filter({has:page.locator('summary').filter({hasText:new RegExp('^'+name)})});
 await expect(nav.locator('details')).toHaveCount(5);
 for(const[name,label,path]of [['Learn','Courses','/courses'],['Practice','DSA & Challenges','/practice'],['Build','Workspace','/workspace'],['Explore','Hackathons','/hackathons']]){
  await group(name).locator('summary').click();await expect(group(name).getByRole('link',{name:label,exact:true})).toBeVisible();
  await group(name).getByRole('link',{name:label,exact:true}).click();await expect(page).toHaveURL(new RegExp(path+'$'));await expect(nav.locator('details[open]')).toHaveCount(0);
 }
 await group('Learn').locator('summary').click();await group('Build').locator('summary').click();await expect(nav.locator('details[open]')).toHaveCount(1);
 await page.keyboard.press('Escape');await expect(nav.locator('details[open]')).toHaveCount(0);
 await host.getByRole('button',{name:'Open account options'}).click();await expect(host.getByRole('navigation',{name:'Account options'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
