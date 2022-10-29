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
        assert.equal(await dateCols[0].getAttribute('data-test-id'), moment().startOf('week').format('YYYYMMDD'))
        assert.equal(await dateCols[6].getAttribute('data-test-id'), moment().endOf('week').format('YYYYMMDD'))
    });

    it("check if 1 week report loads", async function () {
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

        const logs = ['1h 30m', '1h 45m', '2h', '2h 15m', '2h 30m'];
        for (let dayOfWeek = 0; dayOfWeek < logs.length; dayOfWeek++) {
            const day = moment().startOf('week').add(dayOfWeek, 'days').format('YYYYMMDD');
            await assertHourLogOnDate(userRow, day, logs[dayOfWeek]);
        }

        await assertHourLogOnDate(userRow, 'total', '10h');
    });

    it("verify worklog on individual issue", async function () {
        const gadget = await getGadget(driver);
        const table = await gadget.findElement(tableSelector);

        const logs = [
            { ticket: 'JAS-5', log: '1h 30m' },
            { ticket: 'JAS-6', log: '1h 45m' },
            { ticket: 'JAS-7', log: '2h' },
            { ticket: 'JAS-8', log: '2h 15m' },
            { ticket: 'JAS-9', log: '2h 30m' }
        ];
        for (let dayOfWeek = 0; dayOfWeek < logs.length; dayOfWeek++) {
            const entry = logs[dayOfWeek];
            const day = moment().startOf('week').add(dayOfWeek, 'days').format('YYYYMMDD');

            await assertIssueHourLogOnDate(table, entry.ticket, day, entry.log);
            await assertIssueHourLogOnDate(table, entry.ticket, 'total', entry.log);
        }
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