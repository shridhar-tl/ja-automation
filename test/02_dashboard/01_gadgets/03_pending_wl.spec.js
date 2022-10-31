import { By } from 'selenium-webdriver';
import { describe, it } from 'mocha';
import { assert } from 'chai';
import { getScope } from '../../common/driver';
import { getCurrentPath, confirmDelete } from '../../common/utils';
import addWorklog from '../../00_utils/add-worklog';
import { getGadgetHeaderText, getTableFromGadget, triggerMenuClick, getElFromHeader, untilGadgetLoads } from '../../00_utils/_gadget';

const gadgetName = 'pendingWorklog';

describe("pending worklogs gadget test", function () {
    const { driver } = getScope();

    it("verify if default dashboard is loaded", async function () {
        const route = await getCurrentPath(driver);
        assert.equal(route, '/2/dashboard/0');
    });

    it("verify if pending worklog gadget is available", async function () {
        const gadgetHeader = await getGadgetHeaderText(driver, gadgetName);
        assert.equal(gadgetHeader, 'Worklog - [Pending upload]');
    });

    it("verify if pending worklog gadget loads data", async function () {
        const table = await getTableFromGadget(driver, gadgetName);

        const rows = await table.findElements(By.css('tbody > tr'));

        assert.equal(rows.length, 4);

        const checkbox = await table.findElement(By.css('thead > tr > th:first-child .p-checkbox-icon'));
        await checkbox.click();
    });

    it("edit worklog from loaded list and upload", async function () {
        const table = await getTableFromGadget(driver, gadgetName);
        await triggerMenuClick(driver, table, 'JAS-1', 'edit');
        await addWorklog(driver, { days: 1, description: ' - additional description added' }, true);

        const rows = await table.findElements(By.css('tbody > tr'));

        assert.equal(rows.length, 3);
    });

    it("delete worklogs from loaded list", async function () {
        const table = await getTableFromGadget(driver, gadgetName);
        await triggerMenuClick(driver, table, 'JAK-1', 'check-square-o');

        const btnDelete = await getElFromHeader(driver, gadgetName, 'button.p-button-danger > .fa-trash-o');
        await btnDelete.click();
        await confirmDelete(driver);

        const rows = await table.findElements(By.css('tbody > tr'));
        assert.equal(rows.length, 2);

        await triggerMenuClick(driver, table, 'JAS-2', 'trash-o');
        await confirmDelete(driver);

        const rowsAfterDel = await table.findElements(By.css('tbody > tr'));
        assert.equal(rowsAfterDel.length, 1);
    });

    it("upload worklog from context menu", async function () {
        const table = await getTableFromGadget(driver, gadgetName);
        await triggerMenuClick(driver, table, 'JAK-2', 'upload');

        await untilGadgetLoads(driver, gadgetName);

        const rowsAfterDelete = await table.findElements(By.css('tbody > tr > td[colspan="7"]'));
        assert.equal(rowsAfterDelete.length, 1);
    });
});
