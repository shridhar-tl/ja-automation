import { By, Origin } from 'selenium-webdriver';
import { describe, it } from 'mocha';
import { assert } from 'chai';
import moment from 'moment';
import { getScope } from '../../common/driver';
import { getCurrentPath, waitFor, navigateToMenu, forLoaderToEnd, forElToBeRemoved } from '../../common/utils';
import { getElFromHeader, untilGadgetLoads } from '../../00_utils/_gadget';
import addWorklog from '../../00_utils/add-worklog';

describe("worklog calendar tests", function () {
    const { driver, scenario } = getScope();

    it("verify if calendar loads", async function () {
        await waitFor(2000);
        await navigateToMenu(driver, 'CAL', 'Worklog Calendar');
        await waitFor(1500);

        const route = await getCurrentPath(driver);
        assert.isTrue(route.endsWith('/calendar'));
    });

    it("verify if able to create worklog", async function () {
        const calendar = await driver.findElement(By.css('.fc-timegrid.fc-timeGridWeek-view'));

        for (let dayOfWeek = 0; dayOfWeek < 5; dayOfWeek++) {
            await createEvent(driver, scenario, calendar, dayOfWeek + 2, moment().startOf('week').add(dayOfWeek, 'days'), 4 + dayOfWeek);
            const ticketNo = 'JAS-' + (dayOfWeek + 5);
            await addWorklog(driver, { date: false, ticketNo, description: 'Sample Automation - Calendar Worklog - ' + ticketNo });
        }
    });

    it("verify if able to upload worklogs", async function () {
        const uploader = await getElFromHeader(driver, null, 'span.info-badge');
        const pendingCount = await uploader.findElement(By.css('.btn-warning')).getText();
        assert.equal(pendingCount, '5');

        const button = await uploader.findElement(By.css('button .fa-upload'));
        await button.click();

        const actions = driver.actions({ async: true });
        await actions.move({ origin: Origin.POINTER, y: 300 }).perform();

        await forLoaderToEnd(driver, button);
        await untilGadgetLoads(driver);

        const badges = await uploader.findElements(By.css('.btn-warning'));
        assert.equal(badges.length, 0);

        await forElToBeRemoved(driver, '.p-toast .p-toast-message', driver);
    });
});

async function createEvent(driver, scenario, calendar, dayIndex, dateObj, slots = 4) {
    const dayCol = await calendar.findElement(By.css(`div.fc-timegrid-body > .fc-timegrid-cols > table > tbody > tr:first-child td.fc-timegrid-col:nth-child(${dayIndex})`));

    const dateStr = await dayCol.getAttribute('data-date');
    assert.equal(dateStr, dateObj.format('YYYY-MM-DD'));

    const actions = driver.actions({ async: true });
    const startTop = scenario.useCloud ? -285 : -300;
    const slotSize = 25;
    await actions.move({ origin: dayCol, x: 30, y: startTop }).press().perform();
    await actions.move({ y: slots * slotSize, origin: Origin.POINTER }).release().perform();
}