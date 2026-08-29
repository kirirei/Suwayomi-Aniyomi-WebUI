/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import type { ComponentProps } from 'react';
import { useMemo, useState } from 'react';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import type { DragEndEvent } from '@dnd-kit/core';
import { closestCenter, DndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { DEFAULT_FULL_FAB_HEIGHT } from '@/base/components/buttons/StyledFab.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import type {
    GetAnimeCategoriesBaseQuery,
    GetAnimeCategoriesBaseQueryVariables,
} from '@/lib/graphql/generated/graphql.ts';
import { GET_ANIME_CATEGORIES_BASE } from '@/lib/graphql/anime/AnimeCategoryQuery.ts';
import { AnimeCategorySettingsCard } from '@/features/anime-category/components/AnimeCategorySettingsCard.tsx';
import type { AnimeCategoryIdInfo } from '@/features/anime-category/AnimeCategory.types.ts';
import { getErrorMessage, noOp } from '@/lib/HelperFunctions.ts';
import { DndSortableItem } from '@/lib/dnd-kit/DndSortableItem.tsx';
import { DndKitUtil } from '@/lib/dnd-kit/DndKitUtil.ts';
import { DndOverlayItem } from '@/lib/dnd-kit/DndOverlayItem.tsx';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import { CREATE_NEW_CATEGORY_ID } from '@/features/category/Category.constants.ts';
import { CreateOrEditAnimeCategoryDialog } from '@/features/anime-category/components/CreateOrEditAnimeCategoryDialog.tsx';

/** Mirrors CategorySettings.tsx, backed by the anime category table/mutations. */
export function AnimeCategorySettings() {
    const { t } = useLingui();
    const dndSensors = DndKitUtil.useSensorsForDevice();

    useAppTitle(t`Edit anime categories`);

    const { data, loading, error, refetch } = requestManager.useGetAnimeCategories<
        GetAnimeCategoriesBaseQuery,
        GetAnimeCategoriesBaseQueryVariables
    >(GET_ANIME_CATEGORIES_BASE);
    const [reorderCategory, { reset: revertReorder }] = requestManager.useReorderAnimeCategory();

    const [categoryToEdit, setCategoryToEdit] = useState<number>(CREATE_NEW_CATEGORY_ID);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dndActiveCategory, setDndActiveCategory] = useState<
        ComponentProps<typeof AnimeCategorySettingsCard>['category'] | null
    >(null);

    const categories = useMemo(() => {
        const res = [...(data?.animeCategories ?? [])];
        if (res.length > 0 && res[0].name === 'Default') {
            res.shift();
        }
        return res;
    }, [data]);

    const categoryReorder = (list: AnimeCategoryIdInfo[], from: number, to: number) => {
        const reorderedCategory = list[from];

        reorderCategory({ variables: { input: { id: reorderedCategory.id, position: to + 1 } } }).catch(() =>
            revertReorder(),
        );
    };

    const onDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        setDndActiveCategory(null);

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = categories.findIndex((category) => category.id === active.id);
        const newIndex = categories.findIndex((category) => category.id === over.id);

        categoryReorder(categories, oldIndex, newIndex);
    };

    const handleDialogOpen = (categoryId?: AnimeCategoryIdInfo['id']) => {
        setCategoryToEdit(categoryId ?? CREATE_NEW_CATEGORY_ID);
        setDialogOpen(true);
    };

    const handleDialogCancel = () => {
        setCategoryToEdit(CREATE_NEW_CATEGORY_ID);
        setDialogOpen(false);
    };

    if (loading) {
        return <LoadingPlaceholder />;
    }

    if (error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Could not load categories`}
                messageExtra={getErrorMessage(error)}
                retry={() => refetch().catch(defaultPromiseErrorHandler('AnimeCategorySettings::refetch'))}
            />
        );
    }

    return (
        <>
            <DndContext
                sensors={dndSensors}
                collisionDetection={closestCenter}
                onDragStart={(event) =>
                    setDndActiveCategory(categories.find((category) => category.id === event.active.id) ?? null)
                }
                onDragEnd={onDragEnd}
                onDragCancel={() => setDndActiveCategory(null)}
                onDragAbort={() => setDndActiveCategory(null)}
            >
                <Box sx={{ paddingBottom: DEFAULT_FULL_FAB_HEIGHT }}>
                    <SortableContext items={categories} strategy={verticalListSortingStrategy}>
                        {categories.map((category, index) => (
                            <DndSortableItem
                                key={category.id}
                                id={category.id}
                                isDragging={category.id === dndActiveCategory?.id}
                            >
                                <AnimeCategorySettingsCard category={category} onEdit={() => handleDialogOpen(index)} />
                            </DndSortableItem>
                        ))}
                    </SortableContext>
                    <DndOverlayItem isActive={!!dndActiveCategory}>
                        <AnimeCategorySettingsCard category={dndActiveCategory!} onEdit={noOp} />
                    </DndOverlayItem>
                </Box>
            </DndContext>
            <Fab
                color="primary"
                aria-label="add"
                sx={{
                    position: 'fixed',
                    bottom: (theme) => theme.spacing(2),
                    right: (theme) => theme.spacing(2),
                }}
                onClick={() => handleDialogOpen()}
            >
                <AddIcon />
            </Fab>

            {dialogOpen && (
                <CreateOrEditAnimeCategoryDialog category={categories[categoryToEdit]} onClose={handleDialogCancel} />
            )}
        </>
    );
}
