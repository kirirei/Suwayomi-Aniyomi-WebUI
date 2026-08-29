/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import { Link } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';

export const AnimeSources = () => {
    const { t } = useLingui();
    useAppTitle(t`Anime Sources`);

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
