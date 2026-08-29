/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { DocumentNode, Unmasked } from '@apollo/client';
import { t } from '@lingui/core/macro';
import { i18n } from '@/i18n';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import type { AnimeScreenFieldsFragment } from '@/lib/graphql/generated/graphql.ts';
import { ANIME_SCREEN_FIELDS } from '@/lib/graphql/anime/AnimeFragments.ts';
import type { AnimeAction } from '@/features/anime/Anime.constants.ts';
import {
    ANIME_ACTION_TO_CONFIRMATION_REQUIRED,
    ANIME_ACTION_TO_TRANSLATION,
} from '@/features/anime/Anime.constants.ts';
import type {
    AnimeBookmarkInfo,
    AnimeDownloadInfo,
    AnimeIdInfo,
    AnimeUnseenInfo,
} from '@/features/anime/Anime.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { Confirmation } from '@/base/AppAwaitableComponent.ts';
import { assertIsDefined } from '@/base/Asserts.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import type { UpdateAnimeCategoriesPatchInput } from '@/lib/graphql/generated/graphql-base.types.ts';

/** Mirrors Mangas.ts, trimmed to what's actually backed by real mutations - see Anime.constants.ts. */
export class Animes {
    static getIds(animes: AnimeIdInfo[]): number[] {
        return animes.map((anime) => anime.id);
    }

    static getFromCache<T = AnimeScreenFieldsFragment>(
        id: AnimeIdInfo['id'],
        fragment: DocumentNode = ANIME_SCREEN_FIELDS,
        fragmentName: string = 'ANIME_SCREEN_FIELDS',
    ): Unmasked<T> | null {
        return requestManager.graphQLClient.client.cache.readFragment<T>({
            id: requestManager.graphQLClient.client.cache.identify({
                __typename: 'AnimeType',
                id,
            }),
            fragment,
            fragmentName,
        });
    }

    static getThumbnailUrl(anime: { thumbnailUrl?: string | null }): string {
        return requestManager.getValidImgUrlFor(anime.thumbnailUrl ?? '');
    }

    static isNotDownloaded({ downloadCount, episodeCount }: AnimeDownloadInfo): boolean {
        return (episodeCount ?? 0) > 0 && (downloadCount ?? 0) === 0;
    }

    static getNotDownloaded<Anime extends AnimeDownloadInfo>(animes: Anime[]): Anime[] {
        return animes.filter(Animes.isNotDownloaded);
    }

    static isFullyDownloaded({ downloadCount, episodeCount }: AnimeDownloadInfo): boolean {
        return (episodeCount ?? 0) > 0 && downloadCount === episodeCount;
    }

    static getFullyDownloaded<Anime extends AnimeDownloadInfo>(animes: Anime[]): Anime[] {
        return animes.filter(Animes.isFullyDownloaded);
    }

    static isPartiallyDownloaded(anime: AnimeDownloadInfo): boolean {
        return !Animes.isNotDownloaded(anime) && !Animes.isFullyDownloaded(anime) && (anime.episodeCount ?? 0) > 0;
    }

    static isUnseen({ unseenCount, episodeCount }: AnimeUnseenInfo): boolean {
        return (episodeCount ?? 0) > 0 && unseenCount === episodeCount;
    }

    static isFullySeen({ unseenCount, episodeCount }: AnimeUnseenInfo): boolean {
        return (episodeCount ?? 0) > 0 && (unseenCount ?? 0) === 0;
    }

    static isPartiallySeen(anime: AnimeUnseenInfo): boolean {
        return !Animes.isUnseen(anime) && !Animes.isFullySeen(anime) && (anime.episodeCount ?? 0) > 0;
    }

    static isBookmarked({ bookmarkCount }: AnimeBookmarkInfo): boolean {
        return (bookmarkCount ?? 0) > 0;
    }

    static async removeFromLibrary(animeIds: number[], disableConfirmation?: boolean): Promise<void> {
        return Animes.executeAction(
            'remove_from_library',
            animeIds.length,
            () => requestManager.updateAnimes(animeIds, { inLibrary: false }).response,
            disableConfirmation,
        );
    }

    static async changeCategories(
        animeIds: number[],
        patch: UpdateAnimeCategoriesPatchInput,
        disableConfirmation?: boolean,
    ): Promise<void> {
        return Animes.executeAction(
            'change_categories',
            animeIds.length,
            () => requestManager.updateAnimesCategories(animeIds, patch).response,
            disableConfirmation,
        );
    }

    private static async executeAction(
        action: AnimeAction,
        itemCount: number,
        fnToExecute: () => Promise<unknown>,
        disableConfirmation?: boolean,
    ): Promise<void> {
        const { always, bulkAction } = ANIME_ACTION_TO_CONFIRMATION_REQUIRED[action];
        const requiresConfirmation = !disableConfirmation && (always || (bulkAction && itemCount > 1));
        const confirmationMessage = ANIME_ACTION_TO_TRANSLATION[action].confirmation;

        try {
            if (requiresConfirmation) {
                assertIsDefined(confirmationMessage);

                try {
                    await Confirmation.show({
                        title: t`Are you sure?`,
                        /* lingui-extract-ignore */
                        message: i18n.t({ ...confirmationMessage, values: { count: itemCount } }),
                        actions: { confirm: { title: t`Ok` } },
                    });
                } catch (_) {
                    return;
                }
            }

            await fnToExecute();

            makeToast(
                /* lingui-extract-ignore */
                i18n.t({ ...ANIME_ACTION_TO_TRANSLATION[action].success, values: { count: itemCount } }),
                'success',
            );
        } catch (e) {
            makeToast(
                /* lingui-extract-ignore */
                i18n.t({ ...ANIME_ACTION_TO_TRANSLATION[action].error, values: { count: itemCount } }),
                'error',
                getErrorMessage(e),
            );
            throw e;
        }
    }

    static async performAction(
        action: AnimeAction,
        animeIds: number[],
        options: { changeCategoriesPatch?: UpdateAnimeCategoriesPatchInput } = {},
        disableConfirmation?: boolean,
    ): Promise<void> {
        switch (action) {
            case 'remove_from_library':
                return Animes.removeFromLibrary(animeIds, disableConfirmation);
            case 'change_categories':
                assertIsDefined(options.changeCategoriesPatch);
                return Animes.changeCategories(animeIds, options.changeCategoriesPatch, disableConfirmation);
            default:
                throw new Error(`Animes::performAction: unknown action "${action}"`);
        }
    }

    static createLocationState<Anime extends { title: string }>(anime: Anime): { animeTitle: string } {
        return { animeTitle: anime.title };
    }
}
