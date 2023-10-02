import { test, expect } from '@playwright/test';

test.describe('navigation', () => {
  test.beforeEach(async ({ page }) => {
    // Go to the starting url before each test.
    await page.goto('http://localhost:3000/');
  });

  test('main navigation', async ({ page }) => {
    // Assertions use the expect API.
    await expect(page).toHaveURL('http://localhost:3000/');
  });
});


test('has title', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/LHD/);
});

test('has the login button', async ({ page }) => {
  await page.goto('http://localhost:3000/');

  // eslint-disable-next-line testing-library/prefer-screen-queries
  const button= page.getByRole('button', { name: /login/i });
  await expect(button).toBeVisible();
  await button.click();

  // eslint-disable-next-line testing-library/prefer-screen-queries
  const buttonSignIn= page.getByRole('button', { name: /Sign In/i });
  await expect(buttonSignIn).toBeVisible();

  // eslint-disable-next-line testing-library/prefer-screen-queries
  const username = page.getByRole('textbox', { name: /username/i });
  await expect(username).toBeVisible();
  await username.fill('rosa');


  // eslint-disable-next-line testing-library/prefer-screen-queries
  const password = page.getByRole('textbox', { name: /password/i });
  await expect(password).toBeVisible();
  await password.fill('rosa2');
  await buttonSignIn.click();

  // eslint-disable-next-line testing-library/prefer-screen-queries
  await expect(page.getByText("Dispensations")).toBeVisible();

});
