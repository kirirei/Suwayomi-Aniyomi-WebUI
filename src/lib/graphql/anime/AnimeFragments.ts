/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';

export const ANIME_EXTENSION_FIELDS = gql`
    fragment ANIME_EXTENSION_FIELDS on AnimeExtensionType {
        pkgName
        name
        apkName
        iconUrl
        versionName
        versionCode
        lang
        isNsfw
        isInstalled
        hasUpdate
        isObsolete
    }
`;

export const ANIME_SOURCE_FIELDS = gql`
    fragment ANIME_SOURCE_FIELDS on AnimeSourceType {
        id
        name
        displayName
        lang
        iconUrl
        isNsfw
        isConfigurable
        supportsLatest
        homeUrl
    }
`;

export const ANIME_BASE_FIELDS = gql`
    fragment ANIME_BASE_FIELDS on AnimeType {
        id
        sourceId
        url
        title
        thumbnailUrl
        backgroundUrl
        initialized
        inLibrary
    }
`;

export const ANIME_SCREEN_FIELDS = gql`
    ${ANIME_BASE_FIELDS}

    fragment ANIME_SCREEN_FIELDS on AnimeType {
        ...ANIME_BASE_FIELDS

        artist
        author
        description
        genre
        status
        realUrl
        lastFetchedAt
        episodesLastFetchedAt
        updateStrategy
    }
`;

export const ANIME_EPISODE_STAT_FIELDS = gql`
    fragment ANIME_EPISODE_STAT_FIELDS on AnimeType {
        id
        unseenCount
        downloadCount
        bookmarkCount
        episodeCount
        lastSeenAt
    }
`;

export const ANIME_SOURCE_NAME_FIELDS = gql`
    fragment ANIME_SOURCE_NAME_FIELDS on AnimeSourceType {
        id
        displayName
    }
`;

export const ANIME_LIBRARY_FIELDS = gql`
    ${ANIME_BASE_FIELDS}
    ${ANIME_EPISODE_STAT_FIELDS}
    ${ANIME_SOURCE_NAME_FIELDS}

    fragment ANIME_LIBRARY_FIELDS on AnimeType {
        ...ANIME_BASE_FIELDS
        ...ANIME_EPISODE_STAT_FIELDS

        sourceId
        status
        genre
        description
        artist
        author
        inLibraryAt
        lastSeenAt

        source {
            ...ANIME_SOURCE_NAME_FIELDS
        }
    }
`;
