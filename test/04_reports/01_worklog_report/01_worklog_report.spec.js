import { describe, it } from 'mocha';
import { assert } from 'chai';
import { getScope } from '../../common/driver';
import { getCurrentPath, waitFor, chooseDateRange, navigateToMenu } from '../../common/utils';
import { getElFromHeader, getGadgetHeaderText, untilGadgetLoads } from '../../00_utils/_gadget';

describe("worklog report tests", function () {
    const { driver } = getScope();

    it("verify if worklog report loads", async function () {
        await waitFor(2000);
        await navigateToMenu(driver, 'userdaywise');
        await waitFor(1500);

        const route = await getCurrentPath(driver);
        assert.isTrue(route.endsWith('/reports/userdaywise'));
    });

    it("verify if worklog gadget is available", async function () {
        const gadgetHeader = await getGadgetHeaderText(driver);
        assert.equal(gadgetHeader, 'Worklog Report');
    });

    it("choose to load this week report", async function () {
        const dateControl = await getElFromHeader(driver, '', 'input');
        await dateControl.click();
        await chooseDateRange(driver, 'This week');
        await untilGadgetLoads(driver);
    });
});
