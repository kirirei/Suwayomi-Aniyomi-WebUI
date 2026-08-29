/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useCallback, useEffect, useState } from 'react';
import gql from 'graphql-tag';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { Animes } from '@/features/anime/services/Animes.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { Confirmation } from '@/base/AppAwaitableComponent.ts';
import type { AnimeIdInfo, AnimeInLibraryInfo, AnimeTitleInfo } from '@/features/anime/Anime.types.ts';

/**
 * Mirrors useManageMangaLibraryState, without the duplicate-detection or add-to-library
 * category-select dialog - anime has no duplicate-entry checker yet, and categories can still be
 * set afterwards from the anime's own screen.
 */
export const useManageAnimeLibraryState = (
    anime: AnimeIdInfo & AnimeTitleInfo & Partial<AnimeInLibraryInfo>,
    confirmRemoval: boolean = false,
) => {
    const { t } = useLingui();

    const [isInLibrary, setIsInLibrary] = useState(!!anime.inLibrary);

    useEffect(() => {
        setIsInLibrary(!!anime.inLibrary);
    }, [anime.id]);

    const addToLibrary = useCallback(() => {
        requestManager
            .updateAnime(anime.id, { inLibrary: true })
            .response.then(() => makeToast(t`Added anime to library!`, 'success'))
            .then(() => setIsInLibrary(true))
            .catch((e) => {
                makeToast(t`Could not add anime to library!`, 'error', getErrorMessage(e));
            });
    }, [anime.id]);

    const removeFromLibrary = useCallback(async () => {
        if (confirmRemoval) {
            await Confirmation.show(
                {
                    title: t`Are you sure?`,
                    message: t`You are about to remove "${anime.title}" from your library`,
                    actions: {
                        confirm: {
                            title: t`Remove`,
                        },
                    },
                },
                { id: `anime-library-state-remove-${anime.id}` },
            );
        }

        await Animes.removeFromLibrary([anime.id]);
        setIsInLibrary(false);
    }, [anime.id, confirmRemoval]);

    const updateLibraryState = useCallback(() => {
        const update = async () => {
            if (isInLibrary) {
                removeFromLibrary().catch(
                    defaultPromiseErrorHandler('useManageAnimeLibraryState::updateLibraryState::removeFromLibrary'),
                );
                return;
            }

            addToLibrary();
        };

        update().catch(defaultPromiseErrorHandler('useManageAnimeLibraryState::updateLibraryState'));
    }, [isInLibrary, removeFromLibrary, addToLibrary]);

    return {
        updateLibraryState,
        isInLibrary:
            Animes.getFromCache(
                anime.id,
                gql`
                    fragment AnimeInLibraryState on AnimeType {
                        inLibrary
                    }
                `,
                'AnimeInLibraryState',
            )?.inLibrary ?? isInLibrary,
    };
};
