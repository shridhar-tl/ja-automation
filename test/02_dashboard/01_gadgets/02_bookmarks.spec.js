import { By, until } from 'selenium-webdriver';
import { describe, it } from 'mocha';
import { assert } from 'chai';
import { getScope } from '../../common/driver';
import { getCurrentPath, confirmDelete, waitFor } from '../../common/utils';
import addWorklog from '../../00_utils/add-worklog';
import { getGadgetHeaderText, getTableFromGadget, triggerMenuClick, getElFromHeader } from '../../00_utils/_gadget';

const gadgetName = 'myBookmarks';

describe("my bookmarks gadget test", function () {
    const { driver } = getScope();

    it("verify if default dashboard is loaded", async function () {
        const route = await getCurrentPath(driver);
        assert.equal(route, '/2/dashboard/0');
    });

    it("verify if my bookmark gadget is available", async function () {
        const gadgetHeader = await getGadgetHeaderText(driver, gadgetName);
        assert.equal(gadgetHeader, 'My Bookmarks');
    });

    it("verify if my bookmark gadget loads data", async function () {
        const table = await getTableFromGadget(driver, gadgetName);

        const rows = await table.findElements(By.css('tbody > tr'));

        assert.equal(rows.length, 2);
    });

    it("add worklog for tickets from loaded list", async function () {
        const table = await getTableFromGadget(driver, gadgetName);
        await triggerMenuClick(driver, table, 'JAS-2', 'clock-o');
        await addWorklog(driver, { description: 'Sample Automation worklog from bookmark' });
        await triggerMenuClick(driver, table, 'JAS-1', 'clock-o');
        await addWorklog(driver, { days: -1, description: 'Sample Automation worklog from bookmark' });
    });

    it("delete bookmarked tickets from loaded list", async function () {
        const table = await getTableFromGadget(driver, gadgetName);
        await triggerMenuClick(driver, table, 'JAS-1', 'check-square-o');

        const btnDelete = await getElFromHeader(driver, gadgetName, 'button.p-button-danger > .fa-trash-o');
        await btnDelete.click();
        await confirmDelete(driver);

        const rows = await table.findElements(By.css('tbody > tr'));
        assert.equal(rows.length, 1);

        await triggerMenuClick(driver, table, 'JAS-2', 'trash-o');
        await confirmDelete(driver);

        const rowsAfterDelete = await table.findElements(By.css('tbody > tr > td[colspan="11"]'));
        assert.equal(rowsAfterDelete.length, 1);
    });
});