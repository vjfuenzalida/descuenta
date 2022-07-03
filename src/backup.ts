import playwright from "playwright";
import { Logger } from "tslog";
import config from "./config";
import logger from "./logger";

const log = logger.getChildLogger({ name: "Main Logger" });

async function scraping() {
  const browser = await playwright.chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();
  await page.goto("https://empresas.bancosecurity.cl/");
  await page.click("#menufixed-sticky-wrapper .btn-login");
  await page.waitForSelector("div.form__input-rut input#lrut");
  await page.waitForSelector("div.form__input-pass input#lpass");
  await page.fill("div.form__input-rut input#lrut", config.credentials.rut);
  await page.fill(
    "div.form__input-pass input#lpass",
    config.credentials.password
  );
  await page.click("a#btnIngresar");
  await page.waitForLoadState();
  const mainFrame = page.frameLocator("#mainFrame");
  const accountButton = mainFrame.locator(
    '.block__item[data-item="Cuenta Corriente"]'
  );
  await accountButton.click();
  const transactionFrame = mainFrame.frameLocator("#Iframe1");
  await transactionFrame
    .locator(".box--cuentas .data-content")
    .waitFor({ state: "visible" });
  const rows = transactionFrame.locator(".data-content tr.data-fila");
   
  let index = 0;
  const data = [];
  while (true) {
    const element = rows.nth(index);
    try {
      await element.waitFor({ state: "visible", timeout: 1000 });
    } catch (err) {
      break;
    }
    const date = await element.locator("td.data-date").textContent();
    const description = await element
      .locator("td.data-description")
      .textContent();
    const amount = await element
      .locator('td.amount[data-column="Cargos"]')
      .textContent();
    data.push({ date, description, amount, index });
    index += 1;
  }
  console.log(data);
  await page.waitForTimeout(5000); // wait for 5 seconds
  await browser.close();
}

async function main() {
  log.info("Starting Payouts Simulator...");
  try {
    await scraping();
    log.info("Task ended successfully...");
  } catch (err) {
    log.warn("Task ended with errors...");
    log.error(err.message);
  }
}

main();
