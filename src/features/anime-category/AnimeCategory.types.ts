/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { AnimeCategoryMetaType, AnimeCategoryType } from '@/lib/graphql/generated/graphql-base.types.ts';

/** Mirrors Category.types.ts, backed by AnimeCategoryType instead of the manga-only CategoryType. */
export type AnimeCategoryIdInfo = Pick<AnimeCategoryType, 'id'>;
export type AnimeCategoryNameInfo = Pick<AnimeCategoryType, 'name'>;
export type AnimeCategoryDefaultInfo = Pick<AnimeCategoryType, 'default'>;
export type AnimeCategoryMetadataInfo = AnimeCategoryIdInfo & { meta: Pick<AnimeCategoryMetaType, 'key' | 'value'>[] };
