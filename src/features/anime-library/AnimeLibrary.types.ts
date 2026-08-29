/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Mirrors Library.types.ts, trimmed to what AnimeType actually exposes:
 * - no "duplicate episodes" filter - there's no hasDuplicateEpisodes resolver
 * - no tracker filter - AnimeType has no trackRecords field yet
 * - no "latest fetched/uploaded episode" sort - no per-anime resolver for either exists
 * hasStatus is keyed by whatever status strings are actually present in the library, since
 * AnimeType.status is a plain String (there's no AnimeStatus enum to enumerate ahead of time).
 */
export type AnimeLibrarySortMode =
    | 'unseenEpisodes'
    | 'totalEpisodes'
    | 'alphabetically'
    | 'dateAdded'
    | 'lastSeen'
    | 'random';

export interface AnimeLibraryOptions {
    // sort options
    sortBy: NullAndUndefined<AnimeLibrarySortMode>;
    sortDesc: NullAndUndefined<boolean>;

    // filter options
    hasDownloadedEpisodes: NullAndUndefined<boolean>;
    hasBookmarkedEpisodes: NullAndUndefined<boolean>;
    hasUnseenEpisodes: NullAndUndefined<boolean>;
    hasSeenEpisodes: NullAndUndefined<boolean>;
    hasStatus: Record<string, NullAndUndefined<boolean>>;
    hasSource: Record<string, NullAndUndefined<boolean>>;
}

export const DEFAULT_ANIME_LIBRARY_OPTIONS: AnimeLibraryOptions = {
    sortBy: undefined,
    sortDesc: undefined,
    hasDownloadedEpisodes: undefined,
    hasBookmarkedEpisodes: undefined,
    hasUnseenEpisodes: undefined,
    hasSeenEpisodes: undefined,
    hasStatus: {},
    hasSource: {},
};
