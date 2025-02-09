const chromium = require("chrome-aws-lambda");
const puppeteer = require("puppeteer-core");

const SITE = "https://internalapp.nptel.ac.in/B2C/";

async function processUser(userData) {
    const { email, dob } = userData;

    const browser = await puppeteer.launch({
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
    });

    const page = await browser.newPage();
    let results = [];

    try {
        await page.goto(SITE, { waitUntil: "networkidle2" });
        await page.type('input[placeholder="Email ID"]', email);
        await page.type('input[placeholder="Password (Format: YYYY-MM-DD)"]', dob);
        await page.keyboard.press("Enter");

        await page.waitForSelector("text=Click to view Results: October 2024", { timeout: 5000 });
        const [newPage] = await Promise.all([
            new Promise(resolve => page.once("popup", resolve)),
            page.click("text=Click to view Results: October 2024"),
        ]);

        await newPage.bringToFront();
        await newPage.waitForSelector("#exam_score");

        const table = await newPage.$("#exam_score");
        results = await extractTableData(newPage, table);

        console.log(`Successfully processed ${email}`);
    } catch (error) {
        console.log(`Error processing ${email}: ${error.message}`);
        results = "Please check the email and password again";
    } finally {
        await browser.close();
        return results;
    }
}

async function extractTableData(page, table) {
    const rows = await table.$$("tr");
    let data = [];

    for (let i = 1; i < rows.length; i++) {
        const columns = await rows[i].$$("td");
        if (columns.length > 0) {
            const assignment = Number(await page.evaluate(el => el.innerText, columns[3]));
            const exam = Number(await page.evaluate(el => el.innerText, columns[4]));
            const total = Number(await page.evaluate(el => el.innerText, columns[5]));

            let message = "";
            if (total < 40 || exam < 30 || assignment < 10) message = "Sorry you failed this subject, better luck next time";
            else if (total >= 90) message = "Congrats you passed with this subject an Elite + Gold Certificate";
            else if (total >= 75) message = "Congrats you passed with this subject an Elite + Silver Certificate";
            else if (total >= 60) message = "Congrats you passed with this subject an Elite Certificate";
            else message = "Congrats you passed this subject";

            const rowData = {
                "Name": await page.evaluate(el => el.innerText, columns[1]),
                "Course Name": await page.evaluate(el => el.innerText, columns[2]),
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
