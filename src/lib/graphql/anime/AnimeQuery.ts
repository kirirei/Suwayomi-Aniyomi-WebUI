/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import {
    ANIME_EXTENSION_FIELDS,
    ANIME_SCREEN_FIELDS,
    ANIME_SOURCE_FIELDS,
} from '@/lib/graphql/anime/AnimeFragments.ts';
import { EPISODE_LIST_FIELDS } from '@/lib/graphql/episode/EpisodeFragments.ts';

export const GET_ANIME_EXTENSIONS = gql`
    ${ANIME_EXTENSION_FIELDS}

    query GET_ANIME_EXTENSIONS {
        animeExtensions {
            ...ANIME_EXTENSION_FIELDS
        }
    }
`;

export const GET_ANIME_SOURCES = gql`
    ${ANIME_SOURCE_FIELDS}

    query GET_ANIME_SOURCES {
        animeSources {
            ...ANIME_SOURCE_FIELDS
        }
    }
`;

export const GET_ANIME_LIBRARY = gql`
    ${ANIME_SCREEN_FIELDS}

    query GET_ANIME_LIBRARY {
        animeLibrary {
            ...ANIME_SCREEN_FIELDS
        }
    }
`;

export const GET_ANIME_SOURCE = gql`
    ${ANIME_SOURCE_FIELDS}

    query GET_ANIME_SOURCE($id: LongString!) {
        animeSource(id: $id) {
            ...ANIME_SOURCE_FIELDS
        }
    }
`;

export const GET_POPULAR_ANIME_LIST = gql`
    ${ANIME_SCREEN_FIELDS}

    query GET_POPULAR_ANIME_LIST($sourceId: LongString!, $page: Int) {
        popularAnimeList(sourceId: $sourceId, page: $page) {
            hasNextPage
            animeList {
                ...ANIME_SCREEN_FIELDS
            }
        }
    }
`;

export const GET_LATEST_ANIME_LIST = gql`
    ${ANIME_SCREEN_FIELDS}

    query GET_LATEST_ANIME_LIST($sourceId: LongString!, $page: Int) {
        latestAnimeList(sourceId: $sourceId, page: $page) {
            hasNextPage
            animeList {
                ...ANIME_SCREEN_FIELDS
            }
        }
    }
`;

export const GET_SEARCH_ANIME_LIST = gql`
    ${ANIME_SCREEN_FIELDS}

    query GET_SEARCH_ANIME_LIST($sourceId: LongString!, $page: Int, $query: String!) {
        searchAnimeList(sourceId: $sourceId, page: $page, query: $query) {
            hasNextPage
            animeList {
                ...ANIME_SCREEN_FIELDS
            }
        }
    }
`;

export const GET_ANIME_SCREEN = gql`
    ${ANIME_SCREEN_FIELDS}

    query GET_ANIME_SCREEN($id: Int!, $onlineFetch: Boolean) {
        anime(id: $id, onlineFetch: $onlineFetch) {
            ...ANIME_SCREEN_FIELDS
        }
    }
`;

export const GET_ANIME_EPISODES = gql`
    ${EPISODE_LIST_FIELDS}

    query GET_ANIME_EPISODES($animeId: Int!, $onlineFetch: Boolean) {
        episodes(animeId: $animeId, onlineFetch: $onlineFetch) {
            ...EPISODE_LIST_FIELDS
        }
    }
`;

export const GET_EPISODE = gql`
    ${EPISODE_LIST_FIELDS}

    query GET_EPISODE($id: Int!) {
        episode(id: $id) {
            ...EPISODE_LIST_FIELDS
        }
    }
`;
