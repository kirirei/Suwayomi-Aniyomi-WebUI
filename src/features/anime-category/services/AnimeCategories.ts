/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { AnimeCategoryDefaultInfo, AnimeCategoryIdInfo } from '@/features/anime-category/AnimeCategory.types.ts';

/** Mirrors Categories.ts - matches AnimeCategory.DEFAULT_CATEGORY_ID on the server. */
export const DEFAULT_ANIME_CATEGORY_ID = 0;

export class AnimeCategories {
    static getIds(categories: AnimeCategoryIdInfo[]): number[] {
        return categories.map((category) => category.id);
    }

    static getUserCreated<Category extends AnimeCategoryIdInfo>(categories: Category[]): Category[] {
        return categories.filter((category) => category.id !== DEFAULT_ANIME_CATEGORY_ID);
    }

    static getDefaults<Category extends AnimeCategoryDefaultInfo>(categories: Category[]): Category[] {
        return categories.filter((category) => category.default);
    }
}
