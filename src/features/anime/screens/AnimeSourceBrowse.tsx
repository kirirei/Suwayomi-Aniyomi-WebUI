/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Box from '@mui/material/Box';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { AnimeGrid } from '@/features/anime/components/AnimeGrid.tsx';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';

export const AnimeSourceBrowse = () => {
    const { t } = useLingui();
    const { sourceId } = useParams<{ sourceId: string }>();
    const [page, setPage] = useState(1);

    const { data: sourceData } = requestManager.useGetAnimeSource(sourceId!);
    const source = sourceData?.animeSource;
    useAppTitle(source?.displayName ?? t`Browse`, [source]);

    const { data, loading: isLoading, error, refetch } = requestManager.useGetPopularAnimeList(sourceId!, page);
    const anime = data?.popularAnimeList.animeList ?? [];

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch()}
            />
        );
    }

    return (
        <Box sx={{ p: 1 }}>
            <AnimeGrid
                animes={anime}
                isLoading={isLoading}
                mode="source"
                inLibraryIndicator
                hasNextPage={!!data?.popularAnimeList.hasNextPage}
                loadMore={() => setPage((current) => current + 1)}
                message={t`No anime found`}
            />
        </Box>
    );
};
