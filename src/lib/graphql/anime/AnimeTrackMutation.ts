/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { ANIME_TRACK_RECORD_FIELDS } from '@/lib/graphql/anime/AnimeTrackFragments.ts';

export const BIND_ANIME_TRACK = gql`
    ${ANIME_TRACK_RECORD_FIELDS}

    mutation BIND_ANIME_TRACK($input: BindAnimeTrackInput!) {
        bindAnimeTrack(input: $input) {
            trackRecord {
                ...ANIME_TRACK_RECORD_FIELDS
            }
        }
    }
`;

export const UNBIND_ANIME_TRACK = gql`
    mutation UNBIND_ANIME_TRACK($input: UnbindAnimeTrackInput!) {
        unbindAnimeTrack(input: $input) {
            trackRecord {
                id
            }
        }
    }
`;

export const UPDATE_ANIME_TRACK = gql`
    ${ANIME_TRACK_RECORD_FIELDS}

    mutation UPDATE_ANIME_TRACK($input: UpdateAnimeTrackInput!) {
        updateAnimeTrack(input: $input) {
            trackRecord {
                ...ANIME_TRACK_RECORD_FIELDS
            }
        }
    }
`;

export const FETCH_ANIME_TRACK = gql`
    ${ANIME_TRACK_RECORD_FIELDS}

    mutation FETCH_ANIME_TRACK($input: FetchAnimeTrackInput!) {
        fetchAnimeTrack(input: $input) {
            trackRecord {
                ...ANIME_TRACK_RECORD_FIELDS
            }
        }
    }
`;
