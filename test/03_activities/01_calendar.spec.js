import { By, until } from 'selenium-webdriver';
import { describe, it } from 'mocha';
import { assert } from 'chai';
import { getScope } from '../common/driver';
import { getCurrentPath, waitFor, navigateToMenu } from '../common/utils';
import addWorklog from '../00_utils/add-worklog';

describe("worklog calendar tests", function () {
    const { driver } = getScope();

    it("verify if calendar loads", async function () {
        await navigateToMenu(driver, 'calendar');
        await waitFor(1500);

        const route = await getCurrentPath(driver);
        assert.isTrue(route.endsWith('/calendar'));
    });

    it("verify if calendar loads worklog", async function () {
        await navigateToMenu(driver, 'calendar');
        await waitFor(1500);

        const route = await getCurrentPath(driver);
        assert.isTrue(route.endsWith('/calendar'));
    });
});
