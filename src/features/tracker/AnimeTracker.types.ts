/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type {
    AnimeTrackRecordFieldsFragment,
    AnimeTrackSearchFieldsFragment,
} from '@/lib/graphql/generated/graphql.ts';

/** Mirrors Tracker.types.ts's manga TTrackRecordBind/TTrackerManga, for the anime tracking flow. */
export type TAnimeTrackRecordBind = AnimeTrackRecordFieldsFragment;

export type TAnimeTrackSearch = AnimeTrackSearchFieldsFragment;
