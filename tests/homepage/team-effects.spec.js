const {test,expect}=require('@playwright/test');
test('all founder cards expand with source credentials, dim siblings and support Escape',async({page})=>{
 test.setTimeout(120000);
 await page.goto('/',{waitUntil:'domcontentloaded'});
 const home=page.locator('#dh2-homepage'),cards=home.locator('.team-card');
 await expect(cards).toHaveCount(3);
 await home.locator('#about').scrollIntoViewIfNeeded();
 for(let i=0;i<3;i++){
  await page.mouse.move(0,0);
  await cards.nth(i).hover({position:{x:40,y:60}});
  await expect(cards.nth(i)).toHaveAttribute('data-open','true');
  await expect(cards.nth(i).locator('.team-details')).toBeVisible();
  expect(await cards.nth(i).locator('.team-chips>span').count()).toBeGreaterThan(7);
  await expect(cards.nth((i+1)%3)).toHaveAttribute('data-muted','true');
  const stage=await home.locator('.team-stage').boundingBox(),card=await cards.nth(i).boundingBox();
  await expect.poll(async()=> (await cards.nth(i).boundingBox()).width/stage.width).toBeGreaterThan(.7);
  expect(card.x).toBeGreaterThanOrEqual(stage.x-1);
  await page.keyboard.press('Escape');await expect(cards.nth(i)).toHaveAttribute('data-open','false');
 }
 await cards.first().getByRole('button').focus();await page.keyboard.press('Enter');
 await expect(cards.first().locator('.team-details')).toBeVisible();
 await expect(cards.first().getByRole('link',{name:'Call',exact:true})).toHaveAttribute('href','tel:+919511874292');
 await page.mouse.move(0,0);await page.screenshot({path:'.local/team-expanded-desktop.png'});
});
test('mobile credentials toggle without overflow and respect reduced motion',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});
 await page.goto('/',{waitUntil:'domcontentloaded'});
 const home=page.locator('#dh2-homepage');
 for(const card of await home.locator('.team-card').all()){
  const button=card.getByRole('button');await button.click();await expect(button).toHaveAttribute('aria-expanded','true');await expect(card.locator('.team-details')).toBeVisible();
  await expect(card).toHaveCSS('transition-duration','0s');await button.click();await expect(card.locator('.team-details')).toBeHidden();
 }
 expect(await page.locator('#intro').evaluate(n=>n.scrollWidth<=n.clientWidth+1)).toBe(true);
 await home.locator('.team-card').last().getByRole('button').click();await page.screenshot({path:'.local/team-expanded-mobile.png'});
});
test('scroll reveals observe the landing scroller and settle to visible content',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});await page.goto('/',{waitUntil:'domcontentloaded'});
 const heading=page.locator('#dh2-homepage #about .zh');await heading.scrollIntoViewIfNeeded();await expect(heading).toBeInViewport();
 await expect(heading).toHaveCSS('opacity','1');await expect(heading).toHaveCSS('transform','none');
});
