/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { AnimeCard } from '@/features/anime/components/AnimeCard.tsx';
import type { AnimeScreenFieldsFragment } from '@/lib/graphql/generated/graphql.ts';

export const AnimeGrid = ({ anime }: { anime: AnimeScreenFieldsFragment[] }) => (
    <Box
        sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 1,
        }}
    >
        {anime.map((entry) => (
            <AnimeCard key={entry.id} anime={entry} />
        ))}
    </Box>
);
