/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import { useEffect, useMemo } from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import FormGroup from '@mui/material/FormGroup';
import { Link } from 'react-router-dom';
import Stack from '@mui/material/Stack';
import type { AwaitableComponentProps } from 'awaitable-component';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { Animes } from '@/features/anime/services/Animes.ts';
import { useSelectableCollection } from '@/base/collection/hooks/useSelectableCollection.ts';
import { ThreeStateCheckboxInput } from '@/base/components/inputs/ThreeStateCheckboxInput.tsx';
import { AnimeCategories } from '@/features/anime-category/services/AnimeCategories.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import type {
    GetAnimeCategoriesBaseQuery,
    GetAnimeCategoriesBaseQueryVariables,
} from '@/lib/graphql/generated/graphql.ts';
import { GET_ANIME_CATEGORIES_BASE } from '@/lib/graphql/anime/AnimeCategoryQuery.ts';
import { AppRoutes } from '@/base/AppRoute.constants.ts';

/**
 * Mirrors CategorySelect.tsx, trimmed to what AnimeMutation.kt actually exposes: there's no
 * "add to library" combined flow for anime yet (the anime screen's own library toggle handles
 * that), so this dialog only ever changes categories of anime that are already in the library.
 */
type BaseProps = AwaitableComponentProps<{ addToCategories?: number[]; removeFromCategories?: number[] }>;

type SingleAnimeModeProps = {
    animeId: number;
};

type MultiAnimeModeProps = {
    animeIds: number[];
};

export type AnimeCategorySelectProps =
    | (BaseProps & SingleAnimeModeProps & PropertiesNever<MultiAnimeModeProps>)
    | (BaseProps & PropertiesNever<SingleAnimeModeProps> & MultiAnimeModeProps);

const useGetAnimeCategoryIds = (animeId: number | undefined): number[] => {
    const { data: animeResult } = requestManager.useGetAnimeCategoriesOfAnime(animeId ?? -1, {
        skip: animeId === undefined,
    });

    return useMemo(() => {
        if (animeId === undefined || !animeResult) {
            return [];
        }

        return AnimeCategories.getIds(animeResult.anime.categories);
    }, [animeResult?.anime.categories, animeId]);
};

const getCategoryCheckedState = (
    categoryId: number,
    categoriesToAdd: number[],
    categoriesToRemove: number[],
    isSingleSelectionMode: boolean,
): boolean | undefined => {
    if (categoriesToAdd.includes(categoryId)) {
        return true;
    }

    if (isSingleSelectionMode) {
        return undefined;
    }

    if (categoriesToRemove.includes(categoryId)) {
        return false;
    }

    return undefined;
};

export function AnimeCategorySelect(props: AnimeCategorySelectProps) {
    const { t } = useLingui();

    const { onDismiss, onSubmit, isVisible, onExitComplete, animeId, animeIds: passedAnimeIds } = props;

    const isSingleSelectionMode = animeId !== undefined;
    const animeIds = passedAnimeIds ?? [animeId];

    const animeCategoryIds = useGetAnimeCategoryIds(animeId);

    const { data } = requestManager.useGetAnimeCategories<
        GetAnimeCategoriesBaseQuery,
        GetAnimeCategoriesBaseQueryVariables
    >(GET_ANIME_CATEGORIES_BASE);
    const categoriesData = data?.animeCategories ?? STABLE_EMPTY_ARRAY;

    const allCategories = useMemo(() => AnimeCategories.getUserCreated(categoriesData), [categoriesData]);

    const { handleSelection, setSelectionForKey, getSelectionForKey } = useSelectableCollection<
        number,
        'categoriesToAdd' | 'categoriesToRemove'
    >(allCategories.length, {
        currentKey: 'categoriesToAdd',
        initialState: useMemo(
            () => ({
                categoriesToAdd: animeCategoryIds,
                categoriesToRemove: [],
            }),
            [animeCategoryIds],
        ),
    });

    useEffect(() => {
        setSelectionForKey('categoriesToAdd', animeCategoryIds);
        setSelectionForKey('categoriesToRemove', []);
    }, [animeCategoryIds]);

    const categoriesToAdd = getSelectionForKey('categoriesToAdd');
    const categoriesToRemove = getSelectionForKey('categoriesToRemove');

    const handleCancel = () => {
        setSelectionForKey('categoriesToAdd', animeCategoryIds);
        setSelectionForKey('categoriesToRemove', []);
        onDismiss();
    };

    const handleOk = () => {
        const addToCategories = isSingleSelectionMode
            ? categoriesToAdd.filter((categoryId) => !animeCategoryIds.includes(categoryId))
            : categoriesToAdd;
        const removeFromCategories = isSingleSelectionMode
            ? animeCategoryIds.filter((categoryId) => !categoriesToAdd.includes(categoryId))
            : categoriesToRemove;

        onSubmit({
            addToCategories,
            removeFromCategories,
        });

        const isUpdateRequired = !!addToCategories.length || !!removeFromCategories.length;
        if (!isUpdateRequired) {
            return;
        }

        Animes.performAction('change_categories', animeIds, {
            changeCategoriesPatch: {
                addToCategories,
                removeFromCategories,
            },
        }).catch(defaultPromiseErrorHandler('AnimeCategorySelect::handleOk'));
    };

    return (
        <Dialog
            sx={{
                '.MuiDialog-paper': {
                    maxHeight: 435,
                    width: '80%',
                },
            }}
            maxWidth="xs"
            open={isVisible}
            onTransitionExited={onExitComplete}
            onClose={handleCancel}
        >
            <DialogTitle>{t`Set categories`}</DialogTitle>
            <DialogContent dividers>
                <FormGroup>
                    {allCategories.length === 0 && <span>{t`You don't have any categories yet.`}</span>}
                    {allCategories.map((category) => (
                        <ThreeStateCheckboxInput
                            checked={getCategoryCheckedState(
                                category.id,
                                categoriesToAdd,
                                categoriesToRemove,
                                isSingleSelectionMode,
                            )}
                            onChange={(checked) => {
                                handleSelection(category.id, false, { key: 'categoriesToAdd' });
                                handleSelection(category.id, false, { key: 'categoriesToRemove' });

                                if (checked) {
                                    handleSelection(category.id, true, { key: 'categoriesToAdd' });
                                }

                                if (checked === false) {
                                    handleSelection(category.id, true, { key: 'categoriesToRemove' });
                                }
                            }}
                            label={category.name}
                            key={category.id}
                        />
                    ))}
                </FormGroup>
            </DialogContent>
            <DialogActions>
                <Stack sx={{ width: '100%' }}>
                    <Stack
                        direction="row"
                        sx={{
                            justifyContent: 'space-between',
                            alignItems: 'end',
                            width: '100%',
                        }}
                    >
                        <Button
                            component={Link}
                            to={AppRoutes.settings.children.anime.children.categories.path}
                            onClick={onDismiss}
                        >
                            {allCategories.length ? t`Edit` : t`Create`}
                        </Button>
                        <Stack direction="row">
                            <Button autoFocus onClick={handleCancel} color="primary">
                                {t`Cancel`}
                            </Button>
                            {!!allCategories.length && (
                                <Button onClick={handleOk} color="primary">
                                    {t`Ok`}
                                </Button>
                            )}
                        </Stack>
                    </Stack>
                </Stack>
            </DialogActions>
        </Dialog>
    );
}
