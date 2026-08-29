/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { MessageDescriptor } from '@lingui/core';
import FormLabel from '@mui/material/FormLabel';
import RadioGroup from '@mui/material/RadioGroup';
import { useLingui } from '@lingui/react/macro';
import { msg } from '@lingui/core/macro';
import { useMemo } from 'react';
import { CheckboxInput } from '@/base/components/inputs/CheckboxInput.tsx';
import { RadioInput } from '@/base/components/inputs/RadioInput.tsx';
import { SortRadioInput } from '@/base/components/inputs/SortRadioInput.tsx';
import { ThreeStateCheckboxInput } from '@/base/components/inputs/ThreeStateCheckboxInput.tsx';
import { OptionsTabs } from '@/base/components/modals/OptionsTabs.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import { useAnimeCategoryLibraryOptions } from '@/features/anime-library/services/AnimeCategoryLibraryOptions.ts';
import {
    createUpdateMetadataServerSettings,
    updateMetadataServerSettings,
    useMetadataServerSettings,
} from '@/features/settings/services/ServerSettingsMetadata.ts';
import type { AnimeLibrarySortMode } from '@/features/anime-library/AnimeLibrary.types.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { Collapsable } from '@/base/components/Collapsable.tsx';
import { ResetButton } from '@/base/components/buttons/ResetButton.tsx';
import Replay from '@mui/icons-material/Replay';
import { makeToast } from '@/base/utils/Toast.ts';
import { GridLayout } from '@/base/Base.types.ts';
import type { AnimeStatusInfo } from '@/features/anime/Anime.types.ts';

const TITLES: { [key in 'filter' | 'sort' | 'display']: MessageDescriptor } = {
    filter: msg`Filter`,
    sort: msg`Sort`,
    display: msg`Display`,
};

const SORT_OPTIONS: [AnimeLibrarySortMode, MessageDescriptor][] = [
    ['unseenEpisodes', msg`Unseen episodes`],
    ['totalEpisodes', msg`Total episodes`],
    ['alphabetically', msg`A—Z`],
    ['dateAdded', msg`Recently added`],
    ['lastSeen', msg`Recently seen`],
    ['random', msg`Random`],
];

const CollapsableFilter = ({
    title,
    items,
    isActive,
}: {
    title: string;
    items: React.ReactNode[];
    isActive: boolean;
}) => (
    <Collapsable
        header={title}
        collapse={items}
        initialState={isActive}
        slots={{
            headerWrapper: {
                component: FormLabel,
                sx: { mt: 2, color: isActive ? 'warning.main' : undefined },
            },
        }}
    />
);

/**
 * Mirrors LibraryOptionsPanel.tsx, minus the tracker-binding filter (AnimeType has no
 * trackRecords field yet) and the "duplicate episodes"/"latest fetched or uploaded episode"
 * options (no server data backs either for anime) - see useGetVisibleAnimeLibrary.ts.
 */
export const AnimeLibraryOptionsPanel = ({
    categoryId,
    animes,
    open,
    onClose,
    active,
    isStatusFilterActive,
    isSourceFilterActive,
}: {
    categoryId: number;
    animes: AnimeStatusInfo[];
    open: boolean;
    onClose: () => void;
    active: boolean;
    isStatusFilterActive: boolean;
    isSourceFilterActive: boolean;
}) => {
    const { t } = useLingui();

    const animeSources = requestManager.useGetAnimeSources();
    const installedAnimeSources = animeSources.data?.animeSources ?? STABLE_EMPTY_ARRAY;

    const [options, updateOption, resetFilters] = useAnimeCategoryLibraryOptions(categoryId);

    const presentStatuses = useMemo(() => [...new Set(animes.map((anime) => anime.status))].sort(), [animes]);

    const {
        settings: { showTabSize, showDownloadBadge, showUnreadBadge: showUnseenBadge, gridLayout },
    } = useMetadataServerSettings();
    const setSettingValue = createUpdateMetadataServerSettings((e) =>
        makeToast(t`Could not save the default search settings to the server`, 'error', getErrorMessage(e)),
    );

    return (
        <OptionsTabs<'filter' | 'sort' | 'display'>
            open={open}
            onClose={onClose}
            tabs={['filter', 'sort', 'display']}
            tabTitle={(key) => t(TITLES[key])}
            tabContent={(key) => {
                if (key === 'filter') {
                    return (
                        <>
                            <ResetButton
                                disabled={!active}
                                onClick={resetFilters}
                                sx={{ alignSelf: 'flex-end' }}
                                variant="outlined"
                                size="small"
                            />
                            <ThreeStateCheckboxInput
                                label={t`Unseen`}
                                checked={options.hasUnseenEpisodes}
                                onChange={(c) => updateOption('hasUnseenEpisodes', c)}
                            />
                            <ThreeStateCheckboxInput
                                label={t`Started`}
                                checked={options.hasSeenEpisodes}
                                onChange={(c) => updateOption('hasSeenEpisodes', c)}
                            />
                            <ThreeStateCheckboxInput
                                label={t`Downloaded`}
                                checked={options.hasDownloadedEpisodes}
                                onChange={(c) => updateOption('hasDownloadedEpisodes', c)}
                            />
                            <ThreeStateCheckboxInput
                                label={t`Bookmarked`}
                                checked={options.hasBookmarkedEpisodes}
                                onChange={(c) => updateOption('hasBookmarkedEpisodes', c)}
                            />
                            {!!presentStatuses.length && (
                                <CollapsableFilter
                                    title={t`Status`}
                                    items={presentStatuses.map((status) => (
                                        <ThreeStateCheckboxInput
                                            key={status}
                                            label={status}
                                            checked={options.hasStatus[status]}
                                            onChange={(checked) =>
                                                updateOption('hasStatus', { ...options.hasStatus, [status]: checked })
                                            }
                                        />
                                    ))}
                                    isActive={isStatusFilterActive}
                                />
                            )}
                            {!!installedAnimeSources.length && (
                                <CollapsableFilter
                                    title={t`Source`}
                                    items={installedAnimeSources.map((source) => (
                                        <ThreeStateCheckboxInput
                                            key={source.id}
                                            label={source.displayName ?? source.id}
                                            checked={options.hasSource[source.id]}
                                            onChange={(checked) =>
                                                updateOption('hasSource', {
                                                    ...options.hasSource,
                                                    [source.id]: checked,
                                                })
                                            }
                                        />
                                    ))}
                                    isActive={isSourceFilterActive}
                                />
                            )}
                        </>
                    );
                }
                if (key === 'sort') {
                    return SORT_OPTIONS.map(([mode, label]) => (
                        <SortRadioInput
                            key={mode}
                            label={t(label)}
                            checked={options.sortBy === mode}
                            checkedIcon={mode === 'random' ? <Replay color="primary" /> : undefined}
                            sortDescending={options.sortDesc}
                            onClick={() =>
                                mode !== options.sortBy
                                    ? updateOption('sortBy', mode)
                                    : updateOption('sortDesc', !options.sortDesc)
                            }
                        />
                    ));
                }
                if (key === 'display') {
                    return (
                        <>
                            <FormLabel>{t`Display mode`}</FormLabel>
                            <RadioGroup
                                onChange={(e) => updateMetadataServerSettings('gridLayout', Number(e.target.value))}
                                value={gridLayout}
                            >
                                <RadioInput
                                    label={t`Compact grid`}
                                    value={GridLayout.Compact}
                                    checked={gridLayout == null || gridLayout === GridLayout.Compact}
                                />
                                <RadioInput
                                    label={t`Comfortable grid`}
                                    value={GridLayout.Comfortable}
                                    checked={gridLayout === GridLayout.Comfortable}
                                />
                                <RadioInput
                                    label={t`List`}
                                    value={GridLayout.List}
                                    checked={gridLayout === GridLayout.List}
                                />
                            </RadioGroup>
                            <FormLabel sx={{ mt: 2 }}>{t`Badges`}</FormLabel>
                            <CheckboxInput
                                label={t`Unseen badges`}
                                checked={showUnseenBadge}
                                onChange={() => updateMetadataServerSettings('showUnreadBadge', !showUnseenBadge)}
                            />
                            <CheckboxInput
                                label={t`Download badges`}
                                checked={showDownloadBadge}
                                onChange={() => updateMetadataServerSettings('showDownloadBadge', !showDownloadBadge)}
                            />
                            <FormLabel sx={{ mt: 2 }}>{t`Tabs`}</FormLabel>
                            <CheckboxInput
                                label={t`Show number of items`}
                                checked={showTabSize}
                                onChange={() => setSettingValue('showTabSize', !showTabSize)}
                            />
                        </>
                    );
                }
                return null;
            }}
        />
    );
};
