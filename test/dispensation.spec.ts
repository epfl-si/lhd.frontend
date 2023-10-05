import { test, expect } from '@playwright/test';
import {getByRole} from "@testing-library/react";

test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('./');
    await page.waitForLoadState();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    await page.getByRole('button', {name: /login/i}).click();
    await page.waitForLoadState();
});

test('has title', async ({ page }) => {
    await expect(page).toHaveTitle(/LHD/);
});

test('has the dispensations menu', async ({ page }) => {
    // eslint-disable-next-line testing-library/prefer-screen-queries
    await expect(page.getByRole('link', { name: 'Dispensations' })).toBeVisible();
});

test('creates a new dispensation and then updates it and deletes it', async ({ page }) => {
    // eslint-disable-next-line testing-library/prefer-screen-queries
    await page.getByRole('link', { name: 'Dispensations' }).click();
    await page.getByLabel('​', { exact: true }).click();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    await page.getByRole('option', { name: 'Flammable Gas' }).click();

    await page.getByLabel('Start Date').click();
    await page.getByLabel('Start Date').fill('10/18/2023');
    await page.getByLabel('End Date').click();
    await page.getByLabel('End Date').fill('10/30/2023');

    await page.getByLabel('Rooms').click();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    await page.getByRole('option', { name: 'BCH 0409' }).click();
    await page.getByLabel('Rooms').click();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    await page.getByRole('option', { name: 'BCH 0405' }).click();
    await page.getByLabel('Holders').click();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    await page.getByRole('option', { name: 'Anne', exact: true }).click();
    await page.getByLabel('Holders').click();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    await page.getByRole('option', { name: 'Rosendo' }).click();

    await page.locator('textarea[name="requirements"]').fill('Test rosa codegen');
    await page.locator('textarea[name="comment"]').fill('test rosa comment codegen');
    // eslint-disable-next-line testing-library/prefer-screen-queries
    await page.getByRole('button', { name: 'Submit' }).click();

    // eslint-disable-next-line testing-library/no-await-sync-query,testing-library/prefer-screen-queries
    const message = await page.getByText(/Dispensation has successfully been created:/);
    const newDispensation = await message.textContent();
    const idND = newDispensation.substring(newDispensation.indexOf(': ')+3);
    await expect(message).toBeVisible();

    // eslint-disable-next-line testing-library/prefer-screen-queries
    await page.getByRole('tab', {name: 'Update Dispensation'}).click();
    await page.getByLabel('Open').click();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    await page.getByRole('option', {name: idND}).click();
    await page.locator('textarea[name="requirements"]').fill('Test rosa codegen update');
    await page.locator('textarea[name="comment"]').fill('test rosa comment codegen update');
    await page.getByLabel('Rooms').click();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    await page.getByRole('option', {name: 'BCH 0312'}).click();
    await page.getByLabel('Holders').click();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    await page.getByRole('option', {name: 'Jean-Claude'}).click();

    // eslint-disable-next-line testing-library/prefer-screen-queries
    await page.getByRole('button', {name: 'Update'}).click();

    // eslint-disable-next-line testing-library/prefer-screen-queries
    await expect(page.getByText('Dispensation has successfully been updated')).toBeVisible();

    // eslint-disable-next-line testing-library/prefer-screen-queries
    await page.getByRole('button', {name: 'Delete'}).click();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    await page.getByRole('button', {name: 'Yes, I\'m sure'}).click();
    // eslint-disable-next-line testing-library/prefer-screen-queries
    await expect(page.getByText('Dispensation has successfully been deleted')).toBeVisible();
});
