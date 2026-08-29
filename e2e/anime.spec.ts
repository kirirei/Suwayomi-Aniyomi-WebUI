/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { test, expect, consoleErrorsOf } from './fixtures.ts';

/**
 * These exercise the two concrete gaps the user hit in the real app: an anime in the library
 * whose episode list wouldn't load, and an installed anime extension repo with nowhere to
 * actually browse/install from. Both run against the anime seeded into SERVER_URL by seed.ts,
 * proving real end-to-end data flow rather than a static fixture.
 */

test('anime library shows the seeded anime, and its episode list renders', async ({ page }) => {
    await page.goto('/anime-library');

    const animeCard = page.locator('a[href^="/anime/"]').first();
    await expect(animeCard).toBeVisible({ timeout: 15_000 });

    await animeCard.click();
    await expect(page).toHaveURL(/\/anime\/\d+$/);

    const episodeItems = page.getByRole('listitem');
    await expect(episodeItems.first()).toBeVisible({ timeout: 15_000 });
    expect(await episodeItems.count()).toBeGreaterThan(0);

    expect(consoleErrorsOf(page)).toEqual([]);
});

test('anime source browse finds the installed extension under Anime Sources > Extension', async ({ page }) => {
    await page.goto('/anime-sources');
    await page.getByRole('tab', { name: 'Extension' }).click();

    const extensionCard = page.locator('.MuiCard-root').first();
    await expect(extensionCard).toBeVisible({ timeout: 15_000 });

    // seed.ts already installed this extension, so its card shows "Update" or "Uninstall", never "Install".
    await expect(extensionCard.getByRole('button', { name: /Uninstall|Update/ })).toBeVisible();

    expect(consoleErrorsOf(page)).toEqual([]);
});

test('settings > anime page loads and round-trips a field', async ({ page }) => {
    await page.goto('/settings/anime');
    await expect(page.getByRole('heading', { name: 'Anime', exact: true })).toBeVisible();

    const extensionReposLink = page.getByText('Anime extension repos', { exact: false });
    await expect(extensionReposLink).toBeVisible();
    await extensionReposLink.click();

    await expect(page).toHaveURL(/\/settings\/anime\/extension-stores/);
    await expect(page.getByText('yuzono/anime-repo', { exact: false })).toBeVisible({ timeout: 15_000 });

    expect(consoleErrorsOf(page)).toEqual([]);
});
