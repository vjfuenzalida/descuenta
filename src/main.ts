import logger from "./logger";
import ItauScraper from "./scrapers/itau.scraper";

const log = logger.getChildLogger({ name: "Main Logger" });

async function main() {
  const scraper = new ItauScraper();
  try {
    await scraper.getDiscounts();
    log.info("Task ended successfully...");
  } catch (err) {
    log.warn("Task ended with errors...");
    log.error(err.message);
  }
}

main();
