/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import PopupState, { bindMenu } from 'material-ui-popup-state';
import { memo, useCallback, useMemo } from 'react';
import type { SingleModeProps } from '@/features/anime/components/AnimeActionMenuItems.tsx';
import { AnimeActionMenuItems } from '@/features/anime/components/AnimeActionMenuItems.tsx';
import { Menu } from '@/base/components/menu/Menu.tsx';
import { useManageAnimeLibraryState } from '@/features/anime/hooks/useManageAnimeLibraryState.tsx';
import { AnimeGridCard } from '@/features/anime/components/cards/AnimeGridCard.tsx';
import { AnimeListCard } from '@/features/anime/components/cards/AnimeListCard.tsx';
import type { AnimeCardMode, AnimeCardProps } from '@/features/anime/Anime.types.ts';
import { AnimeBadges } from '@/features/anime/components/AnimeBadges.tsx';
import { GridLayout } from '@/base/Base.types.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';
import { usePress } from '@/base/hooks/usePress.ts';

const getAnimeLinkTo = (mode: AnimeCardMode, animeId: number): string => {
    switch (mode) {
        case 'default':
        case 'source':
            return AppRoutes.anime.path(animeId);
        default:
            throw new Error(`getAnimeLinkTo: unexpected AnimeCardMode "${mode}"`);
    }
};

/** Mirrors MangaCard.tsx, minus the migrate-mode and in-menu track-dialog plumbing - see Anime.types.ts. */
export const AnimeCard = memo((props: AnimeCardProps) => {
    const { anime, gridLayout, inLibraryIndicator, selected, handleSelection, mode = 'default' } = props;
    const { id, downloadCount, unseenCount } = anime;

    const { updateLibraryState, isInLibrary } = useManageAnimeLibraryState(anime, mode === 'source');

    const animeLinkTo = getAnimeLinkTo(mode, anime.id);

    const handleClick = useCallback(
        (event: React.MouseEvent | React.TouchEvent, openMenu?: () => void) => {
            const isDefaultMode = mode === 'default';
            const isSourceMode = mode === 'source';
            const isSelectionMode = selected !== null;
            const isLongPress = !!openMenu;

            const shouldHandleClick = isSelectionMode || ((isDefaultMode || isSourceMode) && isLongPress);
            if (!shouldHandleClick) {
                return;
            }

            event.preventDefault();

            if (isSourceMode) {
                updateLibraryState();
                return;
            }

            if (isSelectionMode) {
                handleSelection?.(id, !selected, { selectRange: event.shiftKey });
                return;
            }

            if (isDefaultMode) {
                openMenu?.();
            }
        },
        [mode, selected, updateLibraryState, handleSelection],
    );

    const longPressBind = usePress({
        onLongPress: useCallback(
            (e: any, { context }: any) => {
                // oxlint-disable-next-line no-param-reassign
                e.shiftKey = true;
                handleClick(e, context as () => void);
            },
            [handleClick],
        ),
        onPress: handleClick,
    });

    const AnimeCardComponent = useMemo(
        () => (gridLayout === GridLayout.List ? AnimeListCard : AnimeGridCard),
        [gridLayout],
    );

    return (
        <PopupState variant="popover" popupId="anime-card-action-menu">
            {(popupState) => (
                <>
                    <AnimeCardComponent
                        {...props}
                        longPressBind={longPressBind}
                        popupState={popupState}
                        animeLinkTo={animeLinkTo}
                        isInLibrary={isInLibrary}
                        inLibraryIndicator={inLibraryIndicator}
                        animeBadges={
                            <AnimeBadges
                                inLibraryIndicator={inLibraryIndicator}
                                isInLibrary={isInLibrary}
                                unseen={unseenCount}
                                downloadCount={downloadCount}
                                updateLibraryState={updateLibraryState}
                                mode={mode}
                            />
                        }
                    />
                    {!!handleSelection && popupState.isOpen && (
                        <Menu {...bindMenu(popupState)}>
                            {(onClose, setHideMenu) => (
                                <AnimeActionMenuItems
                                    anime={anime as SingleModeProps['anime']}
                                    handleSelection={handleSelection}
                                    onClose={onClose}
                                    setHideMenu={setHideMenu}
                                />
                            )}
                        </Menu>
                    )}
                </>
            )}
        </PopupState>
    );
});
