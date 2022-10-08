import { By } from 'selenium-webdriver';
import { describe, it } from 'mocha';
import { assert } from 'chai';
import moment from 'moment/moment';
import { getScope } from '../../common/driver';
import { getGadget } from '../../00_utils/_gadget';

describe("worklog report - grouped tab tests", function () {
    const { driver } = getScope();
    const tableSelector = By.css('table[export-sheet-name="Grouped - [User daywise]"]');
    const userRowSelector = By.css('tbody tr[data-current-user="1"][data-row-id="user"]');
    it("check if cols loaded for 1 week", async function () {
        const gadget = await getGadget(driver);
        const table = await gadget.findElement(tableSelector);

        const dateCols = await table.findElements(By.css('thead > tr:last-child > th'));
        assert.equal(dateCols.length, 7);
        assert.equal(await dateCols[0].getAttribute('data-test-id'), moment().add(-6, 'days').format('YYYYMMDD'))
        assert.equal(await dateCols[6].getAttribute('data-test-id'), moment().format('YYYYMMDD'))
    });

    it("check if last 1 week report loads", async function () {
        const gadget = await getGadget(driver);
        const table = await gadget.findElement(tableSelector);

        const userRow = await table.findElement(userRowSelector);
        const cols = await userRow.findElements(By.css('td'));
        await cols[0].click();

        const icons = await cols[0].findElements(By.css('.drill-down.fa-chevron-circle-down'));

        assert.equal(icons.length, 1);
    });

    it("verify worklog for user", async function () {
        const gadget = await getGadget(driver);
        const table = await gadget.findElement(tableSelector);

        const userRow = await table.findElement(userRowSelector);

        const today = moment().format('YYYYMMDD'),
            yesterday = moment().add(-1, 'days').format('YYYYMMDD');

        await assertHourLogOnDate(userRow, yesterday, '1h');
        await assertHourLogOnDate(userRow, today, '1h');
        await assertHourLogOnDate(userRow, 'total', '2h');
    });

    it("verify worklog on individual issue", async function () {
        const gadget = await getGadget(driver);
        const table = await gadget.findElement(tableSelector);

        const today = moment().format('YYYYMMDD'),
            yesterday = moment().add(-1, 'days').format('YYYYMMDD');

        await assertIssueHourLogOnDate(table, 'JAS-1', yesterday, '1h');
        await assertIssueHourLogOnDate(table, 'JAK-2', today, '1h');
        await assertIssueHourLogOnDate(table, 'JAK-2', 'total', '2h');
    });
});

async function assertIssueHourLogOnDate(table, key, date, log) {
    const row = await table.findElement(By.css(`tr[data-test-id="${key}"][data-current-user="1"]`));
    await assertHourLogOnDate(row, date, log);
}

async function assertHourLogOnDate(row, date, log) {
    const td = await row.findElement(By.css(`td[data-test-id="${date}"]`));
    const text = await td.getText();
    assert.strictEqual(text, log, "Worklog hours do not match for " + date);
}