const { chromium } = require("playwright");

const SITE = "https://internalapp.nptel.ac.in/B2C/";

async function processUser(userData) {
    const { email, dob } = userData;
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    let results = [];
    try {
        await page.goto(SITE);
        await page.fill(`input[placeholder="Email ID"]`, email);
        await page.fill(`input[placeholder="Password (Format: YYYY-MM-DD)"]`, dob);
        await page.press('input[placeholder="Password (Format: YYYY-MM-DD)"]', 'Enter');
        
        await page.click("text=Click to view Results: October 2024", { timeout: 5000 });
        const newPagePromise = page.waitForEvent("popup");
        const newPage = await newPagePromise;

        await newPage.bringToFront();
        await newPage.waitForSelector("#exam_score");
    
        const table = await newPage.$("#exam_score");
        results = await extractTableData(table);
        console.log(`Successfully processed ${email}`);
    } catch (error) {
        console.log(`Error processing ${email}: ${error.message}`);
        results = ("Please check the email and password again");
    } finally {
        await browser.close();
        return results;
    }
}

async function extractTableData(table) {
    const rows = await table.$$("tr");
    
    let data = [];
    for (let i = 1; i < rows.length; i++) { 
        const columns = await rows[i].$$("td");
        if (columns.length > 0) {
            const assignment = Number(await columns[3].innerText());
            const exam = Number(await columns[4].innerText());
            const total = Number(await columns[5].innerText());

            let message = "";
            if (total < 40 || exam < 30 || assignment < 10) message = "Sorry you failed this subject, better luck next time";
            else if (total >= 90) message = "Congrats you passed with this subject an Elite + Gold Certificate";
            else if (total >= 75) message = "Congrats you passed with this subject an Elite + Silver Certificate";
            else if (total >= 60) message = "Congrats you passed with this subject an Elite Certificate";
            else message = "Congrats you passed this subject";

            const rowData = {
                "Name": await columns[1].innerText(),
                "Course Name": await columns[2].innerText(),
                "Assignment (25)": assignment,
                "Exam (75)": exam,
                "Total (100)": total,
                "Message": message
            };
            data.push(rowData);
        }
    }

    return data;
}

module.exports = { processUser };
