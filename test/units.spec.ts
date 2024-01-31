import {test, expect, Page} from '@playwright/test';
import {getByRole} from "@testing-library/react";

test.describe.configure({ mode: 'serial' });

test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('/unitdetails?unit=ISAS-FSD');
    await page.waitForLoadState('domcontentloaded');
    // eslint-disable-next-line testing-library/prefer-screen-queries
    await page.getByRole('button', {name: /login/i}).click();
    await page.waitForLoadState('domcontentloaded');
});

test('deletes sub-unit', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    await page.locator('div').filter({hasText: /^Prof \/ RespCOSECsSub-UnitsISAS-FSDISAS-FSD \(test\)$/}).locator('[id="ISAS-FSD\\ \\(test\\)button"]').click();

    await save(page);

});

test('selects profs and cosecs', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    await page.getByPlaceholder('Select a person').nth(2).click();
    await page.getByPlaceholder('Select a person').nth(2).fill('rosati');
    await page.waitForLoadState('domcontentloaded');
    await page.getByText('Luca Rosati').click();
    const name = await page.locator('div').filter({hasText: /^Luca Rosati$/}).first();
    await expect(name).toBeDefined();

    await page.getByPlaceholder('Select a person').nth(3).click();
    await page.getByPlaceholder('Select a person').nth(3).fill('Ambrogio');
    await page.waitForLoadState('domcontentloaded');
    await page.getByText('Ambrogio Fasoli').click();
    const nameCosec = await page.locator('div').filter({ hasText: /^Ambrogio Fasoli$/ }).first();
    await expect(nameCosec).toBeDefined();

    await save(page);

});

test('deletes profs and cosecs', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    await page.locator('div').filter({ hasText: /^Prof \/ RespLuca RosatiCOSECsAmbrogio FasoliSub-UnitsNo sub-unit present$/ })
      .locator('[id="\\33 01468button"]').click();
    await page.locator('div').filter({ hasText: /^Prof \/ RespLuca RosatiCOSECsAmbrogio FasoliSub-UnitsNo sub-unit present$/ })
      .locator('[id="\\31 05078button"]').click();

    await save(page);

});

test('selects new sub-units', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('textbox', { name: 'Add a new sub-unit' }).click();
    await page.getByRole('textbox', { name: 'Add a new sub-unit' }).fill('test');
    await page.locator('div').filter({ hasText: /^Prof \/ RespCOSECsSub-UnitsNo sub-unit present$/ })
      .locator('svg').nth(3).click();
    await page.getByRole('textbox', { name: 'Add a new sub-unit' }).click();
    await page.getByRole('textbox', { name: 'Add a new sub-unit' }).fill('test 1');
    await page.locator('div').filter({ hasText: /^Prof \/ RespCOSECsSub-UnitsISAS-FSDISAS-FSD \(test\)$/ })
      .locator('svg').nth(3).click();

    await save(page);

});

test('deletes the new sub-unit', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    await page.locator('.card-text > div > .form-card-div > ul > li > .nested > li > .form-card > .form-flex-item-icon > div > [id="ISAS-FSD\\ \\(test\\ 1\\)button"]').click();

    await save(page);

});

test('can\'t insert a new sub-unit with the same name as one that already exists', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');

    await page.getByRole('textbox', { name: 'Add a new sub-unit' }).click();
    await page.getByRole('textbox', { name: 'Add a new sub-unit' }).fill('test');
    await page.locator('div').filter({ hasText: /^Prof \/ RespCOSECsSub-UnitsISAS-FSDISAS-FSD \(test\)$/ })
      .locator('svg').nth(3).click();

    await page.getByRole('button', {name: 'Save'}).click();
    let message = await page.getByText('Unit update failed Error');
    await page.waitForLoadState("domcontentloaded");
    await expect(message).toBeVisible();

});

async function save(page) {
    await page.getByRole('button', {name: 'Save'}).click();
    let message = await page.getByText(/Unit has successfully been/);
    await page.waitForLoadState("domcontentloaded");
    await expect(message).toBeVisible();
}
