/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import { Link } from 'react-router-dom';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { AnimeExtensionCard } from '@/features/anime/components/AnimeExtensionCard.tsx';

/**
 * Mirrors Extensions.tsx, simplified to match AnimeExtensionType's leaner surface (see its doc
 * comment): a plain list instead of a grouped-by-language virtuoso, no NSFW/language filtering,
 * no external-file install. This is the screen that was missing entirely before - the request
 * layer (useGetAnimeExtensions, updateAnimeExtension) already existed from an earlier phase, but
 * nothing rendered it, so a user who added an anime extension repo had nowhere to actually install
 * from even after AnimeExtensionStores.tsx (repo management) shipped.
 */
export function AnimeExtensions() {
    const { t } = useLingui();

    const { data, loading: isLoading, error, refetch } = requestManager.useGetAnimeExtensions();
    const { data: storesData, loading: areStoresLoading } = requestManager.useGetAnimeExtensionStores();

    const extensions = data?.animeExtensions ?? [];
    const hasStores = !!storesData?.animeExtensionStores.length;

    if (isLoading || areStoresLoading) {
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

    if (!extensions.length && !hasStores) {
        return (
            <Stack sx={{ alignItems: 'center', justifyContent: 'center', rowGap: '10px', paddingTop: '20px' }}>
                <Typography>{t`You have to add an extension repo to be able to install anime extensions`}</Typography>
                <Button
                    component={Link}
                    variant="contained"
                    to={AppRoutes.settings.children.anime.children.extensionStores.path}
                >
                    {t`Add extension repo`}
                </Button>
            </Stack>
        );
    }

    if (!extensions.length) {
        return <EmptyViewAbsoluteCentered message={t`No anime extensions found`} retry={() => refetch()} />;
    }

    return (
        <List sx={{ display: 'flex', flexDirection: 'column', gap: 1, p: 1 }}>
            {extensions.map((extension) => (
                <AnimeExtensionCard key={extension.pkgName} extension={extension} onChanged={() => refetch()} />
            ))}
        </List>
    );
}
