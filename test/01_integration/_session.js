import { By, Key, until } from 'selenium-webdriver';
import { it } from 'mocha';
import { assert } from 'chai';
import { getScope } from '../common/driver';
import { forLoaderToEnd, waitFor, waitForPageLoad, waitForRouteToLoad } from '../common/utils';

export default function () {
    const { driver, mapPath, scenario } = getScope();

    it("pre authenticate with Jira", async function () {
        await driver.get(scenario.jiraUrl);

        const url = await waitForPageLoad(driver, 'https://id.atlassian.com');
        assert.equal(url.pathname, '/login');
    });

    it("input credentials and login to Jira", async function () {
        const loginEmail = await driver.findElement(By.name('username'));
        await loginEmail.sendKeys(scenario.jiraUser);

        const btnContinue = await driver.findElement(By.id('login-submit'));
        await btnContinue.click();

        await driver.wait(until.elementLocated(By.name('password')), 5000);

        const loginPwd = await driver.findElement(By.name('password'));
        await driver.wait(until.elementIsVisible(loginPwd), 5000);
        await loginPwd.sendKeys(scenario.jiraPwd);

        const btnLogin = await driver.findElement(By.id('login-submit'));
        await btnLogin.click();

        const url = await waitForPageLoad(driver, scenario.jiraUrl);
    });

    it("launches extension integrate page", async function () {
        await driver.get(mapPath());

        await waitForPageLoad(driver);
        await waitForRouteToLoad(driver, '/integrate', true);
    });

    it("integrate using browser session", async function () {
        const inputText = await driver.findElement(By.css('input.p-inputtext'));
        await inputText.sendKeys(scenario.jiraUrl);

        const currentWinHandle = await driver.getWindowHandle();

        const btnIntegrate = await driver.findElement(By.css('button[aria-label="Integrate"]'));
        await btnIntegrate.click();
        await waitFor(1000);

        await driver.wait(async function () {
            const allWindows = await driver.getAllWindowHandles();
            const newWinHandle = allWindows[0];

            if (newWinHandle !== currentWinHandle) {
                await driver.switchTo().window(newWinHandle);
                return true;
            } else {
                return false;
            }
        }, 20000);

        await waitForPageLoad(driver, scenario.rootUrl);
        await waitForRouteToLoad(driver, '/2/dashboard/0', true);
    });
};