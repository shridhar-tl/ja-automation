import { By } from 'selenium-webdriver';
import { describe, it } from 'mocha';
import { assert } from 'chai';
import { getScope } from '../../common/driver';
import { waitForRouteToLoad } from '../../common/utils';
import addWorklog from '../../00_utils/add-worklog';
import { getGadgetHeaderText, getTableFromGadget, triggerMenuClick } from '../../00_utils/_gadget';

const gadgetName = 'myOpenTickets';

describe("my open tickets gadget test", function () {
    const { driver, scenario } = getScope();

    it("verify if default dashboard is loaded", async function () {
        await driver.sleep(2000);
        await waitForRouteToLoad(driver, '/2/dashboard/0', true, 10000);

        if (scenario.useCloud) {
            await driver.sleep(4000); // This is to wait for dashboard component to be loaded
        }
    });

    it("verify if my open ticket gadget is available", async function () {
        const gadgetHeader = await getGadgetHeaderText(driver, gadgetName);
        assert.equal(gadgetHeader, 'My open tickets');
    });

    it("verify if my open ticket gadget loads", async function () {
        const table = await getTableFromGadget(driver, gadgetName);

        const rows = await table.findElements(By.css('tbody > tr'));

        assert.equal(rows.length, 4);
    });

    it("bookmark tickets from loaded list", async function () {
        const table = await getTableFromGadget(driver, gadgetName);
        await triggerMenuClick(driver, table, 'JAS-1', 'bookmark');
        await driver.sleep(500);
        await triggerMenuClick(driver, table, 'JAS-2', 'bookmark');
    });

    it("add worklog for tickets from loaded list", async function () {
        const table = await getTableFromGadget(driver, gadgetName);
        await triggerMenuClick(driver, table, 'JAK-2', 'clock-o');
        await addWorklog(driver, { description: 'Sample Automation Comment' });
        await triggerMenuClick(driver, table, 'JAK-1', 'clock-o');
        await addWorklog(driver, { days: -1, description: 'Sample Automation Comment' });
    });
});
