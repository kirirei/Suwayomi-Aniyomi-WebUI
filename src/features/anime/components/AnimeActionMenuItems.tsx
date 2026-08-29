/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import CheckBoxOutlineBlank from '@mui/icons-material/CheckBoxOutlineBlank';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Label from '@mui/icons-material/Label';
import { AwaitableComponent } from 'awaitable-component';
import { useLingui } from '@lingui/react/macro';
import { Animes } from '@/features/anime/services/Animes.ts';
import type { SelectableCollectionReturnType } from '@/base/collection/hooks/useSelectableCollection.ts';
import { MenuItem } from '@/base/components/menu/MenuItem.tsx';
import { createGetMenuItemTitle } from '@/base/components/menu/Menu.utils.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import type { AnimeIdInfo, AnimeTitleInfo } from '@/features/anime/Anime.types.ts';
import type { AnimeAction } from '@/features/anime/Anime.constants.ts';
import { ANIME_ACTION_TO_TRANSLATION } from '@/features/anime/Anime.constants.ts';
import { AnimeCategorySelect } from '@/features/anime-category/components/AnimeCategorySelect.tsx';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';

type BaseProps = { onClose: () => void; setHideMenu: (hide: boolean) => void };

export type SingleModeProps = {
    anime: AnimeIdInfo & AnimeTitleInfo;
    handleSelection?: SelectableCollectionReturnType<AnimeIdInfo['id']>['handleSelection'];
};

type SelectModeProps = {
    selectedAnimes: (AnimeIdInfo & AnimeTitleInfo)[];
};

type Props =
    | (BaseProps & SingleModeProps & PropertiesNever<SelectModeProps>)
    | (BaseProps & PropertiesNever<SingleModeProps> & SelectModeProps);

/**
 * Mirrors MangaActionMenuItems.tsx, trimmed to what AnimeMutation.kt actually exposes - see
 * Anime.constants.ts for why there's no download/mark-seen/migrate/track entry here yet.
 */
export const AnimeActionMenuItems = ({
    anime,
    handleSelection,
    selectedAnimes = STABLE_EMPTY_ARRAY,
    onClose,
    setHideMenu,
}: Props) => {
    const { t } = useLingui();

    const isSingleMode = !!anime;

    const getMenuItemTitle = createGetMenuItemTitle(isSingleMode, ANIME_ACTION_TO_TRANSLATION);

    const handleSelect = () => {
        handleSelection?.(anime.id, true);
        onClose();
    };

    const performAction = (action: AnimeAction, animes: AnimeIdInfo[]) => {
        Animes.performAction(action, anime ? [anime.id] : Animes.getIds(animes)).catch(
            defaultPromiseErrorHandler(`AnimeActionMenuItems:performAction(${action})`),
        );

        onClose();
    };

    return (
        <>
            {!!handleSelection && isSingleMode && (
                <MenuItem onClick={handleSelect} Icon={CheckBoxOutlineBlank} title={t`Select`} />
            )}
            <MenuItem
                onClick={() => {
                    AwaitableComponent.show(AnimeCategorySelect, {
                        animeId: anime?.id,
                        animeIds: !isSingleMode ? Animes.getIds(selectedAnimes) : undefined,
                    });
                    setHideMenu(true);
                    onClose();
                }}
                Icon={Label}
                title={getMenuItemTitle('change_categories', selectedAnimes.length)}
            />
            <MenuItem
                onClick={() => performAction('remove_from_library', selectedAnimes)}
                Icon={FavoriteBorderIcon}
                title={getMenuItemTitle('remove_from_library', selectedAnimes.length)}
            />
        </>
    );
};
