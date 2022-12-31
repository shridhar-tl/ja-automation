import { assert } from "chai";
import { By } from "selenium-webdriver";
import { forElToBeAvailable } from "../common/utils";

export async function getGadget(driver, id) {
    return forElToBeAvailable(driver, id ? `div.gadget[data-test-id="${id}"]` : 'div.gadget', driver, 5000);
}

export async function untilGadgetLoads(driver, id) {
    const el = await getGadget(driver, id);
    assert.exists(el, 'Gadget should have been loaded');
}

export async function getGadgetHeader(driver, id) {
    const gadget = await getGadget(driver, id);
    return gadget.findElement(By.css('.gadget-header'));
}

export async function getGadgetHeaderText(driver, id) {
    const gadgetHeader = await getGadgetHeader(driver, id);
    return gadgetHeader.getText();
}

export async function getElFromHeader(driver, id, selector) {
    if (typeof selector === 'string') {
        selector = By.css(selector);
    }

    const header = await getGadgetHeader(driver, id);
    return header.findElement(selector);
}

export async function getTableFromGadget(driver, id) {
    const gadget = await getGadget(driver, id);
    return gadget.findElement(By.css('.scroll-table-container > table'));
}

export async function triggerMenuClick(driver, table, issueKey, icon) {
    const tbody = await table.findElement(By.css(`tbody`));
    const issueRow = await tbody.findElement(By.css(`tr[data-test-id="${issueKey}"]`));

    const menu = await issueRow.findElement(By.css('td:first-child > i.fa-ellipsis-v'));
    await menu.click();

    const iconEl = await driver.findElement(By.css(`div.p-menu > ul.p-menu-list > li a span.p-menuitem-icon.fa-${icon}`));
    await iconEl.click();
}