import { Builder } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
import { Options as EdgeOptions } from 'selenium-webdriver/edge';
import getScenario from './scenarios';

//https://www.youtube.com/watch?v=BQ-9e13kJ58
//https://www.youtube.com/watch?v=5-2vtcy9LzQ
function getDriver(config) {
    let driver = new Builder().forBrowser(config.browserToTest);

    switch (config.browserToTest) {
        case 'chrome': driver = setChromeOptions(driver, config); break;
        case 'edge': driver = setEdgeOptions(driver, config); break;
        case 'firefox': driver = setFirefoxOptions(driver, config); break;
    }

    return driver.build();
}

function setChromeOptions(driver, { useExtn, extensionPath }) {
    const options = new ChromeOptions();
    options.addArguments(...[
        useExtn && `--load-extension=${extensionPath}`,
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--user-agent=Chrome'
    ].filter(Boolean)); //--no-referrers 

    return driver.setChromeOptions(options);
}

function setEdgeOptions(driver, { useExtn, extensionPath }) {
    const options = new EdgeOptions();
    options.addArguments(...[
        useExtn && `--load-extension=${extensionPath}`,
        '--start-maximized',
        '--disable-blink-features=AutomationControlled',
        '--disable-web-security',
        '--user-agent=Edge'
    ].filter(Boolean)); //--no-referrers 

    return driver.setChromeOptions(options);
}

function setFirefoxOptions(driver, { browserToTest: browser, useExtn, extensionPath }) {
    const options = new FirefoxOptions();
    if (useExtn) {
        options.addExtensions(extensionPath);
    }

    return driver.setFirefoxOptions(options);
}

let driver, scenario;
export function getScope() {
    if (!driver) {
        scenario = getScenario();
        driver = getDriver(scenario);
    }

    return { driver, mapPath, scenario };
}

export async function destroyScope() {
    if (driver) {
        await driver.quit();
    }

    scenario = null;
    driver = null;
}

function mapPath(path = '') {
    const { rootUrl, useWeb } = scenario;
    // ToDo: need to trim start path with '/'
    return rootUrl + (useWeb ? '/' : '#/') + (path || '');
}