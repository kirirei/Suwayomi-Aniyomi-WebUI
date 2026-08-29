/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import React, { useLayoutEffect } from 'react';
import { useLingui } from '@lingui/react/macro';
import type { IAnimeGridProps } from '@/features/anime/components/AnimeGrid.tsx';
import { AnimeGrid } from '@/features/anime/components/AnimeGrid.tsx';
import { GridLayout } from '@/base/Base.types.ts';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';

interface AnimeLibraryGridProps
    extends
        Required<Pick<IAnimeGridProps, 'isSelectModeActive' | 'selectedAnimeIds' | 'handleSelection' | 'animes'>>,
        Pick<IAnimeGridProps, 'retry' | 'message' | 'messageExtra'> {
    showFilteredOutMessage: boolean;
    isLoading: boolean;
}

const loadMoreNoop = () => undefined;

/** Mirrors LibraryMangaGrid.tsx. */
export const AnimeLibraryGrid: React.FC<AnimeLibraryGridProps> = ({
    showFilteredOutMessage,
    message,
    messageExtra,
    ...gridProps
}) => {
    const { t } = useLingui();

    const {
        settings: { gridLayout },
    } = useMetadataServerSettings();

    useLayoutEffect(() => {
        document.body.style.overflowY = gridLayout === GridLayout.List ? 'auto' : 'scroll';
        return () => {
            document.body.style.overflowY = 'auto';
        };
    }, []);

    return (
        <AnimeGrid
            gridWrapperProps={{ sx: { p: 1 } }}
            {...gridProps}
            hasNextPage={false}
            loadMore={loadMoreNoop}
            message={showFilteredOutMessage ? t`No anime matches this filter` : message}
            messageExtra={showFilteredOutMessage ? undefined : messageExtra}
            gridLayout={gridLayout}
        />
    );
};
