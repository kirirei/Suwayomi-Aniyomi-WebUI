/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';

/** Mirrors CategoryFragments.ts, trimmed for AnimeCategoryType's plain-list shape (no NodeList). */
export const ANIME_CATEGORY_META_FIELDS = gql`
    fragment ANIME_CATEGORY_META_FIELDS on AnimeCategoryMetaType {
        categoryId
        key
        value
    }
`;

export const ANIME_CATEGORY_BASE_FIELDS = gql`
    fragment ANIME_CATEGORY_BASE_FIELDS on AnimeCategoryType {
        id
        name
        default
        order
    }
`;

export const ANIME_CATEGORY_LIBRARY_FIELDS = gql`
    ${ANIME_CATEGORY_BASE_FIELDS}
    ${ANIME_CATEGORY_META_FIELDS}

    fragment ANIME_CATEGORY_LIBRARY_FIELDS on AnimeCategoryType {
        ...ANIME_CATEGORY_BASE_FIELDS

        meta {
            ...ANIME_CATEGORY_META_FIELDS
        }
        animes {
            id
        }
    }
`;
