import { By } from 'selenium-webdriver';
import { describe, it } from 'mocha';
import { assert } from 'chai';
import moment from 'moment';
import { getScope } from '../../common/driver';
import { getCurrentPath, navigateToMenu } from '../../common/utils';
import { getGadgetHeader, untilGadgetLoads } from '../../00_utils/_gadget';
import { executeEventOption, validateEventOnADay } from './00_utils';

describe("worklog calendar tests", function () {
    const { driver, scenario } = getScope();

    it("verify if calendar loads", async function () {
        await navigateToMenu(driver, 'CAL', 'Worklog Calendar');
        await driver.sleep(1500);

        const route = await getCurrentPath(driver);
        assert.isTrue(route.endsWith('/calendar'));

        if (scenario.useCloud) {
            await driver.sleep(4000); // This is to wait for dashboard route to be loaded
        }
    });

    it("verify if calendar loads worklog", async function () {
        const today = moment();
        const yesterday = moment().add(-1, 'day');

        const dayOfWeek_today = today.weekday();
        const dayOfWeek_yesterday = yesterday.weekday();

        const calendar = await driver.findElement(By.css('.fc-timegrid.fc-timeGridWeek-view'));

        const headerSelector = By.css('table.fc-col-header thead tr th.fc-col-header-cell.fc-day[data-date]');
        let header = await calendar.findElements(headerSelector);
        assert.equal(header.length, 7);

        assert.equal(await header[dayOfWeek_today].getAttribute('data-date'), today.format('YYYY-MM-DD'));
        const event = await validateEventOnADay(calendar, dayOfWeek_today + 2, today, 'JAK-2', 'Sample Automation Comment');
        await executeEventOption(driver, event, 'fa-times');

        let navigated = false;

        if (dayOfWeek_today < dayOfWeek_yesterday) {
            const gadgetHeader = await getGadgetHeader(driver);
            const prevWeekBtn = await gadgetHeader.findElement(By.css('.float-end button .fa-arrow-left'));
            await prevWeekBtn.click();

            navigated = true;

            await untilGadgetLoads(driver);
            header = await calendar.findElements(headerSelector);
        }

        assert.equal(await header[dayOfWeek_yesterday].getAttribute('data-date'), yesterday.format('YYYY-MM-DD'));
        const lastDayEvent = await validateEventOnADay(calendar, dayOfWeek_yesterday + 2, yesterday, 'JAS-1', 'additional description added');
        await executeEventOption(driver, lastDayEvent, 'fa-times');

        if (navigated) {
            const gadgetHeader = await getGadgetHeader(driver);
            const nextWeekBtn = await gadgetHeader.findElement(By.css('.float-end button .fa-arrow-right'));
            await nextWeekBtn.click();
            await untilGadgetLoads(driver);
        }
    });
});
