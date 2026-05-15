import { defineConfig } from "@playwright/test";

const PLAYWRIGHT_HOST = process.env.PLAYWRIGHT_HOST ?? "127.0.0.1";
const PLAYWRIGHT_PORT = Number(process.env.PLAYWRIGHT_PORT ?? "3101");
const PLAYWRIGHT_BASE_URL = `http://${PLAYWRIGHT_HOST}:${PLAYWRIGHT_PORT}`;
const PLAYWRIGHT_DEV_SERVER_COMMAND = `npm run dev -- --hostname ${PLAYWRIGHT_HOST} --port ${PLAYWRIGHT_PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: PLAYWRIGHT_BASE_URL,
  },
  webServer: {
    command: PLAYWRIGHT_DEV_SERVER_COMMAND,
    url: PLAYWRIGHT_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});

