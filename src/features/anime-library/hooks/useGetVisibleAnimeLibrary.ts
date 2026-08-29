/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { StringParam, useQueryParam } from 'use-query-params';
import { useMemo } from 'react';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { enhancedCleanup } from '@/base/utils/Strings.ts';
import { useAnimeCategoryLibraryOptions } from '@/features/anime-library/services/AnimeCategoryLibraryOptions.ts';
import type { AnimeLibraryOptions, AnimeLibrarySortMode } from '@/features/anime-library/AnimeLibrary.types.ts';
import type {
    AnimeArtistInfo,
    AnimeAuthorInfo,
    AnimeBookmarkInfo,
    AnimeDescriptionInfo,
    AnimeDownloadInfo,
    AnimeGenreInfo,
    AnimeIdInfo,
    AnimeInLibraryInfo,
    AnimeLastSeenInfo,
    AnimeSourceIdInfo,
    AnimeSourceNameInfo,
    AnimeStatusInfo,
    AnimeTitleInfo,
    AnimeUnseenInfo,
} from '@/features/anime/Anime.types.ts';
import { SearchParam } from '@/base/Base.types.ts';
import { CustomCache } from '@/lib/storage/CustomCache.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { Animes } from '@/features/anime/services/Animes.ts';
import isEqual from 'lodash/fp/isEqual';

const triStateFilter = (
    triState: NullAndUndefined<boolean>,
    enabledFilter: () => boolean,
    disabledFilter: () => boolean,
): boolean => {
    switch (triState) {
        case true:
            return enabledFilter();
        case false:
            return disabledFilter();
        default:
            return true;
    }
};

const triStateFilterNumber = (triState: NullAndUndefined<boolean>, count?: number): boolean =>
    triStateFilter(
        triState,
        () => !!count && count >= 1,
        () => count === 0,
    );

const performSearch = (
    queries: NullAndUndefined<string>[] | undefined,
    strings: NullAndUndefined<string>[],
): boolean => {
    const actualQueries = queries?.filter((query) => query != null);
    const actualStrings = strings?.filter((str) => str != null);

    if (!actualQueries?.length) {
        return true;
    }

    const cleanedUpQueries = actualQueries.map(enhancedCleanup);
    const cleanedUpStrings = actualStrings.map(enhancedCleanup).join(', ');

    return cleanedUpQueries.every((query) => cleanedUpStrings.includes(query));
};

type TAnimeQueryFilter = AnimeTitleInfo &
    AnimeGenreInfo &
    AnimeDescriptionInfo &
    AnimeArtistInfo &
    AnimeAuthorInfo &
    AnimeSourceIdInfo &
    AnimeSourceNameInfo;
const querySearchAnime = (
    query: NullAndUndefined<string>,
    { title, genre: genres, description, artist, author, source, sourceId }: TAnimeQueryFilter,
): boolean =>
    performSearch([query], [title]) ||
    performSearch(
        query?.split(','),
        genres.map((genre) => enhancedCleanup(genre)),
    ) ||
    performSearch([query], [description]) ||
    performSearch([query], [artist]) ||
    performSearch([query], [author]) ||
    performSearch([query], [source?.displayName]) ||
    performSearch([query], [sourceId]);

const statusFilter = (statusFilters: AnimeLibraryOptions['hasStatus'], anime: AnimeStatusInfo): boolean =>
    Object.entries(statusFilters)
        .map(([status, statusFilterState]) =>
            triStateFilter(
                statusFilterState,
                () => status === anime.status,
                () => status !== anime.status,
            ),
        )
        .every(Boolean);

const sourceFilter = (sourceFilters: AnimeLibraryOptions['hasSource'], anime: AnimeSourceIdInfo): boolean =>
    Object.entries(sourceFilters)
        .map(([sourceId, sourceFilterState]) =>
            triStateFilter(
                sourceFilterState,
                () => sourceId === anime.sourceId,
                () => sourceId !== anime.sourceId,
            ),
        )
        .every(Boolean);

type TAnimeFilterOptions = Pick<
    AnimeLibraryOptions,
    | 'hasUnseenEpisodes'
    | 'hasSeenEpisodes'
    | 'hasDownloadedEpisodes'
    | 'hasBookmarkedEpisodes'
    | 'hasStatus'
    | 'hasSource'
>;
type TAnimeFilter = AnimeStatusInfo & AnimeSourceIdInfo & AnimeUnseenInfo & AnimeDownloadInfo & AnimeBookmarkInfo;
const filterAnime = (
    anime: TAnimeFilter,
    {
        hasDownloadedEpisodes,
        hasUnseenEpisodes,
        hasSeenEpisodes,
        hasBookmarkedEpisodes,
        hasStatus,
        hasSource,
    }: TAnimeFilterOptions,
): boolean =>
    triStateFilterNumber(hasDownloadedEpisodes, anime.downloadCount) &&
    triStateFilterNumber(hasUnseenEpisodes, anime.unseenCount) &&
    triStateFilterNumber(hasSeenEpisodes, (anime.episodeCount ?? 0) - (anime.unseenCount ?? 0)) &&
    triStateFilterNumber(hasBookmarkedEpisodes, anime.bookmarkCount) &&
    statusFilter(hasStatus, anime) &&
    sourceFilter(hasSource, anime);

type TAnimesFilter = TAnimeQueryFilter & TAnimeFilter;
const filterAnimes = <Anime extends TAnimesFilter>(
    animes: Anime[],
    query: NullAndUndefined<string>,
    options: TAnimeFilterOptions & { ignoreFilters: boolean },
): Anime[] => {
    const ignoreFiltersWhileSearching = options.ignoreFilters && query?.length;

    return animes.filter((anime) => {
        const matchesSearch = querySearchAnime(query, anime);
        const matchesFilters = ignoreFiltersWhileSearching || filterAnime(anime, options);

        return matchesSearch && matchesFilters;
    });
};

const sortByNumber = (a: number | string = 0, b: number | string = 0) => Number(a) - Number(b);

const sortByString = (a: string, b: string): number => a.localeCompare(b, undefined, { sensitivity: 'base' });

const sortByRandom = () => Math.floor(Math.random() * 3 - 1);

type TAnimeSort = AnimeTitleInfo & AnimeInLibraryInfo & AnimeUnseenInfo & AnimeLastSeenInfo;
const sortAnime = <Anime extends TAnimeSort>(
    anime: Anime[],
    sort: NullAndUndefined<AnimeLibrarySortMode>,
    desc: NullAndUndefined<boolean>,
): Anime[] => {
    const result = [...anime];

    const primaryComparator = ((): ((a: Anime, b: Anime) => number) => {
        switch (sort) {
            case 'alphabetically':
                return (a, b) => sortByString(a.title, b.title);
            case 'dateAdded':
                return (a, b) => sortByNumber(a.inLibraryAt, b.inLibraryAt);
            case 'unseenEpisodes':
                return (a, b) => sortByNumber(a.unseenCount, b.unseenCount);
            case 'lastSeen':
                return (a, b) => sortByNumber(a.lastSeenAt ?? 0, b.lastSeenAt ?? 0);
            case 'totalEpisodes':
                return (a, b) => sortByNumber(a.episodeCount, b.episodeCount);
            case 'random':
                return () => sortByRandom();
            default:
                return () => 0;
        }
    })();

    result.sort((a, b) => {
        const cmp = primaryComparator(a, b);
        if (cmp !== 0) {
            if (desc) {
                return -cmp;
            }
            return cmp;
        }

        return sortByString(a.title, b.title);
    });

    return result;
};

const SORT_CACHE = new CustomCache();
type SortOptions = Pick<AnimeLibraryOptions, 'sortBy' | 'sortDesc'>;
const useSortedAnimes = <Anime extends AnimeIdInfo & TAnimesFilter & TAnimeSort>(
    categoryId: number | undefined,
    animes: Anime[],
    options: SortOptions,
): Anime[] => {
    const CACHE_ANIMES_KEY = `anime-library-category-${categoryId}-animes`;
    const CACHE_ANIME_IDS_KEY = `anime-library-category-${categoryId}-anime-ids`;
    const CACHE_ANIMES_SORTED_KEY = `anime-library-category-${categoryId}-animes-sorted`;
    const CACHE_SORT_OPTIONS_KEY = `anime-library-category-${categoryId}-sort-options`;

    const animeIds = useMemo(() => Animes.getIds(animes), [animes]);

    const cachedAnimes = SORT_CACHE.getResponseFor<Anime[]>(CACHE_ANIMES_KEY, undefined);
    const cachedAnimeIds = SORT_CACHE.getResponseFor<AnimeIdInfo['id'][]>(CACHE_ANIME_IDS_KEY, undefined);
    const cachedSortOptions = SORT_CACHE.getResponseFor<SortOptions>(CACHE_SORT_OPTIONS_KEY, undefined);

    const previousSortBy = cachedSortOptions?.sortBy;
    const previousSortDesc = cachedSortOptions?.sortDesc;

    const haveAnimesChanged = !isEqual(animes, cachedAnimes);
    const haveAnimeIdsChanged = !isEqual(animeIds, cachedAnimeIds);
    const haveSortOptionsChanged = previousSortBy !== options.sortBy || previousSortDesc !== options.sortDesc;
    const reapplySorting = haveAnimeIdsChanged || haveSortOptionsChanged;

    const sortedAnimes = (() => {
        if (reapplySorting) {
            const { sortBy, sortDesc } = options;

            SORT_CACHE.cacheResponse(CACHE_SORT_OPTIONS_KEY, undefined, { sortBy, sortDesc });

            return sortAnime(animes, sortBy, sortDesc);
        }

        return SORT_CACHE.getResponseFor<Anime[]>(CACHE_ANIMES_SORTED_KEY, undefined) ?? STABLE_EMPTY_ARRAY;
    })();

    const sortedAnimesUpdatedReferences = useMemo(() => {
        if (haveAnimesChanged) {
            return sortedAnimes.map((sortedAnime) => animes.find((anime) => anime.id === sortedAnime.id)!);
        }

        return sortedAnimes;
    }, [haveAnimesChanged, sortedAnimes, animes]);

    SORT_CACHE.cacheResponse(CACHE_ANIMES_KEY, undefined, animes);
    SORT_CACHE.cacheResponse(CACHE_ANIME_IDS_KEY, undefined, animeIds);
    SORT_CACHE.cacheResponse(CACHE_ANIMES_SORTED_KEY, undefined, sortedAnimesUpdatedReferences);

    return sortedAnimesUpdatedReferences;
};

export const useGetVisibleAnimeLibrary = <Anime extends AnimeIdInfo & TAnimesFilter & TAnimeSort>(
    animes: Anime[],
    categoryId: number | undefined,
): {
    visibleAnimes: Anime[];
    showFilteredOutMessage: boolean;
    filterKey: string;
} => {
    const [query] = useQueryParam(SearchParam.QUERY, StringParam);
    const [options] = useAnimeCategoryLibraryOptions(categoryId ?? -1);
    const { hasUnseenEpisodes, hasSeenEpisodes, hasDownloadedEpisodes, hasBookmarkedEpisodes, hasStatus, hasSource } =
        options;
    const { settings } = useMetadataServerSettings();

    const sortedAnimes = useSortedAnimes(categoryId, animes, options);

    const filteredAnimes = useMemo(
        () =>
            filterAnimes(sortedAnimes, query, {
                hasUnseenEpisodes,
                hasSeenEpisodes,
                hasDownloadedEpisodes,
                hasBookmarkedEpisodes,
                hasStatus,
                hasSource,
                ignoreFilters: settings.ignoreFilters,
            }),
        [
            sortedAnimes,
            query,
            hasUnseenEpisodes,
            hasSeenEpisodes,
            hasDownloadedEpisodes,
            hasBookmarkedEpisodes,
            hasStatus,
            hasSource,
            settings.ignoreFilters,
        ],
    );

    const isASourceFilterActive = Object.values(hasSource).some((sourceFilterState) => sourceFilterState != null);
    const showFilteredOutMessage =
        (hasUnseenEpisodes != null ||
            hasSeenEpisodes != null ||
            hasDownloadedEpisodes != null ||
            hasBookmarkedEpisodes != null ||
            !!query ||
            isASourceFilterActive) &&
        filteredAnimes.length === 0 &&
        animes.length > 0;

    return {
        visibleAnimes: filteredAnimes,
        showFilteredOutMessage,
        filterKey: `${JSON.stringify(options)}${settings.ignoreFilters}`,
    };
};
