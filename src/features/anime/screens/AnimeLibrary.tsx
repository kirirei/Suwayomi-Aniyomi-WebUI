/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { AnimeGrid } from '@/features/anime/components/AnimeGrid.tsx';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';

export const AnimeLibrary = () => {
    const { t } = useLingui();
    useAppTitle(t`Anime Library`);

    const { data, loading: isLoading, error, refetch } = requestManager.useGetAnimeLibrary();
    const anime = data?.animeLibrary ?? [];

    if (isLoading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch()}
            />
        );
    }

    if (anime.length === 0) {
        return <EmptyViewAbsoluteCentered message={t`Your anime library is empty`} />;
    }

    return (
        <Box sx={{ p: 1 }}>
            <AnimeGrid anime={anime} />
        </Box>
    );
};
