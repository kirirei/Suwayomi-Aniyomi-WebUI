/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';

/** Mirrors ExtensionStoreFragments.ts's EXTENSION_STORE_FIELDS, without the extensions-count relation (no anime-side dataloader for it yet). */
export const ANIME_EXTENSION_STORE_FIELDS = gql`
    fragment ANIME_EXTENSION_STORE_FIELDS on AnimeExtensionStoreType {
        indexUrl
        name
        badgeLabel
        signingKey
        contactWebsite
        contactDiscord
        isLegacy
        extensionListUrl
    }
`;
