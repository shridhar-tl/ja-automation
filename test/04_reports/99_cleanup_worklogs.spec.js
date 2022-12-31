import { By } from 'selenium-webdriver';
import { describe, it } from 'mocha';
import { assert } from 'chai';
import moment from 'moment';
import { getScope } from '../common/driver';
import { getCurrentPath, waitFor, navigateToMenu } from '../common/utils';
import { executeEventOption, validateEventOnADay } from '../03_activities/01_calendar/00_utils';

describe("worklog calendar tests", function () {
    const { driver } = getScope();

    it("verify if calendar loads", async function () {
        await navigateToMenu(driver, 'CAL', 'Worklog Calendar');
        await waitFor(1500);

        const route = await getCurrentPath(driver);
        assert.isTrue(route.endsWith('/calendar'));
    });

    it("verify and cleanup worklogs", async function () {
        const calendar = await driver.findElement(By.css('.fc-timegrid.fc-timeGridWeek-view'));

        const headerSelector = By.css('table.fc-col-header thead tr th.fc-col-header-cell.fc-day[data-date]');
        const header = await calendar.findElements(headerSelector);
        assert.equal(header.length, 7);

        for (let dayOfWeek = 0; dayOfWeek < 5; dayOfWeek++) {
            const curDay = moment().startOf('week').add(dayOfWeek, 'days');
            const ticketNo = 'JAS-' + (dayOfWeek + 5);
            assert.equal(await header[dayOfWeek].getAttribute('data-date'), curDay.format('YYYY-MM-DD'));
            const event = await validateEventOnADay(calendar, dayOfWeek + 2, curDay, ticketNo, 'Sample Automation - Calendar Worklog - ' + ticketNo, '9:45am - ');
            await executeEventOption(driver, event, 'fa-times');
        }

        await waitFor(2000);
    });
});
