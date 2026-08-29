/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { test as base, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

const SERVER_URL = process.env.SERVER_URL ?? 'http://127.0.0.1:15000';

const consoleErrorsByPage = new WeakMap<Page, string[]>();

/**
 * The preview build has no backend of its own (see playwright.config.ts) - in production mode
 * BaseClient.getBaseUrl() defaults to same-origin, which would point every GraphQL request at the
 * static preview server instead of a real Suwayomi-Aniyomi-Server. This points it at SERVER_URL
 * instead, by pre-seeding the same localStorage key the app itself writes when a user changes their
 * server address in Settings, before any app script runs on the very first navigation.
 */
export const test = base.extend({
    // oxlint-disable-next-line no-empty-pattern
    page: async ({ page }, runTest) => {
        await page.addInitScript((serverUrl) => {
            window.localStorage.setItem('suwayomi_webui__serverBaseURL', JSON.stringify(serverUrl));
        }, SERVER_URL);

        const consoleErrors: string[] = [];
        consoleErrorsByPage.set(page, consoleErrors);
        page.on('console', (message) => {
            // "Failed to load resource" is the browser's own generic log for any failed <img>/font/etc.
            // fetch, not something the app's JS raised - real extension icons and cover art are fetched
            // over the network here (this suite deliberately doesn't mock), so an occasional broken
            // third-party icon URL is expected and isn't an app defect. Genuine JS/React errors still
            // fail the check below.
            if (message.type() === 'error' && !message.text().startsWith('Failed to load resource')) {
                consoleErrors.push(message.text());
            }
        });
        page.on('pageerror', (error) => {
            consoleErrors.push(error.message);
        });

        await runTest(page);
    },
});

export { expect };

export function consoleErrorsOf(page: Page): string[] {
    return consoleErrorsByPage.get(page) ?? [];
}
