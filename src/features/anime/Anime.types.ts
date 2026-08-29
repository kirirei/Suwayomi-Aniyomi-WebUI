/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { PopupState } from 'material-ui-popup-state/hooks';
import type { JSX } from 'react';
import type { AnimeType as AnimeTypeGql, AnimeSourceType, Maybe } from '@/lib/graphql/generated/graphql-base.types.ts';
import type { SelectableCollectionReturnType } from '@/base/collection/hooks/useSelectableCollection.ts';
import type { GridLayout } from '@/base/Base.types.ts';
import type { useManageAnimeLibraryState } from '@/features/anime/hooks/useManageAnimeLibraryState.tsx';
import type { UsePressResult } from '@/base/hooks/usePress.ts';

/** Mirrors Manga.types.ts, trimmed to what the anime library screen actually needs. */
export type AnimeIdInfo = Pick<AnimeTypeGql, 'id'>;
export type AnimeTitleInfo = Pick<AnimeTypeGql, 'title'>;
export type AnimeInLibraryInfo = Pick<AnimeTypeGql, 'inLibrary' | 'inLibraryAt'>;
export type AnimeThumbnailInfo = Pick<AnimeTypeGql, 'thumbnailUrl'>;
export type AnimeSourceIdInfo = Pick<AnimeTypeGql, 'sourceId'>;
export type AnimeSourceNameInfo = { source?: Maybe<Pick<AnimeSourceType, 'displayName'>> };
export type AnimeStatusInfo = Pick<AnimeTypeGql, 'status'>;
export type AnimeGenreInfo = Pick<AnimeTypeGql, 'genre'>;
export type AnimeDescriptionInfo = Pick<AnimeTypeGql, 'description'>;
export type AnimeArtistInfo = Pick<AnimeTypeGql, 'artist'>;
export type AnimeAuthorInfo = Pick<AnimeTypeGql, 'author'>;
export type AnimeUnseenInfo = Pick<AnimeTypeGql, 'unseenCount' | 'episodeCount'>;
export type AnimeDownloadInfo = Pick<AnimeTypeGql, 'downloadCount' | 'episodeCount'>;
export type AnimeBookmarkInfo = Pick<AnimeTypeGql, 'bookmarkCount'>;
export type AnimeLastSeenInfo = Pick<AnimeTypeGql, 'lastSeenAt'>;

export type AnimeCardMode = 'default' | 'source';

export type AnimeLocationState = {
    animeTitle: string;
};

/**
 * Mirrors MangaCardBaseProps/MangaCardProps/SpecificMangaCardProps, minus the "migrate"-mode
 * plumbing and a "continue watching" button - there's no anime source-migration feature and no
 * `firstUnseenEpisode` resolver on AnimeType yet, so neither has anything real to back it.
 */
type AnimeCardBaseProps = Pick<AnimeTypeGql, 'id' | 'title' | 'sourceId' | 'inLibrary'> &
    Partial<Pick<AnimeTypeGql, 'downloadCount' | 'unseenCount' | 'episodeCount'>>;

type AnimeCardSpecificProps = AnimeCardBaseProps & AnimeThumbnailInfo;

export interface AnimeCardProps {
    anime: AnimeCardBaseProps;
    gridLayout?: GridLayout;
    inLibraryIndicator?: boolean;
    selected?: boolean | null;
    handleSelection?: SelectableCollectionReturnType<AnimeTypeGql['id']>['handleSelection'];
    mode?: AnimeCardMode;
}

export type SpecificAnimeCardProps = Omit<AnimeCardProps, 'anime'> &
    Pick<ReturnType<typeof useManageAnimeLibraryState>, 'isInLibrary'> & {
        anime: AnimeCardSpecificProps;
        longPressBind: UsePressResult;
        popupState: PopupState;
        animeLinkTo: string;
        animeBadges: JSX.Element;
    };
