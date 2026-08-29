/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import SyncIcon from '@mui/icons-material/Sync';
import PopupState, { bindDialog, bindTrigger } from 'material-ui-popup-state';
import Dialog from '@mui/material/Dialog';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { TrackAnime } from '@/features/tracker/components/TrackAnime.tsx';
import { Tracker } from '@/features/tracker/Tracker.types.ts';
import { Trackers } from '@/features/tracker/services/Trackers.ts';
import { FlexWrapButton } from '@/base/components/buttons/FlexWrapButton.tsx';
import type { GetTrackersBindQuery } from '@/lib/graphql/generated/graphql.ts';
import { GET_TRACKERS_BIND } from '@/lib/graphql/tracker/TrackerQuery.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';

/** Mirrors TrackMangaButton.tsx: only MyAnimeList tracks anime so far. */
export const TrackAnimeButton = ({ anime }: { anime: { id: number; title: string } }) => {
    const { t } = useLingui();
    const navigate = useNavigate();
    const isMobileWidth = MediaQuery.useIsMobileWidth();

    const trackerList = requestManager.useGetTrackerList<GetTrackersBindQuery>(GET_TRACKERS_BIND);
    const malTracker = trackerList.data?.trackers.nodes.find((it) => it.id === Tracker.MYANIMELIST);
    const isLoggedIn = !!malTracker && Trackers.isLoggedIn(malTracker);

    const animeTrackRecordsList = requestManager.useGetAnimeTrackRecords(anime.id);
    const isTracked = !!animeTrackRecordsList.data?.animeTrackRecords.length;

    const handleClick = (openPopup: () => void) => {
        if (trackerList.error) {
            makeToast(t`Could not load track info`, 'error', trackerList.error?.toString());
            return;
        }

        if (!isLoggedIn) {
            navigate(AppRoutes.settings.children.tracking.path);
            return;
        }

        openPopup();
    };

    return (
        <PopupState variant="dialog" popupId="anime-track-modal">
            {(popupState) => (
                <>
                    <FlexWrapButton
                        {...bindTrigger(popupState)}
                        size={isMobileWidth ? 'small' : 'medium'}
                        disabled={trackerList.loading || !!trackerList.error}
                        onClick={() => handleClick(popupState.open)}
                        variant={isTracked ? 'contained' : 'outlined'}
                    >
                        {isTracked ? <CheckIcon /> : <SyncIcon />}
                        {isTracked ? t`Tracked` : t`Tracking`}
                    </FlexWrapButton>
                    {popupState.isOpen && (
                        <Dialog {...bindDialog(popupState)} maxWidth="md" fullWidth scroll="paper">
                            <TrackAnime anime={anime} />
                        </Dialog>
                    )}
                </>
            )}
        </PopupState>
    );
};
