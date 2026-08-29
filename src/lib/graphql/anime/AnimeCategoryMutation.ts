/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { ANIME_CATEGORY_BASE_FIELDS, ANIME_CATEGORY_META_FIELDS } from '@/lib/graphql/anime/AnimeCategoryFragments.ts';

/** Mirrors CategoryMutation.ts, trimmed to what AnimeMutation.kt actually exposes. */
export const CREATE_ANIME_CATEGORY = gql`
    ${ANIME_CATEGORY_BASE_FIELDS}

    mutation CREATE_ANIME_CATEGORY($input: CreateAnimeCategoryInput!) {
        createAnimeCategory(input: $input) {
            category {
                ...ANIME_CATEGORY_BASE_FIELDS
            }
        }
    }
`;

export const DELETE_ANIME_CATEGORY = gql`
    mutation DELETE_ANIME_CATEGORY($input: DeleteAnimeCategoryInput!) {
        deleteAnimeCategory(input: $input) {
            category {
                id
            }
        }
    }
`;

export const UPDATE_ANIME_CATEGORY = gql`
    ${ANIME_CATEGORY_BASE_FIELDS}

    mutation UPDATE_ANIME_CATEGORY($input: UpdateAnimeCategoryInput!) {
        updateAnimeCategory(input: $input) {
            category {
                ...ANIME_CATEGORY_BASE_FIELDS
                includeInUpdate
                includeInDownload
            }
        }
    }
`;

export const UPDATE_ANIME_CATEGORY_ORDER = gql`
    ${ANIME_CATEGORY_BASE_FIELDS}

    mutation UPDATE_ANIME_CATEGORY_ORDER($input: UpdateAnimeCategoryOrderInput!) {
        updateAnimeCategoryOrder(input: $input) {
            categories {
                ...ANIME_CATEGORY_BASE_FIELDS
            }
        }
    }
`;

export const UPDATE_ANIME_CATEGORIES = gql`
    mutation UPDATE_ANIME_CATEGORIES($input: UpdateAnimeCategoriesInput!) {
        updateAnimeCategories(input: $input) {
            anime {
                id
                categories {
                    id
                }
            }
        }
    }
`;

export const UPDATE_ANIMES_CATEGORIES = gql`
    mutation UPDATE_ANIMES_CATEGORIES($input: UpdateAnimesCategoriesInput!) {
        updateAnimesCategories(input: $input) {
            animes {
                id
                categories {
                    id
                }
            }
        }
    }
`;

export const SET_ANIME_CATEGORY_METAS = gql`
    ${ANIME_CATEGORY_META_FIELDS}

    mutation SET_ANIME_CATEGORY_METAS($input: SetAnimeCategoryMetasInput!) {
        setAnimeCategoryMetas(input: $input) {
            metas {
                ...ANIME_CATEGORY_META_FIELDS
            }
        }
    }
`;

export const DELETE_ANIME_CATEGORY_METAS = gql`
    ${ANIME_CATEGORY_META_FIELDS}

    mutation DELETE_ANIME_CATEGORY_METAS($input: DeleteAnimeCategoryMetasInput!) {
        deleteAnimeCategoryMetas(input: $input) {
            metas {
                ...ANIME_CATEGORY_META_FIELDS
            }
        }
    }
`;

/**
 * Mirrors UPDATE_CATEGORY_METADATA, minus the "migrate" leg - there's no legacy anime category
 * metadata to migrate since this store is new.
 */
export const UPDATE_ANIME_CATEGORY_METADATA = gql`
    ${ANIME_CATEGORY_META_FIELDS}

    mutation UPDATE_ANIME_CATEGORY_METADATA(
        $preUpdateDeleteInput: DeleteAnimeCategoryMetasInput!
        $hasPreUpdateDeletions: Boolean!
        $updateInput: SetAnimeCategoryMetasInput!
        $hasUpdates: Boolean!
        $postUpdateDeleteInput: DeleteAnimeCategoryMetasInput!
        $hasPostUpdateDeletions: Boolean!
    ) {
        preUpdateDeletedMeta: deleteAnimeCategoryMetas(input: $preUpdateDeleteInput)
            @include(if: $hasPreUpdateDeletions) {
            metas {
                ...ANIME_CATEGORY_META_FIELDS
            }
        }
        updatedMeta: setAnimeCategoryMetas(input: $updateInput) @include(if: $hasUpdates) {
            metas {
                ...ANIME_CATEGORY_META_FIELDS
            }
        }
        postUpdateDeletedMeta: deleteAnimeCategoryMetas(input: $postUpdateDeleteInput)
            @include(if: $hasPostUpdateDeletions) {
            metas {
                ...ANIME_CATEGORY_META_FIELDS
            }
        }
    }
`;
