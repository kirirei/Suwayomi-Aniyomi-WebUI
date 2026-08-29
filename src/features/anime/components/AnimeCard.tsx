/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { Link } from 'react-router-dom';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import type { AnimeScreenFieldsFragment } from '@/lib/graphql/generated/graphql.ts';

/**
 * Mirrors MangaGridCard, simplified: no selection mode, download/unread badges, or persisted
 * scroll-position virtuoso wiring yet - see AnimeExtensionType's doc comment for why the anime
 * section is starting leaner than the manga one it mirrors.
 */
export const AnimeCard = ({ anime }: { anime: AnimeScreenFieldsFragment }) => (
    <Card>
        <CardActionArea component={Link} to={AppRoutes.anime.path(anime.id)}>
            <Box
                sx={{
                    aspectRatio: '225 / 320',
                    backgroundColor: 'action.hover',
                    backgroundImage: anime.thumbnailUrl ? `url(${anime.thumbnailUrl})` : undefined,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                }}
            />
            <Typography
                variant="body2"
                sx={{
                    p: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                }}
            >
                {anime.title}
            </Typography>
        </CardActionArea>
    </Card>
);
