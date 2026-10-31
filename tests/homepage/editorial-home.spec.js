const{test,expect}=require('@playwright/test');
for(const width of [1440,390])test(`supplied hero renders and responds at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/',{waitUntil:'domcontentloaded'});const home=page.locator('#dh-homepage');await expect(home.locator('h1')).toBeVisible();await expect(home.locator('.orb-canvas canvas')).toBeVisible();await expect(home.locator('.hero-dots')).toHaveCount(0);await expect(home.locator('.center-word')).toHaveText('DevHarbour');await expect(home.locator('.particle-hero h1')).toHaveText('Build whatyou imagine.');await expect(home.getByRole('button',{name:'Start Building'})).toBeVisible();await expect(home.locator('.hero-stats')).toHaveCount(0);
 await expect(home.locator('.homepage-editorial')).toHaveCSS('background-color','rgb(238, 232, 247)');
 expect(await home.locator('.orb-canvas canvas').evaluate(node=>!!node.getContext('webgl2'))).toBe(true);
 await home.getByRole('button',{name:'Pause hero motion'}).click();await expect(home.locator('.orb-stage')).toHaveAttribute('data-paused','true');
 await page.screenshot({path:`.local/editorial-home-${width}.png`,timeout:20000});
 await page.locator('#intro').evaluate(n=>n.scrollTop=800);await expect(home.locator('#hackathons')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});
test('reduced motion keeps hero still',async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/',{waitUntil:'domcontentloaded'});await expect(page.locator('#dh-homepage .hero-art')).toHaveCSS('transform','none');});
