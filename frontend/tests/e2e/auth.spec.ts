import { expect, test } from '@playwright/test';
test('keyboard login then logout', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel(/Tên đăng nhập hoặc email/i).fill('admin');
  await page.locator('input#password').fill('demo-password');
  await page.getByRole('button', { name: 'Đăng nhập' }).press('Enter');
  await expect(page).toHaveURL(/\/iam\/accounts/);
  await page.getByRole('button', { name: 'Đăng xuất' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/login/);
});

test('forced password rotation and session expiry are deterministic', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Chọn kịch bản demo').click();
  await page.getByText('Buộc đổi mật khẩu', { exact: true }).click();
  await page.getByLabel(/Tên đăng nhập hoặc email/i).fill('learner');
  await page.locator('input#password').fill('demo-password');
  await page.getByRole('button', { name: 'Đăng nhập' }).press('Enter');
  await expect(page).toHaveURL(/\/change-password/);
  await page.getByLabel('Mật khẩu hiện tại').fill('demo-password');
  await page.getByLabel('Mật khẩu mới', { exact: true }).fill('a-new-password-123');
  await page.getByLabel('Xác nhận mật khẩu mới').fill('a-new-password-123');
  await page.getByRole('button', { name: 'Lưu mật khẩu' }).click();
  await expect(page).toHaveURL(/\/iam\/accounts/);
  await expect(
    page.evaluate(() => Object.keys({ ...localStorage, ...sessionStorage }).join(',')),
  ).resolves.not.toMatch(/csrf|password|cookie/i);
  await page.getByLabel('Chọn kịch bản demo').click();
  await page.getByText('Phiên hết hạn', { exact: true }).click();
  await expect(page).toHaveURL(/\/login\?reason=session-expired/);
});
