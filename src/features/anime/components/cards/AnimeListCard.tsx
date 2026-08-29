/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { Link as RouterLink } from 'react-router-dom';
import { memo, useRef } from 'react';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import type { SpecificAnimeCardProps } from '@/features/anime/Anime.types.ts';
import { Animes } from '@/features/anime/services/Animes.ts';
import { AnimeOptionButton } from '@/features/anime/components/AnimeOptionButton.tsx';
import { ListCardAvatar } from '@/base/components/lists/cards/ListCardAvatar.tsx';
import { ListCardContent } from '@/base/components/lists/cards/ListCardContent';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';

/** Mirrors MangaListCard.tsx, minus the continue-reading-button slot (see Anime.types.ts). */
export const AnimeListCard = memo(
    ({
        anime,
        longPressBind,
        popupState,
        animeLinkTo,
        selected,
        inLibraryIndicator,
        isInLibrary,
        handleSelection,
        animeBadges,
        mode,
    }: SpecificAnimeCardProps) => {
        const preventMobileContextMenu = MediaQuery.usePreventMobileContextMenu();

        const optionButtonRef = useRef<HTMLButtonElement>(null);

        const { id, title } = anime;

        return (
            <Card>
                <CardActionArea
                    component={RouterLink}
                    to={animeLinkTo}
                    state={Animes.createLocationState(anime)}
                    {...longPressBind(() => popupState.open(optionButtonRef.current))}
                    onContextMenu={preventMobileContextMenu}
                    sx={{
                        ...MediaQuery.preventMobileContextMenuSx(),
                        '@media (hover: hover) and (pointer: fine)': {
                            '&:hover .anime-option-button': {
                                visibility: 'visible',
                                pointerEvents: 'all',
                            },
                            '&:hover .source-anime-library-state-button': {
                                display: 'inline-flex',
                            },
                            '&:hover .source-anime-library-state-indicator': {
                                display: mode === 'source' ? 'none' : 'inline-flex',
                            },
                        },
                    }}
                >
                    <ListCardContent
                        sx={{
                            justifyContent: 'space-between',
                            position: 'relative',
                        }}
                    >
                        <ListCardAvatar
                            iconUrl={Animes.getThumbnailUrl(anime)}
                            alt={anime.title}
                            slots={{
                                spinnerImageProps: {
                                    imgStyle: {
                                        imageRendering: 'pixelated',
                                        filter: inLibraryIndicator && isInLibrary ? 'brightness(0.4)' : undefined,
                                    },
                                },
                            }}
                        />
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                flexGrow: 1,
                                width: 'min-content',
                            }}
                        >
                            <CustomTooltip title={title} placement="top">
                                <TypographyMaxLines variant="h6" component="h3">
                                    {title}
                                </TypographyMaxLines>
                            </CustomTooltip>
                        </Box>
                        <Stack
                            direction="row"
                            sx={{
                                alignItems: 'center',
                                gap: 0.5,
                            }}
                        >
                            {animeBadges}
                            <AnimeOptionButton
                                ref={optionButtonRef}
                                popupState={popupState}
                                id={id}
                                selected={selected}
                                handleSelection={handleSelection}
                                asCheckbox
                            />
                        </Stack>
                    </ListCardContent>
                </CardActionArea>
            </Card>
        );
    },
);
