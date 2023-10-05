import { test as setup, expect } from '@playwright/test';
// @ts-ignore
import fs from 'fs';

const authFile = './playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
    // if (fs.existsSync(authFile) && JSON.parse()) {
    //    console.log("exists");
    // } else {
    //     console.log("doesn't exists");

        // Go to the starting url before each test.
        await page.goto('./');
        // Perform the login
        // eslint-disable-next-line testing-library/prefer-screen-queries
        const button = page.getByRole('button', {name: /login/i});
        await expect(button).toBeVisible();
        await button.click();

        // eslint-disable-next-line testing-library/prefer-screen-queries
        await page.getByRole('textbox', {name: /username/i}).fill('rosa');
        // eslint-disable-next-line testing-library/prefer-screen-queries
        await page.getByRole('textbox', {name: /password/i}).fill('rosa2');
        // eslint-disable-next-line testing-library/prefer-screen-queries
        await page.getByRole('button', {name: /Sign In/i}).click();
        await page.waitForLoadState();

        await expect(page.getByRole('link', { name: 'Dispensations' })).toBeVisible();
    //}
    await page.context().storageState({path: authFile});
});