/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';

export const EPISODE_BASE_FIELDS = gql`
    fragment EPISODE_BASE_FIELDS on EpisodeType {
        id
        url
        name
        animeId
        episodeNumber
        scanlator
        fillermark
        seen
        bookmarked
        lastSecondSeen
        totalSeconds
        lastSeenAt
        index
        uploadDate
        fetchedAt
        realUrl
        downloaded
    }
`;

export const EPISODE_LIST_FIELDS = gql`
    ${EPISODE_BASE_FIELDS}

    fragment EPISODE_LIST_FIELDS on EpisodeType {
        ...EPISODE_BASE_FIELDS

        summary
        previewUrl
    }
`;
