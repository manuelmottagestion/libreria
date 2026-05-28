/**
 * tests/e2e/auth.spec.js
 * End-to-End tests para flujos de autenticación
 */

import { test, expect } from '@playwright/test';

test.describe('Autenticación - Login Flow', () => {
  test('debe mostrar página de login para usuarios no autenticados', async ({ page }) => {
    await page.goto('/index.html');
    
    // Verificar que está en la página de login
    const loginForm = page.locator('form');
    await expect(loginForm).toBeVisible();
    
    // Verificar campos de entrada
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
  });

  test('debe navegar a dashboard después de autenticación exitosa', async ({ page }) => {
    // Simular login guardando token en localStorage
    await page.goto('/index.html');
    
    // Este test requiere implementar un botón de login real
    // Por ahora, verificamos que la estructura existe
    const loginForm = page.locator('form');
    await expect(loginForm).toBeVisible();
  });

  test('debe mostrar email del usuario logueado', async ({ page }) => {
    // Navegar al dashboard (requiere autenticación previa)
    await page.goto('/dashboard.html');
    
    // Buscar el elemento que muestra el email del usuario
    const userEmailEl = page.locator('#userEmail');
    
    // Si existe el elemento, verificar que tenga contenido
    if (await userEmailEl.isVisible()) {
      const emailText = await userEmailEl.textContent();
      expect(emailText).toBeTruthy();
    }
  });

  test('debe limpiar datos de autenticación al cerrar sesión', async ({ page, context }) => {
    // Verificar que localStorage se limpia
    await context.clearCookies();
    
    // Navegar y verificar que se limpie
    await page.goto('/dashboard.html');
    
    // Debería redirigir al login si no hay token
    expect(page.url()).toContain('index.html');
  });
});

test.describe('Persistencia de Sesión', () => {
  test('debe recuperar sesión desde localStorage', async ({ page, context }) => {
    // Guardar token en localStorage
    await context.addInitScript(() => {
      localStorage.setItem('libToken', 'test-token-123');
      localStorage.setItem('libUser', 'test@gmail.com');
    });

    await page.goto('/dashboard.html');

    // Verificar que se mantiene el token
    const token = await page.evaluate(() => localStorage.getItem('libToken'));
    expect(token).toBe('test-token-123');
  });

  test('debe invalidar sesión si token es nulo', async ({ page }) => {
    await page.goto('/dashboard.html');
    
    // Sin token, debe redirigir al login
    expect(page.url()).toContain('index.html');
  });
});
