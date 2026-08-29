/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Tab from '@mui/material/Tab';
import { Link } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { TabPanel } from '@/base/components/tabs/TabPanel.tsx';
import { TabsWrapper } from '@/base/components/tabs/TabsWrapper.tsx';
import { TabsMenu } from '@/base/components/tabs/TabsMenu.tsx';
import { AnimeExtensions } from '@/features/anime/components/AnimeExtensions.tsx';

enum AnimeSourcesTab {
    SOURCES = 'sources',
    EXTENSIONS = 'extensions',
}

const AnimeSourcesList = () => {
    const { t } = useLingui();
    const { data, loading: isLoading, error, refetch } = requestManager.useGetAnimeSources();
    const sources = data?.animeSources ?? [];

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

    if (sources.length === 0) {
        return <EmptyViewAbsoluteCentered message={t`No anime sources found. Install some anime extensions first.`} />;
    }

    return (
        <List>
            {sources.map((source) => (
                <ListItemButton
                    key={source.id}
                    component={Link}
                    to={AppRoutes.animeSources.children.browse.path(source.id)}
                >
                    <ListItemAvatar>
                        <Avatar src={requestManager.getValidImgUrlFor(source.iconUrl)} variant="rounded" />
                    </ListItemAvatar>
                    <ListItemText primary={source.displayName} secondary={source.lang.toUpperCase()} />
                </ListItemButton>
            ))}
        </List>
    );
};

export const AnimeSources = () => {
    const { t } = useLingui();
    useAppTitle(t`Anime Sources`);

    const [tab, setTab] = useState<AnimeSourcesTab>(AnimeSourcesTab.SOURCES);

    return (
        <TabsWrapper>
            <TabsMenu variant="fullWidth" value={tab} onChange={(_, newTab) => setTab(newTab)}>
                <Tab value={AnimeSourcesTab.SOURCES} sx={{ textTransform: 'none' }} label={t`Source`} />
                <Tab value={AnimeSourcesTab.EXTENSIONS} sx={{ textTransform: 'none' }} label={t`Extension`} />
            </TabsMenu>
            <TabPanel index={AnimeSourcesTab.SOURCES} currentIndex={tab}>
                <AnimeSourcesList />
            </TabPanel>
            <TabPanel index={AnimeSourcesTab.EXTENSIONS} currentIndex={tab}>
                <AnimeExtensions />
            </TabPanel>
        </TabsWrapper>
    );
};
