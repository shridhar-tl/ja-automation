import { By } from 'selenium-webdriver';
import { it } from 'mocha';
import { assert } from 'chai';
import { getScope } from '../common/driver';
import { forElToBeRemoved, forLoaderToEnd, getCurrentPath, waitFor, waitForPageLoad, waitForRouteToLoad } from '../common/utils';

export default function () {
    const { driver, mapPath, scenario } = getScope();

    it("launches extension landing page", async function () {
        await driver.get(mapPath());

        await waitForPageLoad(driver);
        await waitFor(2000);

        const route = await getCurrentPath(driver);
        assert.equal(route, '/integrate');
    });

    if (scenario.useWeb) {
        if (scenario.useExtn) {
            it("launches extension integrate screen", async function () {
                const extnAuth = await driver.findElement(By.css('div.card > .card-body > div.auth-type[data-test-id="extn-auth"]'));
                await extnAuth.click();

                await waitFor(1000);

                const route = await getCurrentPath(driver);
                assert.equal(route, '/integrate/extn');
            });
        } else {
            it("launches web basic auth screen", async function () {
                const extnAuth = await driver.findElement(By.css('div.card > .card-body > div.auth-type[data-test-id="basic-auth"]'));
                await extnAuth.click();

                await waitFor(1000);

                const route = await getCurrentPath(driver);
                assert.equal(route, '/integrate/basic');
            });
        }
    }

    if (scenario.useExtn) {
        it("launches extension basic auth screen", async function () {
            const configIcon = await driver.findElement(By.css('.fa.fa-cogs'));
            await configIcon.click();

            const basicAuthMenu = await driver.findElement(By.css('div.p-menu ul li:last-child a'));
            await basicAuthMenu.click();

            await waitForRouteToLoad(driver, '/integrate/basic/1', true);
        });
    }

    it("integrate using credentials", async function () {
        const jiraUrlTextField = await driver.findElement(By.css('input[placeholder="Jira root url (eg: https://jira.example.com)"]'));
        await jiraUrlTextField.sendKeys(scenario.jiraUrl);

        const loginIdTextField = await driver.findElement(By.css('input[placeholder="Your Jira login id"]'));
        await loginIdTextField.sendKeys(scenario.jiraUser);

        const passwordTextField = await driver.findElement(By.css('input[placeholder="Password / Rest API Token"]'));
        await passwordTextField.sendKeys(scenario.jiraSecret);

        // Wait for the toast to be hiddin in case of any error
        await forElToBeRemoved(driver, By.css('.p-toast-message-content'));

        const currentWinHandle = await driver.getWindowHandle();

        const integrateButtonField = await driver.findElement(By.css('button > span'));
        await integrateButtonField.click();
        await forLoaderToEnd(driver, integrateButtonField);

        if (!scenario.useWeb) {
            await driver.wait(async function () {
                const allWindows = await driver.getAllWindowHandles();
                const newWinHandle = allWindows[0];

                if (newWinHandle !== currentWinHandle) {
                    await driver.switchTo().window(newWinHandle);
                    return true;
                } else {
                    return false;
                }
            });
        }

        await waitForPageLoad(driver);
        await waitForRouteToLoad(driver, '/2/dashboard/0', true);
    });
};