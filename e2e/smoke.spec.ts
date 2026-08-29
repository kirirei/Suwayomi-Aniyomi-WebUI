/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { test, expect, consoleErrorsOf } from 'e2e/fixtures.ts';

/**
 * The exact bug class this suite exists to catch: a stale or incomplete WebUI build that renders
 * without crashing but is silently missing a whole content type's navigation and screens. Every
 * check here runs against the real production build (see playwright.config.ts) talking to a real,
 * freshly-seeded backend (see seed.ts) - not mocks, so a regression here means a real user would
 * hit it too.
 */

test.describe('app shell', () => {
    test('loads with no console errors', async ({ page }) => {
        await page.goto('/library');
        await expect(page.getByRole('heading', { name: 'Library' })).toBeVisible();
        expect(consoleErrorsOf(page)).toEqual([]);
    });
});

test.describe('top-level navigation', () => {
    const navItems: { path: string; heading: string }[] = [
        { path: '/library', heading: 'Library' },
        { path: '/anime-library', heading: 'Anime Library' },
        { path: '/anime-sources', heading: 'Anime Sources' },
        { path: '/updates', heading: 'Updates' },
        { path: '/history', heading: 'History' },
        { path: '/browse', heading: 'Browse' },
        { path: '/settings', heading: 'Settings' },
    ];

    for (const { path, heading } of navItems) {
        test(`${path} renders non-empty content`, async ({ page }) => {
            await page.goto(path);
            await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();

            const bodyText = await page.locator('body').innerText();
            expect(bodyText.trim().length).toBeGreaterThan(0);
            expect(consoleErrorsOf(page)).toEqual([]);
        });
    }

    test('clicking the Anime nav item actually navigates there', async ({ page }) => {
        await page.goto('/library');
        await page.getByRole('link', { name: 'Anime', exact: true }).click();
        await expect(page).toHaveURL(/\/anime-library/);
    });
});
