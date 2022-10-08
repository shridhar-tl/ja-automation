import { By } from "selenium-webdriver";
import { getScope } from "./driver";

export async function waitFor(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

export function waitForPageLoad(driver) {
    return driver.wait(async function () {
        const readyState = await driver.executeScript('return document.readyState');
        return readyState === 'complete';
    }, 5000);
}

export async function getCurrentPath(driver) {
    const { scenario: { useWeb } } = getScope()
    const urlStr = await driver.getCurrentUrl();
    const url = new URL(urlStr);
    const useHash = !useWeb || url.hash?.length > 1;

    let path = useHash ? url.hash.substring('1') : url.pathname;

    return path;
}

export async function forLoaderToEnd(driver, button) {
    return true;
}

export async function forElToBeRemoved(driver, selector, root = driver) {
    if (typeof selector === 'string') {
        selector = By.css(selector);
    }

    await driver.wait(async function () {
        return (await (root.findElements(selector))).length === 0;
    }, 6000);
}

export function confirmDelete(driver) {
    return respondToDialog(driver, 'dlg-delete', 'button[aria-label="Delete"]');
}

export async function respondToDialog(driver, className, btnSelector, waitMS = 100) {
    if (typeof btnSelector === 'string') {
        btnSelector = By.css(btnSelector);
    }

    const dialogFooter = await driver.findElement(By.css(`.p-dialog.${className} .p-dialog-footer`));
    const btnToClick = await dialogFooter.findElement(btnSelector);
    await btnToClick.click();
    await waitFor(waitMS);
}

export async function navigateToMenu(driver, menuRef) {
    const menu = await driver.findElement(By.css(`div.sidebar ul.nav > li.nav-item a[href$="${menuRef}"]`));
    await menu.click();
}

export async function chooseDateRange(driver, range) {
    const el = await driver.findElement(By.css(`div.daterangepicker > div.ranges > ul > li[data-range-key="${range}"]`));
    await el.click();
}