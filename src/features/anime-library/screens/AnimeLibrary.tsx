/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ChipProps } from '@mui/material/Chip';
import Chip from '@mui/material/Chip';
import Tab from '@mui/material/Tab';
import { styled, useTheme } from '@mui/material/styles';
import { useCallback, useMemo, useState } from 'react';
import { useQueryParam, NumberParam } from 'use-query-params';
import { useLingui } from '@lingui/react/macro';
import { plural } from '@lingui/core/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { TabPanel } from '@/base/components/tabs/TabPanel.tsx';
import { AnimeLibraryToolbarMenu } from '@/features/anime-library/components/AnimeLibraryToolbarMenu.tsx';
import { AnimeLibraryGrid } from '@/features/anime-library/components/AnimeLibraryGrid.tsx';
import { AppbarSearch } from '@/base/components/AppbarSearch.tsx';
import { useSelectableCollection } from '@/base/collection/hooks/useSelectableCollection.ts';
import { SelectableCollectionSelectMode } from '@/base/collection/components/SelectableCollectionSelectMode.tsx';
import { useGetVisibleAnimeLibrary } from '@/features/anime-library/hooks/useGetVisibleAnimeLibrary.ts';
import { SelectionFAB } from '@/base/collection/components/SelectionFAB.tsx';
import { AnimeActionMenuItems } from '@/features/anime/components/AnimeActionMenuItems.tsx';
import { TabsMenu } from '@/base/components/tabs/TabsMenu.tsx';
import { TabsWrapper } from '@/base/components/tabs/TabsWrapper.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import type {
    GetAnimeCategoriesLibraryQuery,
    GetAnimeCategoriesLibraryQueryVariables,
} from '@/lib/graphql/generated/graphql.ts';
import { GET_ANIME_CATEGORIES_LIBRARY } from '@/lib/graphql/anime/AnimeCategoryQuery.ts';
import { Animes } from '@/features/anime/services/Animes.ts';
import { useMetadataServerSettings } from '@/features/settings/services/ServerSettingsMetadata.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { useAppAction } from '@/features/navigation-bar/hooks/useAppAction.ts';
import { SearchParam } from '@/base/Base.types.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import type { AnimeIdInfo } from '@/features/anime/Anime.types.ts';
import { OffsetComponent } from '@/base/OffsetComponent.tsx';

const TitleWithSizeTag = styled('span')({
    display: 'flex',
    alignItems: 'center',
});

const TitleSizeTag = ({ sx, ...props }: ChipProps) => (
    <Chip {...props} size="small" sx={{ ...sx, marginLeft: '5px' }} />
);

/**
 * Full parity port of Library.tsx: category tabs (with tab counts), search, filter/sort/display
 * options, multi-select with bulk actions, and the virtualised grid/list. Two manga-only pieces
 * are left out and disclosed rather than faked: the library-wide "check for new episodes" action
 * (UpdateChecker has no anime-side mutation/subscription to drive it yet) and the "search
 * globally" trigger (there's no cross-source anime search screen in this codebase yet).
 */
export function AnimeLibrary() {
    const { t } = useLingui();
    const theme = useTheme();

    const {
        settings: { showTabSize },
    } = useMetadataServerSettings();

    const {
        data: categoriesResponse,
        error: tabsError,
        loading: areCategoriesLoading,
        refetch: refetchCategories,
    } = requestManager.useGetAnimeCategories<GetAnimeCategoriesLibraryQuery, GetAnimeCategoriesLibraryQueryVariables>(
        GET_ANIME_CATEGORIES_LIBRARY,
    );
    const tabsData = categoriesResponse?.animeCategories.filter(
        (category) => category.id !== 0 || (category.id === 0 && category.animes.length > 0),
    );
    const tabs = tabsData ?? STABLE_EMPTY_ARRAY;

    // there's no dedicated "total library size" query for anime - every in-library anime falls
    // under exactly one real category or the virtual "default" one, so the union of every tab's
    // anime ids is the same distinct count a dedicated query would return.
    const librarySize = useMemo(() => new Set(tabs.flatMap((tab) => tab.animes.map((anime) => anime.id))).size, [tabs]);

    const [tabSearchParam, setTabSearchParam] = useQueryParam(SearchParam.TAB, NumberParam);

    const activeTab: (typeof tabs)[number] | undefined = tabs.find((tab) => tab.id === tabSearchParam) ?? tabs[0];

    const {
        data: categoryAnimeResponse,
        error: animeError,
        loading: animeLoading,
        refetch: refetchCategoryAnimes,
    } = requestManager.useGetCategoryAnimes(activeTab?.id ?? -1, { skip: !activeTab });
    const categoryAnimes = categoryAnimeResponse?.animeCategory?.animes ?? STABLE_EMPTY_ARRAY;
    const {
        visibleAnimes: animes,
        showFilteredOutMessage,
        filterKey,
    } = useGetVisibleAnimeLibrary(categoryAnimes, activeTab?.id);

    const getTabCount = (tab: (typeof tabs)[number]) => {
        if (animeLoading || tab !== activeTab || animes.length === tab.animes.length) {
            return tab.animes.length;
        }

        return `${animes.length}/${tab.animes.length}`;
    };

    const retryFetchCategoryAnimes = useCallback(
        () => refetchCategoryAnimes().catch(defaultPromiseErrorHandler('AnimeLibrary::refetchCategoryAnimes')),
        [refetchCategoryAnimes, activeTab],
    );

    const animeIds = useMemo(() => animes.map((anime) => anime.id), [animes]);

    const [isSelectModeActive, setIsSelectModeActive] = useState(false);
    const {
        areNoItemsForKeySelected: areNoItemsSelected,
        areAllItemsForKeySelected: areAllItemsSelected,
        selectedItemIds,
        handleSelectAll,
        handleSelection,
        clearSelection,
    } = useSelectableCollection<AnimeIdInfo['id'], string>(animes.length, {
        itemIds: animeIds,
        currentKey: activeTab?.id.toString(),
        initialState: undefined,
    });

    const handleSelect: typeof handleSelection = useCallback(
        (id, selected, selectOptions) => {
            setIsSelectModeActive(!!(selectedItemIds.length + (selected ? 1 : -1)));
            handleSelection(id, selected, selectOptions);
        },
        [setIsSelectModeActive, handleSelection],
    );

    const selectedAnimes = useMemo(
        () => selectedItemIds.map((id) => Animes.getFromCache(id)).filter((anime) => !!anime),
        [selectedItemIds.length, animes],
    );

    const selectionFab = useMemo(() => {
        if (!isSelectModeActive) {
            return null;
        }

        return (
            <SelectionFAB title={plural(selectedItemIds.length, { one: '# anime', other: '# anime' })}>
                {(handleClose, setHideMenu) => (
                    <AnimeActionMenuItems
                        selectedAnimes={selectedAnimes}
                        onClose={() => {
                            handleClose();
                            setIsSelectModeActive(false);
                            clearSelection();
                        }}
                        setHideMenu={setHideMenu}
                    />
                )}
            </SelectionFAB>
        );
    }, [isSelectModeActive, selectedAnimes]);

    useAppTitle(
        <TitleWithSizeTag>
            {t`Anime Library`}
            {showTabSize && (
                <TitleSizeTag
                    sx={{ ...theme.applyStyles('light', { backgroundColor: 'background.paper' }) }}
                    label={librarySize}
                />
            )}
        </TitleWithSizeTag>,
        t`Anime Library`,
        [t, showTabSize, librarySize, theme],
    );
    useAppAction(
        <>
            {!isSelectModeActive && activeTab && (
                <>
                    <AppbarSearch />
                    <AnimeLibraryToolbarMenu categoryId={activeTab.id} animes={animes} />
                </>
            )}
            {!!animes.length && (
                <SelectableCollectionSelectMode
                    isActive={isSelectModeActive}
                    areAllItemsSelected={areAllItemsSelected}
                    areNoItemsSelected={areNoItemsSelected}
                    onSelectAll={(selectAll) =>
                        handleSelectAll(selectAll, [...new Set(animes.map((anime) => anime.id))])
                    }
                    onModeChange={(checked) => {
                        setIsSelectModeActive(checked);

                        if (checked) {
                            handleSelectAll(true, [...new Set(animes.map((anime) => anime.id))]);
                        } else {
                            tabs.forEach((tab) => handleSelectAll(false, [], tab.id.toString()));
                        }
                    }}
                />
            )}
        </>,
        [isSelectModeActive, areNoItemsSelected, areAllItemsSelected, activeTab, animes],
    );

    const handleTabChange = (newTab: number) => {
        setTabSearchParam(newTab);
    };

    if (tabsError != null) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={tabsError.message}
                retry={() => refetchCategories().catch(defaultPromiseErrorHandler('AnimeLibrary::refetchCategories'))}
            />
        );
    }

    if (areCategoriesLoading) {
        return <LoadingPlaceholder />;
    }

    if (tabs.length === 0) {
        return <EmptyViewAbsoluteCentered message={t`Your anime library is empty`} />;
    }

    if (tabs.length === 1) {
        return (
            <>
                <AnimeLibraryGrid
                    // the key needs to include filters and query to force a re-render of the virtuoso grid to prevent https://github.com/petyosi/react-virtuoso/issues/1242
                    key={filterKey}
                    animes={animes}
                    message={animeError ? t`Could not load anime` : t`Your anime library is empty`}
                    messageExtra={animeError?.message}
                    isLoading={animeLoading}
                    selectedAnimeIds={selectedItemIds}
                    isSelectModeActive={isSelectModeActive}
                    handleSelection={handleSelect}
                    showFilteredOutMessage={!animeError && showFilteredOutMessage}
                    retry={animeError && retryFetchCategoryAnimes}
                />
                {selectionFab}
            </>
        );
    }

    return (
        <TabsWrapper>
            <OffsetComponent>
                <TabsMenu value={activeTab.id} onChange={(e, newTab) => handleTabChange(newTab)}>
                    {tabs.map((tab) => (
                        <Tab
                            sx={{ flexGrow: 1, maxWidth: 'unset' }}
                            key={tab.id}
                            label={
                                <TitleWithSizeTag>
                                    {tab.name}
                                    {showTabSize ? <TitleSizeTag label={getTabCount(tab)} /> : null}
                                </TitleWithSizeTag>
                            }
                            value={tab.id}
                        />
                    ))}
                </TabsMenu>
            </OffsetComponent>
            {tabs.map((tab) => (
                <TabPanel key={tab.id} index={tab.order} currentIndex={activeTab.order}>
                    {tab === activeTab && (
                        <AnimeLibraryGrid
                            // the key needs to include filters and query to force a re-render of the virtuoso grid to prevent https://github.com/petyosi/react-virtuoso/issues/1242
                            key={filterKey}
                            animes={animes}
                            message={animeError ? t`Could not load anime` : t`The category is empty`}
                            messageExtra={animeError?.message}
                            isLoading={animeLoading}
                            selectedAnimeIds={selectedItemIds}
                            isSelectModeActive={isSelectModeActive}
                            handleSelection={handleSelect}
                            showFilteredOutMessage={!animeError && showFilteredOutMessage}
                            retry={animeError && retryFetchCategoryAnimes}
                        />
                    )}
                </TabPanel>
            ))}
            {selectionFab}
        </TabsWrapper>
    );
}
