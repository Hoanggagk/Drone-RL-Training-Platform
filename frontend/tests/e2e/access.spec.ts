import { expect, test, type Page } from '@playwright/test';
async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/Tên đăng nhập hoặc email/i).fill('admin');
  await page.getByLabel('Mật khẩu').fill('demo-password');
  await page.getByRole('button', { name: 'Đăng nhập' }).click();
  await expect(page).toHaveURL(/\/iam\/accounts/);
}
test('role catalog is keyboard reachable', async ({ page }) => {
  await login(page);
  await page.getByRole('link', { name: 'Role toàn cục' }).click();
  await expect(page.getByRole('heading', { name: /Role và quyền/ })).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toBeVisible();
});
test('membership uses only opaque project id', async ({ page }) => {
  await login(page);
  await page.getByRole('link', { name: /Membership dự án/ }).click();
  await expect(page.getByText(/mã phạm vi opaque/)).toBeVisible();
  await expect(page.getByRole('link', { name: /Tạo project|Sửa project/i })).toHaveCount(0);
});
