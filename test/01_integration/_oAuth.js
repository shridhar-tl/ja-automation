import { By, until } from 'selenium-webdriver';
import { it } from 'mocha';
import { assert } from 'chai';
import { getScope } from '../common/driver';
import { getCurrentPath, waitFor, waitForPageLoad, waitForRouteToLoad } from '../common/utils';

export default function () {
    const { driver, mapPath, scenario } = getScope();

    it("launches extension landing page", async function () {
        await driver.get(mapPath());

        await waitForPageLoad(driver);
        await waitFor(2000);

        const route = await getCurrentPath(driver);
        assert.equal(route, '/integrate');
    });

    if (scenario.useWeb && scenario.useExtn) {
        it("launches extension integrate screen", async function () {
            const extnAuth = await driver.findElement(By.css('div.card > .card-body > div.auth-type[data-test-id="extn-auth"]'));
            await extnAuth.click();

            await waitFor(1000);

            const route = await getCurrentPath(driver);
            assert.equal(route, '/integrate/extn');
        });
    }

    if (scenario.useExtn) {
        it("launches oAuth login screen", async function () {
            const configIcon = await driver.findElement(By.css('.fa.fa-cogs'));
            await configIcon.click();

            const basicAuthMenu = await driver.findElement(By.css('div.p-menu ul li a span.fa-external-link'));
            await basicAuthMenu.click();

            const url = await waitForPageLoad(driver, 'https://id.atlassian.com');
            assert.equal(url.pathname, '/login');
        });
    } else {
        it("launches web oAuth login screen", async function () {
            const extnAuth = await driver.findElement(By.css('div.card > .card-body > div.auth-type[data-test-id="o-auth"]'));
            await extnAuth.click();

            await waitFor(1000);

            const dialog = await driver.findElement(By.css('.p-dialog.dlg-yesNo'));// await forElToBeVisible(driver, '.p-dialog.dlg-yesNo');

            const header = await dialog.findElement(By.css('.p-dialog-header .p-dialog-title'));
            const headerText = await header.getText();

            assert.equal(headerText, 'Jira Cloud - OAuth2 Integration');

            const yesButton = await dialog.findElement(By.css('.p-dialog-footer button[aria-label="Yes"]'));
            await yesButton.click();

            const url = await waitForPageLoad(driver, 'https://id.atlassian.com');
            assert.equal(url.pathname, '/login');
        });
    }

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

        const url = await waitForPageLoad(driver, 'https://api.atlassian.com');
        assert.equal(url.pathname, '/oauth2/authorize/server/consent');
    });

    it("accept consent and integrate with Jira", async function () {
        await waitFor(2000);
        const btnSubmit = await driver.findElement(By.css('button[type="submit"]'));
        await btnSubmit.click();
        await waitFor(4000);

        await waitForPageLoad(driver, scenario.rootUrl, 40000, scenario.webRootUrl);
        await waitForRouteToLoad(driver, 'dashboard');

        if (scenario.useWeb) {
            const authType = await driver.executeScript('return localStorage.getItem("authType")');
            assert.equal(authType, scenario.useExtn ? '1' : '2');
        }
    });
};