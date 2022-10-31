import { By } from 'selenium-webdriver';
import { describe, it } from 'mocha';
import { assert } from 'chai';
import { getScope } from '../../common/driver';
import { getCurrentPath, waitFor } from '../../common/utils';
import addWorklog from '../../00_utils/add-worklog';
import { getGadgetHeaderText, getTableFromGadget, triggerMenuClick } from '../../00_utils/_gadget';

const gadgetName = 'myOpenTickets';

describe("my open tickets gadget test", function () {
    const { driver } = getScope();

    it("verify if default dashboard is loaded", async function () {
        await waitFor(2000);
        const route = await getCurrentPath(driver);
        assert.equal(route, '/2/dashboard/0');
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
        await waitFor(500);
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
