const {test,expect}=require('@playwright/test');
for(const width of [1440,768,390])test(`reference homepage real data and navigation at ${width}px`,async({page,request})=>{
 await page.setViewportSize({width,height:1000});await page.emulateMedia({reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',error=>errors.push(error.message));
 const courses=(await(await request.get('/api/courses')).json()).courses;
 await page.goto('/',{waitUntil:'domcontentloaded'});const home=page.locator('#dh2-homepage');
 await expect(home.locator('h1')).toContainText('DEV HARBOUR');await expect(page.locator('#dh-homepage-boot')).toBeHidden();
 const toggleBtn = home.locator('.dh2-theme-toggle');
 await expect(toggleBtn).toBeVisible();
 const initialBg = await home.evaluate(el => getComputedStyle(el).backgroundColor);
 expect(['rgb(239, 233, 253)', 'rgb(0, 0, 0)']).toContain(initialBg);
 await expect(home.locator('.dh2-course')).toHaveCount(Math.min(4,courses.length));
 if(courses.length)await expect(home.locator('.dh2-course').first()).toContainText(courses[0].title);
 expect(await home.locator('.xi').evaluate(image=>image.complete&&image.naturalWidth>0)).toBe(true);
 expect(await page.locator('#intro').evaluate(node=>node.scrollWidth<=node.clientWidth+1)).toBe(true);
 await expect(home.getByRole('link',{name:'Dashboard',exact:true})).toHaveCount(0);
 await home.getByRole('button',{name:'Log in',exact:true}).click();await expect(page.locator('#dh-auth-modal')).toHaveClass(/open/);
 await page.reload({waitUntil:'domcontentloaded'});await expect(home.locator('h1')).toBeVisible();
 if(width===390){await home.locator('.dh2-mobile-nav summary').click();await home.getByRole('navigation',{name:'Mobile navigation'}).getByRole('link',{name:'Learn',exact:true}).click();}
 else await home.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Learn',exact:true}).click();
 await expect(page).toHaveURL(/\/courses$/);await expect(page.locator('#v-learn')).toHaveClass(/on/);await expect(page.locator('#dh-platform-navigation')).toBeVisible();
 await page.goBack({waitUntil:'domcontentloaded'});await expect(home.locator('h1')).toBeVisible();
 await home.getByRole('link',{name:'Scroll to explore',exact:true}).click();await expect(home.locator('#featured')).toBeInViewport();
 await home.getByRole('button',{name:'Try Challenge',exact:true}).click();await expect(home.locator('#dh2-challenge-details')).toBeVisible();
 await home.getByRole('button',{name:'Another challenge',exact:true}).click();await expect(home.locator('#challenge h3')).toHaveText('Valid Parentheses');
 await page.locator('#intro').evaluate(node=>node.scrollTop=0);await page.screenshot({path:`.local/dh2-tested-${width}.png`,timeout:10000});
 expect(errors).toEqual([]);
});
test('reference account menu reuses existing authenticated routes and closes with Escape',async({page})=>{
 await page.route('**/api/auth/me',route=>route.fulfill({json:{user:{id:'dh2-ui-test',username:'referenceuser',fullName:'Reference User'}}}));
 await page.goto('/',{waitUntil:'domcontentloaded'});const home=page.locator('#dh2-homepage');
 await expect(home.getByRole('button',{name:'Log in',exact:true})).toHaveCount(0);
 await home.locator('.dh2-account summary').click();const menu=home.getByRole('navigation',{name:'Account navigation'});
 await expect(menu.getByRole('link',{name:'Dashboard',exact:true})).toBeVisible();await expect(menu.getByRole('button',{name:'Sign out',exact:true})).toBeVisible();
 await page.keyboard.press('Escape');await expect(menu).toBeHidden();
 await home.locator('.dh2-account summary').click();await menu.getByRole('link',{name:'Settings',exact:true}).click();
 await expect(page).toHaveURL(/\/settings$/);await expect(page.locator('#dh-platform-navigation')).toBeVisible();
});
test('reference homepage API outages remain honest and do not import demo rankings',async({page})=>{
 for(const route of ['**/api/courses','**/api/projects','**/api/leaderboard?*'])await page.route(route,r=>r.fulfill({status:503,json:{error:'Unavailable'}}));
 await page.goto('/',{waitUntil:'domcontentloaded'});const home=page.locator('#dh2-homepage');
 await expect(home.getByRole('status')).toContainText('could not be loaded');await expect(home.locator('.dh2-podium')).toHaveCount(0);
 await expect(home.locator('h1')).toBeVisible();await expect(home.locator('.dh2-empty').first()).toContainText('temporarily unavailable');
});
test('weekly ranking tab reads the existing public API without changing records',async({page})=>{
 await page.route('**/api/leaderboard?timeframe=Weekly&limit=50',route=>route.fulfill({json:{rankings:[{userId:'weekly-fixture',username:'weekly_fixture',fullName:'Weekly fixture',xp:35,challengesSolved:2}]}}));
 await page.goto('/',{waitUntil:'domcontentloaded'});const home=page.locator('#dh2-homepage');
 await home.getByRole('tab',{name:'Weekly',exact:true}).click();await expect(home.locator('#leaderboard .dh2-podium')).toHaveCount(1);await expect(home.locator('#leaderboard .dh2-podium')).toContainText('Weekly fixture');
 await home.getByRole('tab',{name:'All-time',exact:true}).click();await expect(home.getByRole('tab',{name:'All-time',exact:true})).toHaveAttribute('aria-selected','true');
});
test('navbar theme toggle toggles between light and dark themes',async({page})=>{
 await page.goto('/',{waitUntil:'domcontentloaded'});const home=page.locator('#dh2-homepage');
 const toggle=home.locator('.dh2-theme-toggle');
 await expect(toggle).toBeVisible();
 await page.evaluate(() => window.setPlatformTheme?.('light'));
 await expect(home).toHaveAttribute('data-theme', 'light');
 await expect(home).toHaveCSS('background-color', 'rgb(239, 233, 253)');
 await toggle.click();
 await expect(home).toHaveAttribute('data-theme', 'dark');
 await expect(home).toHaveCSS('background-color', 'rgb(0, 0, 0)');
 await toggle.click();
 await expect(home).toHaveAttribute('data-theme', 'light');
 await expect(home).toHaveCSS('background-color', 'rgb(239, 233, 253)');
});
