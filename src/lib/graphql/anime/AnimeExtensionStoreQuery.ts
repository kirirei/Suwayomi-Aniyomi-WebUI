/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import gql from 'graphql-tag';
import { ANIME_EXTENSION_STORE_FIELDS } from '@/lib/graphql/anime/AnimeExtensionStoreFragments.ts';

export const GET_ANIME_EXTENSION_STORES = gql`
    ${ANIME_EXTENSION_STORE_FIELDS}

    query GET_ANIME_EXTENSION_STORES {
        animeExtensionStores {
            ...ANIME_EXTENSION_STORE_FIELDS
        }
    }
`;
