/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { defineConfig, devices } from '@playwright/test';

const PREVIEW_PORT = 4321;

export default defineConfig({
    testDir: './e2e',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    workers: 1,
    reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
    timeout: 30_000,
    use: {
        baseURL: `http://127.0.0.1:${PREVIEW_PORT}`,
        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
    // Runs against the actual production build output (`vite preview`, serving `build/` - the exact
    // directory `pnpm build-zip` packages into a release), not the dev server, so a smoke-test pass
    // here means the thing a user actually downloads renders correctly, not just the dev-mode
    // source tree. Run `pnpm build` yourself before this suite (CI should too) - going through
    // `pnpm preview`'s own `pnpm setup` (a fresh `pnpm i --frozen-lockfile` every invocation) here
    // instead would make every local test run pay a redundant reinstall.
    webServer: {
        // --host 127.0.0.1 matters on Windows: `localhost` (vite's default) resolves IPv6-only here,
        // so the readiness probe below (which hits 127.0.0.1 explicitly) would see ECONNREFUSED
        // even though the server is genuinely up and listening.
        command: `pnpm exec vite preview --port ${PREVIEW_PORT} --strictPort --host 127.0.0.1`,
        url: `http://127.0.0.1:${PREVIEW_PORT}`,
        reuseExistingServer: !process.env.CI,
        timeout: 60_000,
        stdout: 'pipe',
        stderr: 'pipe',
    },
});
