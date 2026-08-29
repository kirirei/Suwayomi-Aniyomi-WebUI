/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import {
    ANIME_CATEGORY_LIBRARY_FIELDS,
    ANIME_CATEGORY_BASE_FIELDS,
} from '@/lib/graphql/anime/AnimeCategoryFragments.ts';
import { ANIME_LIBRARY_FIELDS } from '@/lib/graphql/anime/AnimeFragments.ts';

export const GET_ANIME_CATEGORIES_BASE = gql`
    ${ANIME_CATEGORY_BASE_FIELDS}

    query GET_ANIME_CATEGORIES_BASE {
        animeCategories {
            ...ANIME_CATEGORY_BASE_FIELDS
        }
    }
`;

export const GET_ANIME_CATEGORIES_LIBRARY = gql`
    ${ANIME_CATEGORY_LIBRARY_FIELDS}

    query GET_ANIME_CATEGORIES_LIBRARY {
        animeCategories {
            ...ANIME_CATEGORY_LIBRARY_FIELDS
        }
    }
`;

export const GET_CATEGORY_ANIMES = gql`
    ${ANIME_LIBRARY_FIELDS}

    query GET_CATEGORY_ANIMES($id: Int!) {
        animeCategory(id: $id) {
            id
            animes {
                ...ANIME_LIBRARY_FIELDS
            }
        }
    }
`;

export const GET_ANIME_CATEGORIES_OF_ANIME = gql`
    ${ANIME_CATEGORY_BASE_FIELDS}

    query GET_ANIME_CATEGORIES_OF_ANIME($id: Int!) {
        anime(id: $id) {
            id
            categories {
                ...ANIME_CATEGORY_BASE_FIELDS
            }
        }
    }
`;
