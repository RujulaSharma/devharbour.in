const{test,expect}=require('@playwright/test');
for(const width of [1440,390])test(`lavender homepage renders and responds at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:1000});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('/',{waitUntil:'domcontentloaded'});const home=page.locator('#dh-homepage');await expect(home.locator('h1')).toBeVisible();await expect(home.locator('.harbour-scene')).toBeVisible();await expect(home.locator('.hero-dots')).toHaveCount(0);await expect(home.locator('.harbour-brand strong')).toHaveText('DevHarbour');await expect(home.locator('.hero-socials a')).toHaveCount(3);await expect(home.locator('.hero-manifesto')).toContainText('Connect.');await expect(home.locator('.hero-stats')).toHaveCount(0);
 await expect(home.locator('.homepage-editorial')).toHaveCSS('background-color','rgb(238, 232, 247)');
 if(width===1440){const box=await home.locator('.hero-art').boundingBox();await page.mouse.move(box.x+box.width*.8,box.y+box.height*.3);await expect(home.locator('.hero-art')).not.toHaveCSS('transform','none');}
 await home.getByRole('button',{name:'Pause hero motion'}).click();await expect(home.locator('.harbour-art')).toHaveClass(/is-still/);
 await page.screenshot({path:`.local/editorial-home-${width}.png`,timeout:20000});
 await page.locator('#intro').evaluate(n=>n.scrollTop=800);await expect(home.locator('#hackathons')).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);
});
test('reduced motion keeps hero still',async({page})=>{await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/',{waitUntil:'domcontentloaded'});await expect(page.locator('#dh-homepage .hero-art')).toHaveCSS('transform','none');});
