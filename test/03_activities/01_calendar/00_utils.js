import { assert } from "chai";
import { By } from "selenium-webdriver";

export async function validateEventOnADay(calendar, dayIndex, dateObj, issueKey, comment, time = '10am - 11am') {
    const gridRow = await calendar.findElement(By.css('table.fc-scrollgrid tbody tr:nth-child(3) .fc-timegrid-body .fc-timegrid-cols table tbody tr:first-child'));

    const todayCol = await gridRow.findElement(By.css(`td:nth-child(${dayIndex})`));
    assert.equal(await todayCol.getAttribute('data-date'), dateObj.format('YYYY-MM-DD'));

    const event = await todayCol.findElement(By.css(`.fc-timegrid-col-events .fc-content[data-jira-key="${issueKey}"][data-jira-wl-id]`));
    const title = await event.getAttribute('title');
    assert.include(title, time);
    assert.include(title, issueKey);
    assert.include(title, comment);

    const titleInBody = await event.findElement(By.css('.fc-title')).getText();
    assert.include(titleInBody, issueKey);
    assert.include(titleInBody, comment);

    return event;
}

export async function executeEventOption(driver, event, className, useIcon) {
    if (useIcon) {
        await event.findElement(By.css(`.fa.fa-ellipsis-v.float-start`)).click();
    } else {
        await driver.actions({ bridge: true }).contextClick(event).perform();
    }
    const icon = await driver.findElement(By.css(`.${useIcon ? 'p-menu' : 'p-contextmenu'} > ul > li.p-menuitem > a > .${className}`));
    await icon.click();
}