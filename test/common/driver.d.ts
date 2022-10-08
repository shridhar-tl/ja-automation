import { ThenableWebDriver } from "selenium-webdriver";

export function getScope(): { driver: ThenableWebDriver, rootUrl: string, mapPath: function }