import axios from "axios";
import { load, Element } from "cheerio";
import moment from "moment";
import playwright, { Browser, Page } from "playwright";

import logger from "../logger";

const log = logger.getChildLogger({ name: "Main Logger" });

interface DiscountBaseInformation {
  url: string;
  logo: string;
  title: string;
  address: string;
  details: string;
}

const extractBaseInformation = (
  element: HTMLElement | SVGElement
): DiscountBaseInformation => {
  return {
    url: element.getAttribute("href"),
    logo: element.querySelector("img").getAttribute("src"),
    title: element.querySelector(".beneficio__item__info-location__title")
      .textContent,
    address: element.querySelector(".beneficio__item__info-location__address")
      .textContent,
    details: element.querySelector(".beneficio__item__info-location__details")
      .textContent,
  };
};

export default class ItauScraper {
  public baseURL: string;

  constructor() {
    this.baseURL = "https://itaubeneficios.cl/jueves-gourmet/";
  }

  async fetchMainPageHtml() {
    const response = await axios.get(this.baseURL);
    return response.data;
  }

  async collectDiscounts() {
    const mainPageHtml = await this.fetchMainPageHtml();
    const page = load(mainPageHtml);
    const elements = page("div.page-beneficios-list-default a.beneficio__item");
    const discounts = [];
    elements.each(function (i, elem) {
      const url = page(this).attr("href");
      const logo = page(this).find("img").attr("src");
      const title = page(this)
        .find(".beneficio__item__info-location__title")
        .text();
      const address = page(this)
        .find(".beneficio__item__info-location__address")
        .text()
        .replace(/\s/, "")
        .trim();
      const details = page(this)
        .find(".beneficio__item__info-location__details")
        .text();
      discounts[i] = { url, logo, title, address, details };
    });
    return discounts;
  }

  async getDiscounts() {
    const discounts = await this.collectDiscounts();
    const promises = discounts.map(async (discount) => {
      const html = await this.fetchDiscountPageHtml(discount.url);
      const detail = await this.getDiscountDetails(html);
      return detail;
    });
    const details = await Promise.all(promises);
    console.log(details);
    return details;
  }

  getDiscountDetails(discountPageHtml: string) {
    const page = load(discountPageHtml);
    const discount = page(".beneficio__sidebar__caption p")
      .text()
      .replace(/\s/, "")
      .trim();
    const dates = page(".beneficio__sidebar__date span em");
    const startDate = dates.first().text();
    const endDate = dates.last().text();
    const address = page(".beneficio__sidebar__contact__location__value").first();

    return { discount, startDate, endDate, address };
  }

  async fetchDiscountPageHtml(pageUrl: string) {
    const response = await axios.get(pageUrl);
    return response.data;
  }
}
