/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useState } from 'react';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import type { InstalledStates } from '@/features/extension/Extensions.types.ts';
import { ExtensionAction, ExtensionState, InstalledState } from '@/features/extension/Extensions.types.ts';
import {
    EXTENSION_ACTION_TO_FAILURE_TRANSLATION_MAP,
    EXTENSION_ACTION_TO_NEXT_ACTION_MAP,
    EXTENSION_ACTION_TO_STATE_MAP,
    INSTALLED_STATE_TO_TRANSLATION_MAP,
} from '@/features/extension/Extensions.constants.ts';
import { ListCardAvatar } from '@/base/components/lists/cards/ListCardAvatar.tsx';
import { ListCardContent } from '@/base/components/lists/cards/ListCardContent.tsx';
import { languageCodeToName } from '@/base/utils/Languages.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { i18n } from '@/i18n';
import type { GetAnimeExtensionsQuery } from '@/lib/graphql/generated/graphql.ts';

const getInstalledState = (isInstalled: boolean, isObsolete: boolean, hasUpdate: boolean): InstalledStates => {
    if (isObsolete) {
        return InstalledState.OBSOLETE;
    }
    if (hasUpdate) {
        return InstalledState.UPDATE;
    }
    return isInstalled ? InstalledState.UNINSTALL : InstalledState.INSTALL;
};

const updateAnimeExtensionAction = async (pkgName: string, action: ExtensionAction): Promise<void> => {
    try {
        switch (action) {
            case ExtensionAction.INSTALL:
                await requestManager.updateAnimeExtension(pkgName, { install: true }).response;
                break;
            case ExtensionAction.UNINSTALL:
                await requestManager.updateAnimeExtension(pkgName, { uninstall: true }).response;
                break;
            case ExtensionAction.UPDATE:
                await requestManager.updateAnimeExtension(pkgName, { update: true }).response;
                break;
            default:
                throw new Error(`Unexpected ExtensionAction "${action}"`);
        }
    } catch (e) {
        makeToast(
            /* lingui-extract-ignore */
            i18n.t({ ...EXTENSION_ACTION_TO_FAILURE_TRANSLATION_MAP[action], values: { count: 1 } }),
            'error',
            getErrorMessage(e),
        );
        throw e;
    }
};

/**
 * Re-ported from the real ExtensionCard.tsx, reusing its generic (not manga-specific)
 * ExtensionAction/ExtensionState state machine. Still leaner than the manga card: no
 * extension-info screen link (there's no anime equivalent of ExtensionInfo.tsx yet) and no
 * source-store attribution line, since AnimeExtensionType doesn't carry an extensionStore back-
 * reference the way ExtensionType does.
 */
export function AnimeExtensionCard({
    extension,
    onChanged,
}: {
    extension: GetAnimeExtensionsQuery['animeExtensions'][number];
    onChanged: () => void;
}) {
    const { t } = useLingui();
    const { pkgName, name, lang, versionName, iconUrl, isInstalled, hasUpdate, isObsolete, isNsfw } = extension;

    const [installedState, setInstalledState] = useState<InstalledStates>(
        getInstalledState(isInstalled, isObsolete, hasUpdate),
    );

    useEffect(() => {
        setInstalledState(getInstalledState(isInstalled, isObsolete, hasUpdate));
    }, [isInstalled, isObsolete, hasUpdate]);

    const requestExtensionAction = async (action: ExtensionAction): Promise<void> => {
        const nextAction = EXTENSION_ACTION_TO_NEXT_ACTION_MAP[action];
        const state = EXTENSION_ACTION_TO_STATE_MAP[action];

        try {
            setInstalledState(state);

            await updateAnimeExtensionAction(pkgName, action);

            setInstalledState(nextAction);

            onChanged();
        } catch (_) {
            setInstalledState(getInstalledState(isInstalled, isObsolete, hasUpdate));
        }
    };

    const handleButtonClick = () => {
        switch (installedState) {
            case ExtensionAction.INSTALL:
            case ExtensionAction.UPDATE:
            case ExtensionAction.UNINSTALL:
                requestExtensionAction(installedState).catch(
                    defaultPromiseErrorHandler(`AnimeExtensionCard:handleButtonClick(${installedState})`),
                );
                break;
            case ExtensionState.OBSOLETE:
                requestExtensionAction(ExtensionAction.UNINSTALL).catch(
                    defaultPromiseErrorHandler(`AnimeExtensionCard:handleButtonClick(${installedState})`),
                );
                break;
            default:
                break;
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
                        {isObsolete && (
                            <Typography variant="caption" color="warning" sx={{ pl: 0.5, textTransform: 'uppercase' }}>
                                — {t`Obsolete`}
                            </Typography>
                        )}
                        {isNsfw && (
                            <Typography variant="caption" color="error" sx={{ pl: 0.5 }}>
                                18+
                            </Typography>
                        )}
                    </Typography>
                </Stack>
                <Button variant="outlined" sx={{ flexShrink: 0 }} onClick={handleButtonClick}>
                    {t(INSTALLED_STATE_TO_TRANSLATION_MAP[installedState])}
                </Button>
            </ListCardContent>
        </Card>
    );
}
