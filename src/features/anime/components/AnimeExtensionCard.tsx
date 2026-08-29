/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useState } from 'react';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { ListCardAvatar } from '@/base/components/lists/cards/ListCardAvatar.tsx';
import { ListCardContent } from '@/base/components/lists/cards/ListCardContent.tsx';
import { languageCodeToName } from '@/base/utils/Languages.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import type { GetAnimeExtensionsQuery } from '@/lib/graphql/generated/graphql.ts';

/**
 * Mirrors ExtensionCard, simplified to match AnimeExtensionType's leaner surface: no obsolete/update
 * grouping, no source-store attribution, no external-link "settings" affordance - just install,
 * update, and uninstall, the three actions AnimeMutation.updateAnimeExtension actually supports.
 */
export function AnimeExtensionCard({
    extension,
    onChanged,
}: {
    extension: GetAnimeExtensionsQuery['animeExtensions'][number];
    onChanged: () => void;
}) {
    const { t } = useLingui();
    const { pkgName, name, lang, versionName, iconUrl, isInstalled, hasUpdate, isNsfw } = extension;
    const [isBusy, setIsBusy] = useState(false);

    const performAction = (patch: { install?: boolean; update?: boolean; uninstall?: boolean }) => {
        setIsBusy(true);
        requestManager
            .updateAnimeExtension(pkgName, patch)
            .response.then(() => onChanged())
            .catch((e) => makeToast(t`Failed to update the extension`, 'error', getErrorMessage(e)))
            .finally(() => setIsBusy(false));
    };

    const buttonLabel = () => {
        if (!isInstalled) {
            return t`Install`;
        }
        if (hasUpdate) {
            return t`Update`;
        }
        return t`Uninstall`;
    };

    const handleClick = () => {
        if (!isInstalled) {
            performAction({ install: true });
        } else if (hasUpdate) {
            performAction({ update: true });
        } else {
            performAction({ uninstall: true });
        }
    };

    return (
        <Card>
            <ListCardContent>
                <ListCardAvatar iconUrl={requestManager.getValidImgUrlFor(iconUrl)} alt={name} />
                <Stack sx={{ justifyContent: 'center', flexGrow: 1, flexShrink: 1, wordBreak: 'break-word' }}>
                    <Typography variant="h6" component="h3">
                        {name}
                    </Typography>
                    <Typography variant="caption">
                        {isInstalled ? `${languageCodeToName(lang)} — ` : ''}
                        {versionName}
                        {isNsfw && (
                            <Typography variant="caption" color="error" sx={{ pl: 0.5 }}>
                                18+
                            </Typography>
                        )}
                    </Typography>
                </Stack>
                <Button variant="outlined" sx={{ flexShrink: 0 }} disabled={isBusy} onClick={handleClick}>
                    {buttonLabel()}
                </Button>
            </ListCardContent>
        </Card>
    );
}
