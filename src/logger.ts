import { Logger } from "tslog";
import config from "./config";

const logger = new Logger({
  type: config.loggerType,
  name: "Payroll Sender",
  dateTimeTimezone: config.timezone,
});

export default logger;
