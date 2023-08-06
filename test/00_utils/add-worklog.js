import { assert } from "chai";
import moment from "moment/moment";
import { By, Key } from "selenium-webdriver";
import { forElToBeAvailable, forElToBeRemoved, forElToBeVisible, waitFor } from "../common/utils";

const today10AM = moment().startOf("day").add(10, 'hour');

export default async function addWorklog(driver, { ticketNo, date, days, description, spent }, upload) {
    await waitFor(2000);
    const wlDialogSelector = By.css('body > div.p-dialog-mask > div.add-worklog-popup');
    const worklogDialog = await driver.findElement(wlDialogSelector);
    const ctls = await worklogDialog.findElements(By.css('div.p-dialog-content div.row'));

    assert.equal(ctls.length, 4);

    if (days) {
        date = today10AM.add(days, "days");
    } else if (date) {
        date = moment(date);
    } else if (date !== false) {
        date = today10AM
    }

    if (date) {
        const logTime = await ctls[0].findElement(By.css('input.date-range-ctl'));
        await logTime.clear();
        await logTime.sendKeys(date.format('DD-MMM-YYYY HH:mm A'));
    }

    if (ticketNo) {
        const issueKeyCtl = await ctls[1].findElement(By.css('input'));
        await issueKeyCtl.clear();
        await issueKeyCtl.sendKeys(ticketNo);
        await issueKeyCtl.sendKeys(Key.TAB);
        // Wait for the ticket details to be pulled from Jira
        await forElToBeAvailable(driver, `div.sel-issue .edit-key.fa-pencil`, worklogDialog);
    }

    if (spent) {
        spent = convertHourToString(spent);
        console.log('About to log ', spent, ' for ', description);

        const timeSpent = await ctls[0].findElement(By.css('input.p-inputmask'));
        await timeSpent.sendKeys(Key.BACK_SPACE, spent);
    }

    if (description) {
        const descCtl = await ctls[2].findElement(By.css('textarea'));
        await descCtl.clear();
        await descCtl.sendKeys(description);
    }

    const footer = await worklogDialog.findElement(By.css('div.p-dialog-footer'));
    const saveBtnSelector = upload ? 'button[aria-label="Save & Upload"]' : 'button[aria-label="Save"]';
    const btnSave = await footer.findElement(By.css(saveBtnSelector));
    await btnSave.click();

    await forElToBeRemoved(driver, wlDialogSelector);

    await waitFor(1000);
}

function convertHourToString(hour) {
    if (typeof hour === 'number') {
        let mins = hour * 60;
        hour = parseInt(hour);
        mins = mins % 60;
        return pad2(hour) + pad2(mins);
    }

    return hour;
}

function pad2(val) {
    val = `00${val || ''}`;
    val = val.substring(val.length - 2);
    return val;
}