/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import DialogContent from '@mui/material/DialogContent';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { Trackers } from '@/features/tracker/services/Trackers.ts';
import { TrackerUntrackedCard } from '@/features/tracker/components/cards/TrackerUntrackedCard.tsx';
import { TrackerActiveAnimeCard } from '@/features/tracker/components/cards/TrackerActiveAnimeCard.tsx';
import { TrackerAnimeSearch } from '@/features/tracker/components/TrackerAnimeSearch.tsx';
import { makeToast } from '@/base/utils/Toast.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import type { GetTrackersBindQuery } from '@/lib/graphql/generated/graphql.ts';
import { GET_TRACKERS_BIND } from '@/lib/graphql/tracker/TrackerQuery.ts';
import { Tracker } from '@/features/tracker/Tracker.types.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { EmptyView } from '@/base/components/feedback/EmptyView.tsx';

/**
 * Mirrors TrackManga.tsx, simplified: only MyAnimeList supports anime tracking so far, so this
 * drives a single tracker's state machine instead of mapping over every logged-in tracker.
 */
export const TrackAnime = ({ anime }: { anime: { id: number; title: string } }) => {
    const { t } = useLingui();
    const navigate = useNavigate();

    const [isSearchActive, setIsSearchActive] = useState(false);

    const trackerList = requestManager.useGetTrackerList<GetTrackersBindQuery>(GET_TRACKERS_BIND);
    const malTracker = trackerList.data?.trackers.nodes.find((it) => it.id === Tracker.MYANIMELIST);

    const animeTrackRecordsList = requestManager.useGetAnimeTrackRecords(anime.id);
    const trackRecord = animeTrackRecordsList.data?.animeTrackRecords.find(
        (it) => it.trackerId === Tracker.MYANIMELIST,
    );

    const isLoggedIn = !!malTracker && Trackers.isLoggedIn(malTracker);

    const loading = trackerList.loading || animeTrackRecordsList.loading;
    const error = trackerList.error ?? animeTrackRecordsList.error;

    useEffect(() => {
        if (!loading && !error && !trackRecord && !isLoggedIn) {
            navigate(AppRoutes.settings.children.tracking.path);
        }
    }, [loading]);

    const fetchedLatestTrackDataRef = useRef(false);
    useEffect(() => {
        if (!trackRecord || fetchedLatestTrackDataRef.current) {
            return;
        }

        fetchedLatestTrackDataRef.current = true;
        requestManager
            .fetchAnimeTrackBind(trackRecord.id)
            .response.catch((e) =>
                makeToast(t`Could not load latest track info from tracker`, 'error', getErrorMessage(e)),
            );
    }, [trackRecord]);

    if (error) {
        return (
            <EmptyView
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => {
                    if (trackerList.error) {
                        trackerList.refetch().catch(defaultPromiseErrorHandler('TrackAnime::refetch: trackerList'));
                    }

                    if (animeTrackRecordsList.error) {
                        animeTrackRecordsList
                            .refetch()
                            .catch(defaultPromiseErrorHandler('TrackAnime::refetch: animeTrackRecordsList'));
                    }
                }}
            />
        );
    }

    if (loading || !malTracker) {
        return <LoadingPlaceholder />;
    }

    if (!isLoggedIn && !trackRecord) {
        return null;
    }

    if (isSearchActive) {
        return (
            <TrackerAnimeSearch
                anime={anime}
                tracker={malTracker}
                trackedTitle={trackRecord?.title}
                closeSearchMode={() => setIsSearchActive(false)}
            />
        );
    }

    return (
        <DialogContent
            sx={{
                padding: 0,
                '.MuiPaper-root .MuiCardContent-root': { paddingBottom: '0' },
            }}
        >
            {trackRecord ? (
                <TrackerActiveAnimeCard
                    trackRecord={trackRecord}
                    tracker={malTracker}
                    onClick={() => setIsSearchActive(true)}
                />
            ) : (
                <TrackerUntrackedCard tracker={malTracker} onClick={() => setIsSearchActive(true)} />
            )}
        </DialogContent>
    );
};
