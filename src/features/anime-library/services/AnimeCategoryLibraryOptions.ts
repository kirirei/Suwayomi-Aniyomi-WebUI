/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useState } from 'react';
import type { AnimeLibraryOptions } from '@/features/anime-library/AnimeLibrary.types.ts';
import { DEFAULT_ANIME_LIBRARY_OPTIONS } from '@/features/anime-library/AnimeLibrary.types.ts';

/**
 * Mirrors CategoryMetadata.ts's role for the anime library, but persists per-category sort/filter
 * choices to localStorage instead of server-side category metadata. AnimeCategoryMetaType exists
 * on the server (see AnimeCategoryMutation.ts) for a future settings UI, but wiring the library's
 * own filter/sort state through the shared, five-holder-type Metadata plumbing
 * (MetadataReader/MetadataUpdater/MetadataChunker) is real, cross-cutting surgery on code the
 * manga library depends on today - not worth the regression risk for what is, in the end, a
 * per-viewer display preference. localStorage means the choice is local to this browser and
 * resets if site data is cleared, which is an acceptable trade for not touching that shared code.
 */
const STORAGE_KEY_PREFIX = 'suwayomi-anime-library-options-category-';

const readOptions = (categoryId: number): AnimeLibraryOptions => {
    try {
        const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${categoryId}`);
        if (!raw) {
            return DEFAULT_ANIME_LIBRARY_OPTIONS;
        }
        return { ...DEFAULT_ANIME_LIBRARY_OPTIONS, ...(JSON.parse(raw) as Partial<AnimeLibraryOptions>) };
    } catch {
        return DEFAULT_ANIME_LIBRARY_OPTIONS;
    }
};

const writeOptions = (categoryId: number, options: AnimeLibraryOptions): void => {
    try {
        localStorage.setItem(`${STORAGE_KEY_PREFIX}${categoryId}`, JSON.stringify(options));
    } catch {
        // localStorage can throw in private browsing / storage-full situations - the UI still
        // works, it just won't remember the choice for next time.
    }
};

export const getAnimeCategoryLibraryOptions = (categoryId: number): AnimeLibraryOptions => readOptions(categoryId);

export const useAnimeCategoryLibraryOptions = (
    categoryId: number,
): [
    AnimeLibraryOptions,
    <Key extends keyof AnimeLibraryOptions>(key: Key, value: AnimeLibraryOptions[Key]) => void,
    () => void,
] => {
    const [options, setOptions] = useState<AnimeLibraryOptions>(() => readOptions(categoryId));
    const [loadedForCategoryId, setLoadedForCategoryId] = useState(categoryId);

    if (loadedForCategoryId !== categoryId) {
        setLoadedForCategoryId(categoryId);
        setOptions(readOptions(categoryId));
    }

    const update = useCallback(
        <Key extends keyof AnimeLibraryOptions>(key: Key, value: AnimeLibraryOptions[Key]) => {
            setOptions((current) => {
                const next = { ...current, [key]: value };
                writeOptions(categoryId, next);
                return next;
            });
        },
        [categoryId],
    );

    const resetFilters = useCallback(() => {
        setOptions((current) => {
            const next: AnimeLibraryOptions = {
                ...current,
                hasDownloadedEpisodes: undefined,
                hasBookmarkedEpisodes: undefined,
                hasUnseenEpisodes: undefined,
                hasSeenEpisodes: undefined,
                hasStatus: {},
                hasSource: {},
            };
            writeOptions(categoryId, next);
            return next;
        });
    }, [categoryId]);

    return [options, update, resetFilters];
};
