import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/Tên đăng nhập hoặc email/i).fill('admin');
  await page.getByLabel('Mật khẩu').fill('demo-password');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL(/\/iam\/accounts/);
}
async function expectNoViolations(page: Page) {
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
}
test('axe login', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Đăng nhập' })).toBeVisible();
  await expectNoViolations(page);
});
test('axe change password', async ({ page }) => {
  await login(page);
  await page.getByRole('link', { name: 'Đổi mật khẩu' }).click();
  await expect(page.getByRole('heading', { name: 'Đổi mật khẩu' })).toBeVisible();
  await expectNoViolations(page);
});
for (const [label, heading] of [
  ['Tài khoản', 'Quản lý account'],
  ['Role toàn cục', 'Role và quyền truy cập'],
  ['Membership dự án', 'Project Membership'],
] as const)
  test(`axe ${label}`, async ({ page }) => {
    await login(page);
    if (label !== 'Tài khoản') await page.getByRole('link', { name: label }).click();
    await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    await expectNoViolations(page);
  });

test('axe account create dialog and error state', async ({ page }) => {
  await login(page);
  const trigger = page.locator('#main-content').getByRole('button', { name: 'Tạo account' });
  await trigger.click();
  const dialog = page.getByRole('dialog', { name: 'Tạo account' });
  await expect(dialog).toBeVisible();
  await page.waitForTimeout(500);
  expect((await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations).toEqual(
    [],
  );
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
  await page.getByLabel('Chọn kịch bản demo').click();
  await page.getByText('Không đủ quyền', { exact: true }).click();
  await page.getByRole('button', { name: 'Làm mới' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
  expect(
    (await new AxeBuilder({ page }).exclude('.ant-select-dropdown').analyze()).violations,
  ).toEqual([]);
});

test('confirmation dialog traps and returns focus safely', async ({ page }) => {
  await login(page);
  await page.getByRole('link', { name: 'Role toàn cục' }).click();
  const trigger = page.getByRole('button', { name: 'Thu hồi' }).first();
  await trigger.focus();
  await page.keyboard.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await page.waitForTimeout(500);
  expect((await new AxeBuilder({ page }).include('[role="dialog"]').analyze()).violations).toEqual(
    [],
  );
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});
