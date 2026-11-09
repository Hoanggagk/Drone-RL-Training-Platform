import { expect, test } from '@playwright/test';
test('required actions remain reachable at 1024px', async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto('/login');
  await expect(page.getByRole('button', { name: /đăng nhập/i })).toBeInViewport();
});
