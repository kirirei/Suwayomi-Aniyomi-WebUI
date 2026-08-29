/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import FilterList from '@mui/icons-material/FilterList';
import IconButton from '@mui/material/IconButton';
import { useState } from 'react';
import { useLingui } from '@lingui/react/macro';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { AnimeLibraryOptionsPanel } from '@/features/anime-library/components/AnimeLibraryOptionsPanel.tsx';
import { getAnimeCategoryLibraryOptions } from '@/features/anime-library/services/AnimeCategoryLibraryOptions.ts';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import { makeToast } from '@/base/utils/Toast.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { ReactRouter } from '@/lib/react-router/ReactRouter.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { assertIsDefined } from '@/base/Asserts.ts';
import type { AnimeIdInfo, AnimeStatusInfo } from '@/features/anime/Anime.types.ts';

/** Mirrors LibraryToolbarMenu.tsx. */
export const AnimeLibraryToolbarMenu = ({
    categoryId,
    animes,
}: {
    categoryId: number;
    animes: (AnimeIdInfo & AnimeStatusInfo)[];
}) => {
    const { t } = useLingui();

    const [open, setOpen] = useState(false);
    const options = getAnimeCategoryLibraryOptions(categoryId);

    const isSourceFilterActive = Object.values(options.hasSource).some(
        (sourceFilterStatus) => sourceFilterStatus != null,
    );
    const isStatusFilterActive = Object.values(options.hasStatus).some(
        (statusFilterStatus) => statusFilterStatus != null,
    );
    const active =
        options.hasDownloadedEpisodes != null ||
        options.hasUnseenEpisodes != null ||
        options.hasSeenEpisodes != null ||
        options.hasBookmarkedEpisodes != null ||
        isSourceFilterActive ||
        isStatusFilterActive;

    return (
        <>
            <CustomTooltip title={t`Open random entry`} disabled={!animes.length}>
                <IconButton
                    disabled={!animes.length}
                    onClick={async () => {
                        try {
                            const randomAnime = animes[Math.floor(Math.random() * animes.length)];

                            assertIsDefined(randomAnime);

                            ReactRouter.navigate(AppRoutes.anime.path(randomAnime.id));
                        } catch (e) {
                            makeToast(t`Could not open random entry`, 'error', getErrorMessage(e));
                        }
                    }}
                    color="inherit"
                >
                    <ShuffleIcon />
                </IconButton>
            </CustomTooltip>
            <CustomTooltip title={t`Settings`}>
                <IconButton onClick={() => setOpen(!open)} color={active ? 'warning' : 'inherit'}>
                    <FilterList />
                </IconButton>
            </CustomTooltip>
            <AnimeLibraryOptionsPanel
                categoryId={categoryId}
                animes={animes}
                open={open}
                onClose={() => setOpen(false)}
                active={active}
                isStatusFilterActive={isStatusFilterActive}
                isSourceFilterActive={isSourceFilterActive}
            />
        </>
    );
};
