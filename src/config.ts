import "dotenv/config";

enum ENVIRONMENT {
  production = "production",
  development = "development",
}

type LoginCredentials = {
  rut: string;
  password: string;
};

class Config {
  public environment: ENVIRONMENT;
  public credentials: LoginCredentials;
  public apiUrl: string;
  public timezone: string;

  constructor() {
    this.apiUrl = process.env.PAYFLOW_API_URL ?? "http://localhost:3001";
    this.timezone = process.env.TIMEZONE ?? "America/Santiago";
    this.environment =
      (process.env.NODE_ENV as ENVIRONMENT) ?? ENVIRONMENT.development;
    this.credentials = {
      rut: process.env.BANK_USERNAME ?? "missing",
      password: process.env.BANK_PASSWORD ?? "missing",
    };
  }

  get loggerType() {
    return this.environment === ENVIRONMENT.production ? "json" : "pretty";
  }
}

const config = new Config();

export default config;
