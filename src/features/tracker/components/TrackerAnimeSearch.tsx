/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import Button from '@mui/material/Button';
import List from '@mui/material/List';
import Stack from '@mui/material/Stack';
import { useEffect, useMemo, useState } from 'react';
import IconButton from '@mui/material/IconButton';
import ArrowBack from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import InputAdornment from '@mui/material/InputAdornment';
import InfoIcon from '@mui/icons-material/Info';
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Box from '@mui/material/Box';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Link from '@mui/material/Link';
import { useLingui } from '@lingui/react/macro';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { SearchTextField } from '@/base/components/inputs/SearchTextField.tsx';
import { makeToast } from '@/base/utils/Toast.ts';
import {
    DIALOG_PADDING,
    PUBLISHING_STATUS_TO_TRANSLATION,
    PUBLISHING_TYPE_TO_TRANSLATION,
} from '@/features/tracker/Tracker.constants.ts';
import { useGetOptionForDirection } from '@/features/theme/services/ThemeCreator.ts';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { applyStyles } from '@/base/utils/ApplyStyles.ts';
import type { TTrackerBind } from '@/features/tracker/Tracker.types.ts';
import { Tracker } from '@/features/tracker/Tracker.types.ts';
import { Trackers } from '@/features/tracker/services/Trackers.ts';
import { CustomIconButton } from '@/base/components/buttons/CustomIconButton.tsx';
import { CustomTooltip } from '@/base/components/CustomTooltip.tsx';
import { TypographyMaxLines } from '@/base/components/texts/TypographyMaxLines.tsx';
import { Metadata } from '@/base/components/texts/Metadata.tsx';
import { SpinnerImage } from '@/base/components/SpinnerImage.tsx';
import { MediaQuery } from '@/base/utils/MediaQuery.tsx';
import { MUIUtil } from '@/lib/mui/MUI.util.ts';
import { MANGA_COVER_ASPECT_RATIO } from '@/features/manga/Manga.constants.ts';
import { STABLE_EMPTY_ARRAY } from '@/base/Base.constants.ts';
import type { TAnimeTrackSearch } from '@/features/tracker/AnimeTracker.types.ts';

/** Mirrors TrackerSearch.tsx/TrackerMangaCard.tsx, condensed into one file for the anime slice. */
const TrackerAnimeSearchResultCard = ({
    anime,
    selected,
    onSelect,
}: {
    anime: TAnimeTrackSearch;
    selected: boolean;
    onSelect: () => void;
}) => {
    const { t } = useLingui();
    const isMobileWidth = MediaQuery.useIsMobileWidth();

    return (
        <Card sx={{ backgroundColor: 'background.default', marginBottom: 2, '&:last-child': { marginBottom: 8 } }}>
            <CardActionArea onClick={onSelect}>
                <CardContent sx={{ padding: '0', borderRadius: 'inherit' }}>
                    <Box
                        sx={{
                            padding: 1,
                            border: '3px solid',
                            borderRadius: 'inherit',
                            borderColor: selected ? 'primary.main' : 'transparent',
                        }}
                    >
                        <Stack direction="row" sx={{ gap: 2, marginBottom: 2 }}>
                            <CardMedia
                                sx={{
                                    aspectRatio: MANGA_COVER_ASPECT_RATIO,
                                    minWidth: '100px',
                                    width: '150px',
                                    borderRadius: 1,
                                    overflow: 'hidden',
                                }}
                            >
                                <Link
                                    {...MUIUtil.preventRippleProp()}
                                    href={anime.trackingUrl}
                                    rel="noreferrer"
                                    target="_blank"
                                    underline="none"
                                    color="inherit"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <SpinnerImage
                                        useFetchApi={false}
                                        disableCors
                                        ignoreQueue
                                        alt={anime.title}
                                        src={anime.coverUrl}
                                        spinnerStyle={{ width: '100%', height: '100%' }}
                                        imgStyle={{
                                            width: '100%',
                                            height: isMobileWidth ? undefined : '100%',
                                            maxHeight: '100%',
                                            objectFit: 'cover',
                                        }}
                                    />
                                </Link>
                            </CardMedia>
                            <Stack direction="column" sx={{ width: '100%' }}>
                                <Stack direction="row" sx={{ gap: '5px', justifyContent: 'space-between' }}>
                                    <CustomTooltip title={anime.title}>
                                        <TypographyMaxLines variant="h5" component="h1">
                                            {anime.title}
                                        </TypographyMaxLines>
                                    </CustomTooltip>
                                    <CheckCircleIcon
                                        sx={{ visibility: selected ? 'visible' : 'hidden' }}
                                        color="primary"
                                    />
                                </Stack>
                                {anime.publishingType && (
                                    <Metadata
                                        title={t`Type`}
                                        value={t(PUBLISHING_TYPE_TO_TRANSLATION[Trackers.getPublishingType(anime)])}
                                    />
                                )}
                                {anime.startDate && <Metadata title={t`Started`} value={anime.startDate} />}
                                {anime.publishingStatus && (
                                    <Metadata
                                        title={t`Status`}
                                        value={t(PUBLISHING_STATUS_TO_TRANSLATION[Trackers.getPublishingStatus(anime)])}
                                    />
                                )}
                                {anime.score > 0 && <Metadata title={t`Score`} value={anime.score} />}
                                {anime.totalEpisodes > 0 && <Metadata title={t`Episode`} value={anime.totalEpisodes} />}
                            </Stack>
                        </Stack>
                        {!!anime.summary.length && (
                            <Typography variant="body1" component="p" sx={{ whiteSpace: 'pre-line' }}>
                                {anime.summary}
                            </Typography>
                        )}
                    </Box>
                </CardContent>
            </CardActionArea>
        </Card>
    );
};

const TrackButton = ({
    animeId,
    animeTitle,
    totalEpisodes,
    selected,
    closeSearchMode,
    supportsPrivateTracking,
}: {
    animeId: number;
    animeTitle: string;
    totalEpisodes: number;
    selected: TAnimeTrackSearch;
    closeSearchMode: () => void;
    supportsPrivateTracking: boolean;
}) => {
    const { t } = useLingui();
    const [isLoading, setIsLoading] = useState(false);

    const trackAnime = (asPrivate: boolean) => {
        setIsLoading(true);
        requestManager
            .bindAnimeTrack(animeId, selected.remoteId, animeTitle, totalEpisodes, selected.trackingUrl, asPrivate)
            .response.then(() => {
                makeToast(t`Tracked anime`, 'success');
                closeSearchMode();
            })
            .catch((e) => {
                setIsLoading(false);
                makeToast(t`Could not track anime`, 'error', getErrorMessage(e));
            });
    };

    return (
        <Stack
            direction="row"
            sx={{
                justifyContent: 'center',
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                paddingBottom: DIALOG_PADDING,
                gap: 2,
                px: DIALOG_PADDING,
            }}
        >
            <Button
                disabled={isLoading}
                size="large"
                variant="contained"
                onClick={() => trackAnime(false)}
                sx={{ flexBasis: '65%' }}
            >
                {t`Track`}
            </Button>
            {supportsPrivateTracking && (
                <CustomTooltip title={t`Track privately`} disabled={isLoading}>
                    <CustomIconButton
                        disabled={isLoading}
                        sx={{ flexBasis: '10%', maxWidth: '100px' }}
                        variant="contained"
                        onClick={() => trackAnime(true)}
                    >
                        <VisibilityOffIcon />
                    </CustomIconButton>
                </CustomTooltip>
            )}
        </Stack>
    );
};

export const TrackerAnimeSearch = ({
    anime,
    tracker,
    closeSearchMode,
    trackedTitle,
}: {
    anime: { id: number; title: string };
    tracker: TTrackerBind;
    closeSearchMode: () => void;
    trackedTitle?: string;
}) => {
    const { t } = useLingui();
    const getOptionForDirection = useGetOptionForDirection();

    const [searchString, setSearchString] = useState<string>(trackedTitle ?? anime.title);
    const [tmpSearchString, setTmpSearchString] = useState(searchString);

    const [selected, setSelected] = useState<TAnimeTrackSearch | undefined>();

    const trackerSearch = requestManager.useSearchAnimeTrack(searchString);
    const searchResults = trackerSearch.data?.searchAnimeTrack ?? STABLE_EMPTY_ARRAY;

    const hasResults = !!searchResults.length;
    const hasNoResults = !trackerSearch.loading && !trackerSearch.error && !hasResults;
    const hasError = !!trackerSearch.error && !trackerSearch.loading;

    useEffect(() => {
        setSelected(undefined);

        return () =>
            trackerSearch.abortRequest(new Error(`TrackerAnimeSearch(${tracker.id}, ${anime.id}): search changed`));
    }, [searchString]);

    const showTrackButton = useMemo(() => !!selected, [selected]) && !hasError;

    return (
        <>
            <DialogTitle sx={{ padding: DIALOG_PADDING }}>
                <Stack direction="row" sx={{ gap: '10px', alignItems: 'center' }}>
                    <IconButton onClick={closeSearchMode}>
                        {getOptionForDirection(<ArrowBack />, <ArrowForwardIcon />)}
                    </IconButton>
                    <SearchTextField
                        sx={{ width: '100%' }}
                        variant="standard"
                        value={tmpSearchString}
                        onChange={(e) => setTmpSearchString(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                setSearchString(tmpSearchString);
                            }
                        }}
                        onCancel={() => setTmpSearchString('')}
                        slotProps={{
                            input: {
                                startAdornment: tracker.id === Tracker.MYANIMELIST && (
                                    <InputAdornment position="start">
                                        <PopupState variant="popover" popupId="tracker-anime-search-info">
                                            {(popupState) => (
                                                <>
                                                    <IconButton {...bindTrigger(popupState)} color="inherit">
                                                        <InfoIcon />
                                                    </IconButton>
                                                    <Popover
                                                        {...bindPopover(popupState)}
                                                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                                    >
                                                        <Typography sx={{ padding: 1, whiteSpace: 'pre-line' }}>
                                                            {t`Search for a ID via "id:<ID>" (e.g. "id:21")\nLimit search to your lists via "my:<Title>" (e.g. "my:One Piece")`}
                                                        </Typography>
                                                    </Popover>
                                                </>
                                            )}
                                        </PopupState>
                                    </InputAdornment>
                                ),
                            },
                        }}
                    />
                </Stack>
            </DialogTitle>
            <DialogContent
                dividers
                sx={{
                    padding: DIALOG_PADDING,
                    height: '100vh',
                    ...applyStyles(hasNoResults || hasError, { position: 'relative' }),
                }}
            >
                {hasNoResults && <EmptyViewAbsoluteCentered message={t`No anime found`} />}
                {trackerSearch.loading && <LoadingPlaceholder />}
                {hasError && (
                    <EmptyViewAbsoluteCentered
                        message={t`Unable to load data`}
                        messageExtra={getErrorMessage(trackerSearch.error)}
                        retry={() =>
                            trackerSearch.refetch().catch(defaultPromiseErrorHandler('TrackerAnimeSearch::refetch'))
                        }
                    />
                )}
                <List sx={{ padding: 0 }}>
                    {hasResults &&
                        searchResults.map((result) => (
                            <TrackerAnimeSearchResultCard
                                key={result.remoteId}
                                anime={result}
                                selected={result.remoteId === selected?.remoteId}
                                onSelect={() => setSelected(result)}
                            />
                        ))}
                </List>
                {showTrackButton && selected && (
                    <TrackButton
                        animeId={anime.id}
                        animeTitle={anime.title}
                        totalEpisodes={selected.totalEpisodes}
                        selected={selected}
                        closeSearchMode={closeSearchMode}
                        supportsPrivateTracking={tracker.supportsPrivateTracking}
                    />
                )}
            </DialogContent>
        </>
    );
};
