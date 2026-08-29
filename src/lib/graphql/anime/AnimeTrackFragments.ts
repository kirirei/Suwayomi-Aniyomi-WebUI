/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';

/** Mirrors TRACK_RECORD_BIND_FIELDS/TRACK_RECORD_SEARCH_FIELDS, without a displayScore field - there is no per-anime-tracker score dataloader yet, so the raw score is shown directly. */
export const ANIME_TRACK_RECORD_FIELDS = gql`
    fragment ANIME_TRACK_RECORD_FIELDS on AnimeTrackRecordType {
        id
        animeId
        remoteId
        trackerId
        remoteUrl
        title
        status
        lastEpisodeSeen
        totalEpisodes
        score
        startDate
        finishDate
        private
    }
`;

export const ANIME_TRACK_SEARCH_FIELDS = gql`
    fragment ANIME_TRACK_SEARCH_FIELDS on AnimeTrackSearchType {
        remoteId
        title
        trackingUrl
        coverUrl
        publishingType
        startDate
        publishingStatus
        summary
        score
        totalEpisodes
    }
`;
