import { By, until } from "selenium-webdriver";
import { assert } from "chai";
import { getScope } from "./driver";

export function waitFor(ms) {
    return new Promise(function (resolve) {
        setTimeout(resolve, ms);
    });
}

export async function waitForPageLoad(driver, origin, timeout = 30000, webRoot) {
    let url, loadedOrigin;

    await driver.wait(async function () {
        const readyState = await driver.executeScript('return document.readyState');
        const isReady = readyState === 'complete';
        if (!origin || !isReady) {
            return isReady;
        }

        const urlStr = await driver.getCurrentUrl();
        url = new URL(urlStr);
        const { protocol, host, origin: srcOrigin } = url;
        loadedOrigin = srcOrigin && srcOrigin !== 'null' ? srcOrigin : (protocol + '//' + host);

        const result = loadedOrigin === origin;

        if (!result && webRoot) { // This is to redirect to local site
            const webUrl = new URL(webRoot);
            if (webUrl.host !== url.host && url.host === 'app.jiraassistant.com') {
                await driver.get(`${webRoot}${url.pathname}${url.search}${url.hash}`);
            }
        }

        return result;
    }, timeout);

    if (origin) {
        assert.equal(loadedOrigin, origin);
    }

    return url;
}

export async function waitForRouteToLoad(driver, path, exact, timeout = 5000) {
    await driver.wait(async function () {
        const route = await getCurrentPath(driver);
        return exact ? route === path : route.includes(path);
    }, timeout);

    const route = await getCurrentPath(driver);
    if (exact) {
        assert.equal(route, path);
    } else {
        assert.strictEqual(route.includes(path), true);
    }

    await waitFor(1000);

    return route;
}

export async function getCurrentPath(driver) {
    const { scenario: { useWeb, useCloud } } = getScope();
    let urlStr = null;
    if (useCloud) {
        urlStr = await driver.executeScript('return document.location.href');
    } else {
        urlStr = await driver.getCurrentUrl();
    }
    const url = new URL(urlStr);
    const useHash = !useWeb || url.hash?.length > 1;

    return useHash ? url.hash.substring('1') : url.pathname;
}

export async function forLoaderToEnd(driver, button) {
    await waitFor(2000);
    return true;
}

export async function forElToBeRemoved(driver, selector, root = driver, waitFor = 6000) {
    if (typeof selector === 'string') {
        selector = By.css(selector);
    }

    await driver.wait(async function () {
        return (await (root.findElements(selector))).length === 0;
    }, waitFor);
}

export async function forElToBeVisible(driver, selector, root = driver, waitFor = 6000) {
    if (typeof selector === 'string') {
        selector = By.css(selector);
    }

    let el;
    await driver.wait(async function () {
        const elements = await root.findElements(selector);
        if (elements.length > 0) {
            el = elements[0];
            await driver.wait(until.elementIsVisible(el), 1000);
        }
    }, waitFor);

    return el;
}

export async function forElToBeAvailable(driver, selector, root = driver, waitFor = 6000) {
    if (typeof selector === 'string') {
        selector = By.css(selector);
    }

    let el;
    await driver.wait(async function () {
        const elements = await root.findElements(selector);
        if (elements.length > 0) {
            el = elements[0];
            return true;
        }
        return false;
    }, waitFor);

    return el;
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

export async function navigateToMenu(driver, menuId, search) {
    const menu = await driver.findElement(By.css(`div.sidebar nav[data-testid="side-navigation"] button[data-testid="${menuId}"] span[data-item-title="true"]`));
    const menuText = await menu.getText();
    assert.equal(menuText, search);
    await menu.click();
}

export async function chooseDateRange(driver, range) {
    const el = await driver.findElement(By.css(`div.daterangepicker > div.ranges > ul > li[data-range-key="${range}"]`));
    await el.click();
}