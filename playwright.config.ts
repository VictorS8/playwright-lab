import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'todomvc',
      testDir: './tests/todomvc',
      use: { ...devices['Desktop Chrome'], 
        baseURL: 'https://demo.playwright.dev' 
      },
    },
    {
      name: 'saucedemo',
      testDir: './tests/saucedemo',
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'https://www.saucedemo.com',
        testIdAttribute: 'data-test',
      },
    },
    {
      name: 'the-internet',
      testDir: './tests/the-internet',
      use: { ...devices['Desktop Chrome'], 
        baseURL: 'https://the-internet.herokuapp.com' 
      },
    },
  ],
});
