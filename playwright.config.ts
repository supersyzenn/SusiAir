import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
  testDir:'./tests/e2e', fullyParallel:false,
  use:{ baseURL:'http://localhost:3000', trace:'retain-on-failure' },
  projects:[{ name:'mobile',use:{ ...devices['iPhone 13'] } },{ name:'desktop',use:{ ...devices['Desktop Chrome'] } }],
  webServer:[
    { command:'npm run dev:api',url:'http://localhost:3001/health',reuseExistingServer:!process.env.CI,timeout:120000 },
    { command:'npm run dev:web',url:'http://localhost:3000',reuseExistingServer:!process.env.CI,timeout:120000 },
  ],
});
