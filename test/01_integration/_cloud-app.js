import { By, until } from 'selenium-webdriver';
import { it } from 'mocha';
import { assert } from 'chai';
import { getScope } from '../common/driver';
import { waitForPageLoad, forElToBeAvailable } from '../common/utils';

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

        await waitForPageLoad(driver, scenario.jiraUrl);
    });

    it("launches cloud app", async function () {
        const appsMenu = await driver.findElement(By.xpath("//*[text()='Apps']"));
        await appsMenu.click();

        await driver.sleep(3000);

        const jaMenu = await driver.findElement(By.css(`div[data-placement="bottom-start"] div[role="group"][data-section="true"] a[href^="/jira/apps/${scenario.jiraCloudAppId}"] span[data-item-title="true"]`));
        assert.equal(await jaMenu.getText(), 'Jira Assistant');
        await jaMenu.click();
        await waitForPageLoad(driver);

        const urlStr = await driver.getCurrentUrl();
        const url = new URL(urlStr);
        assert.equal(url.pathname.startsWith('/jira/apps'), true, 'JA app must be loaded');
    });


    it("accept consent and choose iframe", async function () {
        const switched = await switchToApp(driver);

        if (!switched) {
            await switchWindow(driver, 1, async () => {
                const acceptConsentButton = await driver.findElement(By.css('div[data-testid="hosted-resources-iframe-container"] button'));
                await acceptConsentButton.click();
            });

            await waitForPageLoad(driver, 'https://api.atlassian.com');

            await switchWindow(driver, 0, async () => {
                await driver.executeScript('window.scroll(0,document.body.scrollHeight)');
                const btnSubmit = await driver.findElement(By.css('button[type="submit"]'));
                await btnSubmit.click();
            });

            await driver.sleep(3000);
            await waitForPageLoad(driver, scenario.jiraUrl);
            await switchToApp(driver, true);
        }

        await driver.sleep(5000);
    });
};

async function switchToApp(driver, raise) {
    try {
        const iframe = await forElToBeAvailable(driver, 'div[data-testid="hosted-resources-iframe-container"] iframe[data-testid="hosted-resources-iframe"]', driver, 30000);
        if (iframe) {
            await driver.switchTo().frame(iframe);
        }

        return true;
    } catch (err) {
        if (raise) {
            throw err;
        }
        console.log('JA App not launched. Checking permissions.');
        return false;
    }
}

async function switchWindow(driver, index, action) {
    const currentWinHandle = await driver.getWindowHandle();
    await action();
    await driver.sleep(2000);

    let allWindows = null;
    await driver.wait(async function () {
        allWindows = await driver.getAllWindowHandles();
        return allWindows.length === index + 1;
    }, 10000);

    const newWinHandle = allWindows[index];
    assert.notEqual(newWinHandle, currentWinHandle);

    await driver.switchTo().window(newWinHandle);

    await driver.sleep(2000);
}