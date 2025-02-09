const chromium = require('chrome-aws-lambda');
const puppeteer = require('puppeteer-core');

const SITE = "https://internalapp.nptel.ac.in/B2C/";

async function processUser(userData) {
  const { email, dob } = userData;
  let browser = null;
  let results = [];
  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    });
    
    const page = await browser.newPage();
    await page.goto(SITE);

    await page.type('input[placeholder="Email ID"]', email);
    await page.type('input[placeholder="Password (Format: YYYY-MM-DD)"]', dob);
    await page.keyboard.press('Enter');

    await page.waitForXPath("//*[contains(text(), 'Click to view Results: October 2024')]", { timeout: 5000 });
    const [button] = await page.$x("//*[contains(text(), 'Click to view Results: October 2024')]");
    if (!button) throw new Error("Results button not found");

    // Listen for the new page (popup) that will open when the button is clicked.
    const newPagePromise = new Promise(resolve => {
      browser.once('targetcreated', async target => {
        const newPage = await target.page();
        resolve(newPage);
      });
    });

    await button.click();

    const newPage = await newPagePromise;
    await newPage.bringToFront();
    await newPage.waitForSelector("#exam_score");

    const table = await newPage.$("#exam_score");
    results = await extractTableData(newPage, table);
    console.log(`Successfully processed ${email}`);
  } catch (error) {
    console.log(`Error processing ${email}: ${error.message}`);
    results = "Please check the email and password again";
  } finally {
    if (browser) await browser.close();
    return results;
  }
}

async function extractTableData(page, table) {
  const rows = await table.$$('tr');
  let data = [];

  for (let i = 1; i < rows.length; i++) {
    const columns = await rows[i].$$("td");
    if (columns.length > 0) {
      const name = await page.evaluate(el => el.innerText, columns[1]);
      const courseName = await page.evaluate(el => el.innerText, columns[2]);
      const assignment = Number(await page.evaluate(el => el.innerText, columns[3]));
      const exam = Number(await page.evaluate(el => el.innerText, columns[4]));
      const total = Number(await page.evaluate(el => el.innerText, columns[5]));

      let message = "";
      if (total < 40 || exam < 30 || assignment < 10) message = "Sorry you failed this subject, better luck next time";
      else if (total >= 90) message = "Congrats you passed with this subject an Elite + Gold Certificate";
      else if (total >= 75) message = "Congrats you passed with this subject an Elite + Silver Certificate";
      else if (total >= 60) message = "Congrats you passed with this subject an Elite Certificate";
      else message = "Congrats you passed this subject";

      data.push({
        "Name": name,
        "Course Name": courseName,
        "Assignment (25)": assignment,
        "Exam (75)": exam,
        "Total (100)": total,
        "Message": message
      });
    }
  }

  return data;
}

module.exports = { processUser };
