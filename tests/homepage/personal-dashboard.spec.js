const{test,expect}=require('@playwright/test');
test('sidebar shows only personal projects, preserves section on reload and back',async({page})=>{
 await page.route('**/api/auth/me',r=>r.fulfill({json:{user:{id:'owner-a',username:'owner'}}}));
 await page.route('**/api/user/summary',r=>r.fulfill({json:{stats:{totalXp:0,level:1},xpHistory:[]}}));
 await page.route('**/api/user/learning',r=>r.fulfill({json:{courses:[]}}));
 await page.route('**/api/user/dashboard',r=>r.fulfill({json:{history:[],projects:[{id:'own-project',title:'My Private Submission',description:'Only mine',status:'pending',tech_stack_json:'[]'}],submissions:[{title:'My Array Attempt',status:'passed',language:'javascript'}],workspace:{tasks:[{title:'My Task'}]},practice:{solved:1,total:5,breakdown:[],categories:[]}}}));
 await page.goto('/dashboard',{waitUntil:'domcontentloaded'});
 const sidebar=page.getByRole('complementary',{name:'Dashboard sidebar'});
 await sidebar.getByTitle('My Projects', {exact:true}).click();
 await expect(page).toHaveURL(/section=projects/);const section=page.locator('#personal-dashboard-section');
 await expect(section).toContainText('My Private Submission');await expect(page.locator('.my-learning')).toBeHidden();
 await page.reload({waitUntil:'domcontentloaded'});await expect(section).toContainText('My Private Submission');
 await sidebar.getByTitle('Challenges', {exact:true}).click();await expect(section).toContainText('My Array Attempt');
 await page.goBack();await expect(section).toContainText('My Private Submission');
 await sidebar.getByTitle('Workspace', {exact:true}).click();await expect(section).toContainText('My Task');
 await sidebar.getByTitle('Hackathons', {exact:true}).click();await expect(section).toContainText('does not have a personal hackathon');
 await expect(sidebar.getByTitle('Hackathons', {exact:true})).toHaveAttribute('aria-current','page');
});
