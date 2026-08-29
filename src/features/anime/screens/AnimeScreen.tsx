/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Checkbox from '@mui/material/Checkbox';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { useAppTitleAndAction } from '@/features/navigation-bar/hooks/useAppTitleAndAction.ts';

export const AnimeScreen = () => {
    const { t } = useLingui();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const autofetchedRef = useRef(false);

    const { data, loading: isLoading, error, refetch } = requestManager.useGetAnime(id!);
    const anime = data?.anime;

    const { data: episodesData, refetch: refetchEpisodes } = requestManager.useGetAnimeEpisodes(id!, {
        skip: !anime,
    });
    const episodes = episodesData?.episodes ?? [];

    useEffect(() => {
        if (anime == null) {
            return;
        }
        if (!autofetchedRef.current && !anime.initialized) {
            autofetchedRef.current = true;
            requestManager
                .fetchAnime(id!)
                .response.then(() => {
                    refetch();
                    refetchEpisodes();
                })
                .catch(defaultPromiseErrorHandler('AnimeScreen::autofetch'));
        }
    }, [anime]);

    useAppTitleAndAction(
        anime?.title ?? t`Anime`,
        anime && (
            <>
                <IconButton
                    onClick={() =>
                        requestManager
                            .updateAnime(id!, { inLibrary: !anime.inLibrary })
                            .response.then(() => refetch())
                            .catch(defaultPromiseErrorHandler('AnimeScreen::updateAnime'))
                    }
                >
                    {anime.inLibrary ? <BookmarkIcon /> : <BookmarkBorderIcon />}
                </IconButton>
                <IconButton
                    onClick={() =>
                        requestManager
                            .fetchAnime(id!)
                            .response.then(() => {
                                refetch();
                                refetchEpisodes();
                            })
                            .catch(defaultPromiseErrorHandler('AnimeScreen::fetchAnime'))
                    }
                >
                    <RefreshIcon />
                </IconButton>
            </>
        ),
        [t, anime, id],
    );

    if (error && !anime) {
        return <EmptyViewAbsoluteCentered message={t`Could not load anime`} messageExtra={getErrorMessage(error)} />;
    }

    if (isLoading || !anime) {
        return <LoadingPlaceholder />;
    }

    return (
        <Box sx={{ display: { md: 'flex' }, overflow: 'hidden' }}>
            <Stack sx={{ p: 2, gap: 1, minWidth: { md: 300 } }}>
                <Box
                    sx={{
                        aspectRatio: '225 / 320',
                        maxWidth: 250,
                        backgroundColor: 'action.hover',
                        backgroundImage: anime.thumbnailUrl ? `url(${anime.thumbnailUrl})` : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        borderRadius: 1,
                    }}
                />
                <Typography variant="h5">{anime.title}</Typography>
                {anime.author && <Typography variant="body2">{anime.author}</Typography>}
                <Typography variant="body2" color="text.secondary">
                    {anime.description}
                </Typography>
            </Stack>
            <List sx={{ flex: 1, overflow: 'auto' }}>
                {episodes.map((episode) => (
                    <ListItemButton
                        key={episode.id}
                        onClick={() => {
                            if (!episode.seen) {
                                requestManager
                                    .updateEpisode(episode.id, { seen: true })
                                    .response.then(() => refetchEpisodes())
                                    .catch(defaultPromiseErrorHandler('AnimeScreen::updateEpisode'));
                            }
                            navigate(AppRoutes.anime.children.player.path(id!, episode.id));
                        }}
                    >
                        <ListItemIcon>
                            <Checkbox
                                edge="start"
                                checked={episode.seen}
                                tabIndex={-1}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    requestManager
                                        .updateEpisode(episode.id, { seen: !episode.seen })
                                        .response.then(() => refetchEpisodes())
                                        .catch(defaultPromiseErrorHandler('AnimeScreen::updateEpisode'));
                                }}
                            />
                        </ListItemIcon>
                        <ListItemText
                            primary={episode.name}
                            secondary={episode.downloaded ? t`Downloaded` : undefined}
                            slotProps={{ primary: { sx: { fontWeight: episode.seen ? 400 : 700 } } }}
                        />
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );
};
