/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { useCallback, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';

/**
 * A native <video> with browser controls, pointed at the remux/byte-range-capable streaming
 * endpoint (AnimeAPI.kt). Mirrors the reader's role, not its implementation - a custom
 * overlay/tap-zones/hotkeys layer (ReaderOverlay's equivalent) is a reasonable follow-up once
 * this vertical slice (server streaming -> WebUI -> real playback) is proven end-to-end.
 */
export const Player = () => {
    const { t } = useLingui();
    const { episodeId } = useParams<{ id: string; episodeId: string }>();
    const videoRef = useRef<HTMLVideoElement>(null);

    const { data, loading: isLoading, error } = requestManager.useGetEpisode(episodeId!);
    const episode = data?.episode;

    useAppTitle(episode?.name ?? t`Player`, [episode]);

    const saveProgress = useCallback(() => {
        const video = videoRef.current;
        if (!video || !episodeId || !Number.isFinite(video.duration) || video.duration <= 0) {
            return;
        }
        requestManager.updateEpisode(episodeId, {
            lastSecondSeen: Math.floor(video.currentTime).toString(),
            totalSeconds: Math.floor(video.duration).toString(),
        });
    }, [episodeId]);

    useEffect(() => {
        const interval = setInterval(saveProgress, 15_000);
        return () => {
            clearInterval(interval);
            saveProgress();
        };
    }, [saveProgress]);

    if (error) {
        return <EmptyViewAbsoluteCentered message={t`Could not load episode`} messageExtra={getErrorMessage(error)} />;
    }

    if (isLoading || !episode) {
        return <LoadingPlaceholder />;
    }

    return (
        <Box sx={{ height: '100%', width: '100%', backgroundColor: 'black', display: 'flex' }}>
            <video
                ref={videoRef}
                src={requestManager.getEpisodeStreamUrl(episode.id)}
                controls
                autoPlay
                onPause={saveProgress}
                onSeeked={saveProgress}
                style={{ width: '100%', height: '100%' }}
                {...(episode.lastSecondSeen !== '0' && {
                    onLoadedMetadata: () => {
                        if (videoRef.current) {
                            videoRef.current.currentTime = Number(episode.lastSecondSeen);
                        }
                    },
                })}
            >
                <track kind="captions" />
            </video>
        </Box>
    );
};
