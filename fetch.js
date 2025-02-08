const { chromium } = require('playwright-core');

const SITE = "https://internalapp.nptel.ac.in/B2C/";

async function processUser(userData) {
    const { email, dob } = userData;
    let results = [];
    
    const browser = await chromium.launch({ headless: true });  // Run Playwright in headless mode
    const page = await browser.newPage();

    try {
        await page.goto(SITE);
        await page.fill('input[placeholder="Email ID"]', email);
        await page.fill('input[placeholder="Password (Format: YYYY-MM-DD)"]', dob);
        await page.press('input[placeholder="Password (Format: YYYY-MM-DD)"]', 'Enter');
        await page.click('text=Click to view Results: October 2024');
        
        // Wait for the new page (popup)
        const newPagePromise = page.waitForEvent('popup');
        const newPage = await newPagePromise;

        await newPage.bringToFront();
        await newPage.waitForSelector('#exam_score');
    
        const table = await newPage.$('#exam_score');
        results = await extractTableData(table);
    
        console.log(`Successfully processed ${email}`);
    } catch (error) {
        console.log(`Error processing ${email}: ${error.message}`);
    } finally {
        await browser.close();
        return results;
    }
}

async function extractTableData(table) {
    const rows = await table.$$('tr');
    let data = [];
  
    for (let i = 1; i < rows.length; i++) {  // Skip header row
        const columns = await rows[i].$$('td');
        if (columns.length > 0) {
            const rowData = {
                'Name': await columns[1].innerText(),
                'Course Name': await columns[2].innerText(),
                'Assignment (25)': await columns[3].innerText(),
                'Exam (75)': await columns[4].innerText(),
                'Total (100)': await columns[5].innerText(),
            };
            data.push(rowData);
        }
    }
    return data;
}

module.exports = { processUser };
