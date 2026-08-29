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

/**
 * Runs before the category-tab test below, which moves the seeded anime out of the "Default"
 * tab - this test wants it there so the single-tab shortcut path in AnimeLibrary.tsx (rendered
 * whenever a library has exactly one tab) is what gets exercised.
 */
test('anime covers actually render real images through the thumbnail proxy', async ({ page }) => {
    await page.goto('/anime-library');

    const cover = page.locator('img').first();
    await expect(cover).toBeVisible({ timeout: 15_000 });

    const naturalWidth = await cover.evaluate((img: HTMLImageElement) => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);

    const src = await cover.getAttribute('src');
    expect(src).toMatch(/\/api\/v1\/anime\/\d+\/thumbnail/);

    expect(consoleErrorsOf(page)).toEqual([]);
});

/**
 * This is the exact bug the user hit: anime categories corrupted into the manga library's
 * CategoryTable (fixed server-side by giving anime its own AnimeCategoryTable) plus the anime
 * library screen being "a different fucking ui" with no category tabs at all (fixed by porting
 * Library.tsx instead of hand-rolling a flat grid). A new anime category must be creatable from
 * Settings, assignable from the library card menu, and show up as its own tab - none of that
 * worked at all before this session's fix.
 */
test('a newly created anime category becomes a real library tab, separate from manga categories', async ({ page }) => {
    const categoryName = `E2E Watching ${Date.now()}`;

    await page.goto('/settings/anime/categories');
    await expect(page.getByRole('heading', { name: 'Edit anime categories', exact: true })).toBeVisible();
    await page.locator('button[aria-label="add"]').click();
    await page.getByLabel('Category Name').fill(categoryName);
    await page.getByRole('button', { name: 'Submit' }).click();
    await expect(page.getByText(categoryName, { exact: true })).toBeVisible({ timeout: 15_000 });

    // the same category must never leak into the manga side's category list
    await page.goto('/settings/categories');
    await expect(page.getByText(categoryName, { exact: true })).not.toBeVisible();

    // a real (non-default) category always renders as its own tab even before anything is
    // filed into it - the seeded anime deliberately stays in "Default" here (rather than being
    // moved into the new category) because with only one anime seeded, moving it out of
    // "Default" would empty that category and collapse the library back down to a single tab,
    // which correctly hides the tab bar (mirrors Library.tsx) but would make this assertion
    // meaningless for what it's actually trying to catch.
    await page.goto('/anime-library');
    await expect(page.getByRole('tab', { name: new RegExp(categoryName) })).toBeVisible({ timeout: 15_000 });
    await expect(page.getByRole('tab', { name: 'DEFAULT' })).toBeVisible();

    expect(consoleErrorsOf(page)).toEqual([]);
});
