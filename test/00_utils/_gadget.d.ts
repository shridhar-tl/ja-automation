import { ThenableWebDriver, WebElement, WebElementPromise } from "selenium-webdriver";

export async function getGadget(driver: ThenableWebDriver, id: string): WebElementPromise;
export async function untilGadgetLoads(driver: ThenableWebDriver, id: string): Promise<bool>;
export async function getGadgetHeader(driver: ThenableWebDriver, id: string): WebElementPromise;
export async function getGadgetHeaderText(driver: ThenableWebDriver, id: string): Promise<string>;
export async function getElFromHeader(driver: ThenableWebDriver, id: string, selector: string): Promise<WebElement>;
export async function getTableFromGadget(driver: ThenableWebDriver, id: string): Promise<WebElement>;
export async function triggerMenuClick(driver: ThenableWebDriver, table: any, issueKey: string, icon: string): Promise;