import { expect, test, type Page } from '@playwright/test';
async function login(page: Page) {
  await page.goto('/login');
  await page.getByLabel(/Tên đăng nhập hoặc email/i).fill('admin');
  await page.getByLabel(/Mật khẩu/i).fill('password-demo-123');
  await page.getByRole('button', { name: /Đăng nhập/i }).click();
  await expect(page).toHaveURL(/\/iam\/accounts/);
}
test('account lifecycle remains keyboard reachable', async ({ page }) => {
  await login(page);
  await expect(page.getByRole('heading', { name: 'Quản lý account' })).toBeVisible();
  await page.getByRole('button', { name: 'Tạo account' }).click();
  const form = page.getByRole('form', { name: 'Tạo account' });
  await form.getByLabel('Tên đăng nhập').fill('e2e.user');
  await form.getByLabel('Email').fill('e2e@example.test');
  await form.getByLabel('Tên hiển thị').fill('E2E User');
  await form.getByLabel('Mật khẩu ban đầu').fill('password-demo-123');
  await form.getByRole('button', { name: 'Tạo account', exact: true }).click();
  await expect(page.getByText('e2e.user')).toBeVisible();
});
test('permission scenario exposes no admin data', async ({ page }) => {
  await login(page);
  await page.getByLabel('Chọn kịch bản demo').click();
  await page.getByText('Không đủ quyền', { exact: true }).click();
  await page.getByRole('button', { name: 'Làm mới' }).click();
  await expect(page.getByRole('alert')).toBeVisible();
});
