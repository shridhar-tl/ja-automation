import { By } from 'selenium-webdriver';
import { describe, it } from 'mocha';
import { assert } from 'chai';
import moment from 'moment';
import { getScope } from '../../common/driver';
import { getCurrentPath, waitFor, navigateToMenu } from '../../common/utils';
import { getGadgetHeader } from '../../00_utils/_gadget';
import { executeEventOption, validateEventOnADay } from './00_utils';

describe("worklog calendar tests", function () {
    const { driver } = getScope();


    it("verify if calendar loads", async function () {
        await navigateToMenu(driver, 'calendar');
        await waitFor(1500);

        const route = await getCurrentPath(driver);
        assert.isTrue(route.endsWith('/calendar'));
    });

    it("verify if calendar loads worklog", async function () {
        const today = moment();
        const yesterday = moment().add(-1, 'day');

        const dayOfWeek_today = today.weekday();
        const dayOfWeek_yesterday = yesterday.weekday();

        const calendar = await driver.findElement(By.css('.fc-timegrid.fc-timeGridWeek-view'));

        const header = await calendar.findElements(By.css('table.fc-col-header thead tr th.fc-col-header-cell.fc-day[data-date]'));
        assert.equal(header.length, 7);

        assert.equal(await header[dayOfWeek_today].getAttribute('data-date'), today.format('YYYY-MM-DD'));
        const event = await validateEventOnADay(calendar, dayOfWeek_today + 2, today, 'JAK-2', 'Sample Automation Comment');
        await executeEventOption(driver, event, 'fa-times');

        let navigated = false;

        if (dayOfWeek_today < dayOfWeek_yesterday) {
            const gadgetHeader = await getGadgetHeader(driver);
            const prevWeekBtn = await gadgetHeader.findElement(By.css('.pull-right button .fa-arrow-left'));
            await prevWeekBtn.click();

            navigated = true;

            await untilGadgetLoads(driver);
        }

        assert.equal(await header[dayOfWeek_yesterday].getAttribute('data-date'), yesterday.format('YYYY-MM-DD'));
        const lastDayEvent = await validateEventOnADay(calendar, dayOfWeek_yesterday + 2, yesterday, 'JAS-1', 'additional description added');
        await executeEventOption(driver, lastDayEvent, 'fa-times');

        if (navigated) {
            const gadgetHeader = await getGadgetHeader(driver);
            const nextWeekBtn = await gadgetHeader.findElement(By.css('.pull-right button .fa-arrow-right'));
            await nextWeekBtn.click();
            await untilGadgetLoads(driver);
        }
    });
});