/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { ANIME_TRACK_RECORD_FIELDS, ANIME_TRACK_SEARCH_FIELDS } from '@/lib/graphql/anime/AnimeTrackFragments.ts';

export const GET_ANIME_TRACK_RECORDS = gql`
    ${ANIME_TRACK_RECORD_FIELDS}

    query GET_ANIME_TRACK_RECORDS($animeId: Int!) {
        animeTrackRecords(animeId: $animeId) {
            ...ANIME_TRACK_RECORD_FIELDS
        }
    }
`;

export const SEARCH_ANIME_TRACK = gql`
    ${ANIME_TRACK_SEARCH_FIELDS}

    query SEARCH_ANIME_TRACK($query: String!) {
        searchAnimeTrack(query: $query) {
            ...ANIME_TRACK_SEARCH_FIELDS
        }
    }
`;
