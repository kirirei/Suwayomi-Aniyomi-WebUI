/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { IAnimeGridProps } from '@/features/anime/components/AnimeGrid.tsx';
import { AnimeGrid } from '@/features/anime/components/AnimeGrid.tsx';

type TAnimeBaseGrid = Omit<IAnimeGridProps['animes'][number], 'downloadCount' | 'unseenCount' | 'episodeCount'>;

/** Mirrors BaseMangaGrid.tsx. */
export function BaseAnimeGrid(props: Omit<IAnimeGridProps, 'animes'> & { animes: TAnimeBaseGrid[] }) {
    const { animes } = props;

    return <AnimeGrid gridWrapperProps={{ sx: { p: 1 } }} {...props} animes={animes as IAnimeGridProps['animes']} />;
}
