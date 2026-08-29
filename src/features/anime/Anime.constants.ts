/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { msg } from '@lingui/core/macro';
import type { MessageDescriptor } from '@lingui/core';

/**
 * Mirrors MANGA_ACTION_TO_CONFIRMATION_REQUIRED/MANGA_ACTION_TO_TRANSLATION, trimmed to the two
 * anime-level bulk actions actually backed by real mutations today (updateAnime,
 * updateAnimesCategories) - there's no bulk episode download/delete/mark-seen mutation yet, and
 * no anime migration feature, so those actions aren't offered here.
 */
export type AnimeAction = 'remove_from_library' | 'change_categories';

export const ANIME_COVER_ASPECT_RATIO = '1 / 1.5';

export const ANIME_ACTION_TO_CONFIRMATION_REQUIRED: Record<
    AnimeAction,
    { always: boolean; bulkAction: boolean; bulkActionCountForce?: number }
> = {
    remove_from_library: { always: true, bulkAction: true },
    change_categories: { always: false, bulkAction: false },
};

export const ANIME_ACTION_TO_TRANSLATION: {
    [key in AnimeAction]: {
        action: {
            single: MessageDescriptor;
            selected: MessageDescriptor;
        };
        confirmation?: MessageDescriptor;
        success: MessageDescriptor;
        error: MessageDescriptor;
    };
} = {
    remove_from_library: {
        action: {
            single: msg`Remove from the library`,
            selected: msg`Remove selected from the library`,
        },
        confirmation: msg`{count, plural, one {You are about to remove one entry from your library} other {You are about to remove # entries from your library}}`,
        success: msg`{count, plural, one {Removed anime from the library} other {Removed # anime from the library}}`,
        error: msg`{count, plural, one {Could not remove anime from the library} other {Could not remove anime from the library}}`,
    },
    change_categories: {
        action: {
            single: msg`Set categories`,
            selected: msg`Set categories`,
        },
        success: msg`{count, plural, one {Updated categories} other {Updated categories for # anime}}`,
        error: msg`{count, plural, one {Could not update categories} other {Could not update categories}}`,
    },
};
