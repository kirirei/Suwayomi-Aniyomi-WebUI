/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

import List from '@mui/material/List';
import ListSubheader from '@mui/material/ListSubheader';
import { useLingui } from '@lingui/react/macro';
import { TextSetting } from '@/base/components/settings/text/TextSetting.tsx';
import { NumberSetting } from '@/base/components/settings/NumberSetting.tsx';
import type { SelectSettingValue } from '@/base/components/settings/SelectSetting.tsx';
import { SelectSetting } from '@/base/components/settings/SelectSetting.tsx';
import { requestManager } from '@/lib/requests/RequestManager.ts';
import { makeToast } from '@/base/utils/Toast.ts';
import { LoadingPlaceholder } from '@/base/components/feedback/LoadingPlaceholder.tsx';
import { EmptyViewAbsoluteCentered } from '@/base/components/feedback/EmptyViewAbsoluteCentered.tsx';
import { defaultPromiseErrorHandler } from '@/lib/DefaultPromiseErrorHandler.ts';
import { getErrorMessage } from '@/lib/HelperFunctions.ts';
import { useAppTitle } from '@/features/navigation-bar/hooks/useAppTitle.ts';
import type { ServerSettings } from '@/features/settings/Settings.types.ts';
import { ExternalPlayerEngine } from '@/lib/graphql/generated/graphql-base.types.ts';

type AnimeSettingsType = Pick<
    ServerSettings,
    'localAnimeSourcePath' | 'ffmpegPath' | 'episodeMarkSeenThreshold' | 'externalPlayerEngine' | 'mpvPath' | 'vlcPath'
>;

/** The only settings exposed for now are ones that already affect real behavior - see ServerConfig.kt's ANIME group. */
export const AnimeSettings = () => {
    const { t } = useLingui();

    useAppTitle(t`Anime`);

    const serverSettings = requestManager.useGetServerSettings();
    const [mutateSettings] = requestManager.useUpdateServerSettings();

    if (serverSettings.loading) {
        return <LoadingPlaceholder />;
    }

    if (serverSettings.error) {
        return (
            <EmptyViewAbsoluteCentered
                message={t`Unable to load data`}
                messageExtra={getErrorMessage(serverSettings.error)}
                retry={() =>
                    serverSettings.refetch().catch(defaultPromiseErrorHandler('AnimeSettings::refetchServerSettings'))
                }
            />
        );
    }

    const animeSettings = serverSettings.data!.settings;

    const updateSetting = <Setting extends keyof AnimeSettingsType>(
        setting: Setting,
        value: AnimeSettingsType[Setting],
    ): Promise<any> => {
        const mutation = mutateSettings({ variables: { input: { settings: { [setting]: value } } } });
        mutation.catch((e) => makeToast(t`Failed to save changes`, 'error', getErrorMessage(e)));

        return mutation;
    };

    return (
        <List sx={{ pt: 0 }}>
            <TextSetting
                settingName={t`Local anime location`}
                dialogDescription={t`The path to the directory on the server where local anime folders are read from, mirroring Aniyomi's "localanime" folder`}
                value={animeSettings?.localAnimeSourcePath}
                settingDescription={
                    animeSettings?.localAnimeSourcePath.length ? animeSettings.localAnimeSourcePath : t`Default`
                }
                handleChange={(path) => updateSetting('localAnimeSourcePath', path)}
            />
            <TextSetting
                settingName={t`ffmpeg path`}
                dialogDescription={t`Path to the ffmpeg executable, used to remux or transcode video containers/codecs the browser can't play directly`}
                value={animeSettings?.ffmpegPath}
                settingDescription={animeSettings?.ffmpegPath ?? 'ffmpeg'}
                handleChange={(path) => updateSetting('ffmpegPath', path)}
            />
            <NumberSetting
                settingTitle={t`Mark episode as seen threshold`}
                dialogDescription={t`How far into an episode playback must reach before it's automatically marked as seen`}
                settingValue={`${Math.round((animeSettings?.episodeMarkSeenThreshold ?? 0.9) * 100)}%`}
                value={animeSettings?.episodeMarkSeenThreshold ?? 0.9}
                defaultValue={0.9}
                minValue={0.5}
                maxValue={1}
                stepSize={0.05}
                showSlider
                valueUnit=""
                handleUpdate={(value) => updateSetting('episodeMarkSeenThreshold', value)}
            />
            <List
                subheader={
                    <ListSubheader component="div" id="anime-settings-external-player">
                        {t`External player`}
                    </ListSubheader>
                }
            >
                <SelectSetting<ExternalPlayerEngine>
                    settingName={t`Engine`}
                    value={animeSettings?.externalPlayerEngine ?? ExternalPlayerEngine.Auto}
                    values={
                        [
                            [ExternalPlayerEngine.Auto, { text: t`Auto (try mpv, then VLC)` }],
                            [ExternalPlayerEngine.Mpv, { text: t`mpv` }],
                            [ExternalPlayerEngine.Vlc, { text: t`VLC` }],
                        ] satisfies SelectSettingValue<ExternalPlayerEngine>[]
                    }
                    handleChange={(value) => updateSetting('externalPlayerEngine', value)}
                />
                <TextSetting
                    settingName={t`mpv path`}
                    dialogDescription={t`Path to the mpv executable`}
                    value={animeSettings?.mpvPath}
                    settingDescription={animeSettings?.mpvPath ?? 'mpv'}
                    handleChange={(path) => updateSetting('mpvPath', path)}
                />
                <TextSetting
                    settingName={t`VLC path`}
                    dialogDescription={t`Path to the VLC executable`}
                    value={animeSettings?.vlcPath}
                    settingDescription={animeSettings?.vlcPath ?? 'vlc'}
                    handleChange={(path) => updateSetting('vlcPath', path)}
                />
            </List>
        </List>
    );
};
