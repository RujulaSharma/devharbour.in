const {test,expect}=require('@playwright/test');
for(const width of [1440,390])test(`original WebGL orb and controls work at ${width}px`,async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.addInitScript(()=>{const draw=WebGL2RenderingContext.prototype.drawArrays;window.__orbDraws=0;WebGL2RenderingContext.prototype.drawArrays=function(...args){window.__orbDraws++;return draw.apply(this,args);};});
  await page.setViewportSize({width,height:1000});await page.goto('/',{waitUntil:'domcontentloaded'});
  const home=page.locator('#dh-homepage'),orb=home.locator('.orb-stage'),canvas=orb.locator('canvas');
  await expect(home.locator('h1')).toHaveText('Build whatyou imagine.');
  await expect(home.getByRole('button',{name:'Start Building'})).toBeVisible();
  await expect(canvas).toBeVisible();expect(await canvas.evaluate(node=>!!node.getContext('webgl2'))).toBe(true);
  await expect(home.locator('.harbour-brand')).toHaveCount(0);
  await expect(orb.locator('.center-word')).toHaveText('DevHarbour');
  await orb.getByRole('button',{name:'Morph to text'}).click();await expect(orb).toHaveAttribute('data-mode','word');
  await expect(orb.locator('.center-word')).not.toHaveClass(/visible/);
  await orb.getByRole('button',{name:'Explore clusters',exact:true}).click();await expect(orb).toHaveAttribute('data-mode','clusters');
  await expect(orb.getByRole('button',{name:'Explore Learn',exact:true})).toBeVisible();
  await orb.getByRole('button',{name:'Reset sphere'}).click();await expect(orb).toHaveAttribute('data-mode','orb');
  await home.getByRole('button',{name:'Pause hero motion'}).click();await expect(orb).toHaveAttribute('data-paused','true');
  await page.waitForTimeout(150);const frames=await page.evaluate(()=>window.__orbDraws);expect(frames).toBeGreaterThan(0);await page.waitForTimeout(150);expect(await page.evaluate(()=>window.__orbDraws)).toBe(frames);
  await home.getByRole('button',{name:'Resume hero motion'}).click();await expect(orb).toHaveAttribute('data-paused','false');
  if(width===1440){
    const box=await canvas.boundingBox();await page.mouse.move(box.x+box.width*.4,box.y+box.height*.4);await page.mouse.down();await page.mouse.move(box.x+box.width*.6,box.y+box.height*.5,{steps:5});await page.mouse.up();await page.waitForTimeout(300);await expect(orb).toHaveAttribute('data-mode','orb');
  }
  await page.locator('#intro').evaluate(node=>node.scrollTop=0);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  if(width===1440)await page.screenshot({path:`.local/original-webgl-orb-${width}.png`});expect(errors).toEqual([]);
});
test('original orb fallback leaves the homepage usable without WebGL',async({page})=>{
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(kind,...args){return kind.startsWith('webgl')?null:original.call(this,kind,...args);};});
  await page.goto('/',{waitUntil:'domcontentloaded'});const home=page.locator('#dh-homepage');
  await expect(home.locator('.webgl-fallback')).toContainText('DevHarbour');
  await expect(home.getByRole('button',{name:'Start Building'})).toBeVisible();
});
