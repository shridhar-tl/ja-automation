import { Builder } from 'selenium-webdriver';
import { Options as ChromeOptions } from 'selenium-webdriver/chrome';
import { Options as FirefoxOptions } from 'selenium-webdriver/firefox';
import { Options as EdgeOptions } from 'selenium-webdriver/edge';
import getScenario from './scenarios';
import fs from 'fs-extra';
import path from 'path';

//https://www.youtube.com/watch?v=BQ-9e13kJ58
//https://www.youtube.com/watch?v=5-2vtcy9LzQ
function getDriver(config) {
    prepareExtensionPermission(config)
    let driver = new Builder().forBrowser(config.browserToTest);

    switch (config.browserToTest) {
        case 'chrome': driver = setChromeOptions(driver, config); break;
        case 'edge': driver = setEdgeOptions(driver, config); break;
        case 'firefox': driver = setFirefoxOptions(driver, config); break;
    }

    return driver.build();
}

function setChromeOptions(driver, { useExtn, useWeb, authType, extensionPath }) {
    // https://peter.sh/experiments/chromium-command-line-switches/
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

    resetExtensionPermissions(scenario);

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
    let { rootUrl, useWeb } = scenario;

    if (rootUrl.endsWith('/')) {
        rootUrl = rootUrl.substring(0, rootUrl.length - 1);
    }

    if (!useWeb) {
        rootUrl += '/index.html';
    }

    if (path.startsWith('/')) {
        path = path.substring(1);
    }

    return rootUrl + (useWeb ? '/' : '#/') + (path || '');
}

const manifestSuffix = '.original';

function prepareExtensionPermission(scenario) {
    const manifestPath = path.join(scenario.extensionPath, 'manifest.json');

    // For chrome, added host permission to avoid permission dialog
    if (scenario.authType === 'session' && scenario.browserToTest === 'chrome') {
        let manifestObj = fs.readJsonSync(manifestPath);

        manifestObj.permissions.push('tabs');

        manifestObj.host_permissions = manifestObj.optional_host_permissions;
        delete manifestObj.optional_host_permissions;
        fs.renameSync(manifestPath, manifestPath + manifestSuffix);
        fs.writeJSONSync(manifestPath, manifestObj);
        console.log('Added permission to manifest file');
    }
}

function resetExtensionPermissions(scenario) {
    new setTimeout(() => {
        const manifestPath = path.join(scenario.extensionPath, 'manifest.json');
        if (scenario.authType === 'session' && scenario.browserToTest === 'chrome') {
            if (fs.existsSync(manifestPath + manifestSuffix)) {
                if (fs.existsSync(manifestPath)) {
                    fs.unlinkSync(manifestPath);
                }
                fs.renameSync(manifestPath + manifestSuffix, manifestPath);
            }
        }
    }, 5000);
}