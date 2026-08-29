/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { ANIME_EXTENSION_FIELDS, ANIME_SCREEN_FIELDS } from '@/lib/graphql/anime/AnimeFragments.ts';
import { EPISODE_BASE_FIELDS } from '@/lib/graphql/episode/EpisodeFragments.ts';

export const UPDATE_ANIME_EXTENSION = gql`
    ${ANIME_EXTENSION_FIELDS}

    mutation UPDATE_ANIME_EXTENSION($input: UpdateAnimeExtensionInput!) {
        updateAnimeExtension(input: $input) {
            extension {
                ...ANIME_EXTENSION_FIELDS
            }
        }
    }
`;

export const FETCH_ANIME_EXTENSIONS = gql`
    ${ANIME_EXTENSION_FIELDS}

    mutation FETCH_ANIME_EXTENSIONS($input: FetchAnimeExtensionsInput!) {
        fetchAnimeExtensions(input: $input) {
            extensions {
                ...ANIME_EXTENSION_FIELDS
            }
        }
    }
`;

export const INSTALL_EXTERNAL_ANIME_EXTENSION = gql`
    ${ANIME_EXTENSION_FIELDS}

    mutation INSTALL_EXTERNAL_ANIME_EXTENSION($input: InstallExternalAnimeExtensionInput!) {
        installExternalAnimeExtension(input: $input) {
            extension {
                ...ANIME_EXTENSION_FIELDS
            }
        }
    }
`;

export const UPDATE_ANIME = gql`
    ${ANIME_SCREEN_FIELDS}

    mutation UPDATE_ANIME($input: UpdateAnimeInput!) {
        updateAnime(input: $input) {
            anime {
                ...ANIME_SCREEN_FIELDS
            }
        }
    }
`;

export const FETCH_ANIME = gql`
    ${ANIME_SCREEN_FIELDS}

    mutation FETCH_ANIME($input: FetchAnimeInput!) {
        fetchAnime(input: $input) {
            anime {
                ...ANIME_SCREEN_FIELDS
            }
        }
    }
`;

export const UPDATE_EPISODE = gql`
    ${EPISODE_BASE_FIELDS}

    mutation UPDATE_EPISODE($input: UpdateEpisodeInput!) {
        updateEpisode(input: $input) {
            episode {
                ...EPISODE_BASE_FIELDS
            }
        }
    }
`;

export const OPEN_EPISODE_IN_EXTERNAL_PLAYER = gql`
    mutation OPEN_EPISODE_IN_EXTERNAL_PLAYER($input: OpenEpisodeInExternalPlayerInput!) {
        openEpisodeInExternalPlayer(input: $input) {
            success
        }
    }
`;

export const UPDATE_ANIMES = gql`
    mutation UPDATE_ANIMES($input: UpdateAnimesInput!) {
        updateAnimes(input: $input) {
            animes {
                id
                inLibrary
            }
        }
    }
`;
