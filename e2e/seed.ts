/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

/**
 * Seeds the real backend the e2e suite points at (see SERVER_URL) with genuine data through the
 * same GraphQL mutations the app itself uses - a real anime extension repo, a real installed
 * extension, a real anime added to the library with its episode list fetched. This is deliberately
 * not mocked: the whole point of this suite is to prove the UI renders real server data, matching
 * what a user hitting the packaged app would see, not a canned fixture that could drift from reality.
 */

const SERVER_URL = process.env.SERVER_URL ?? 'http://127.0.0.1:15000';
const ANIME_REPO_URL = 'https://raw.githubusercontent.com/yuzono/anime-repo/repo/index.min.json';

async function graphQL<T>(query: string, variables: Record<string, unknown> = {}): Promise<T> {
    const response = await fetch(`${SERVER_URL}/api/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
        throw new Error(`GraphQL request failed with HTTP ${response.status}: ${await response.text()}`);
    }

    const json = await response.json();
    if (json.errors) {
        throw new Error(`GraphQL response had errors: ${JSON.stringify(json.errors)}`);
    }

    return json.data as T;
}

export async function seedRealAnimeAndManga(): Promise<void> {
    await graphQL(
        `mutation($indexUrl: String!) { addAnimeExtensionStore(input: { indexUrl: $indexUrl }) { extensionStore { indexUrl } } }`,
        { indexUrl: ANIME_REPO_URL },
    );

    await graphQL(`mutation { fetchAnimeExtensions(input: {}) { extensions { pkgName isInstalled } } }`);

    const { animeExtensions } = await graphQL<{
        animeExtensions: { pkgName: string; isNsfw: boolean; lang: string }[];
    }>(`query { animeExtensions { pkgName isNsfw lang } }`);
    // Excludes the always-present, always-listed-first local-folder pseudo-extension (mirrors
    // manga's LocalSource) - it's non-NSFW too, so a naive "first non-NSFW" pick grabs it instead
    // of a real network extension and then finds no popular anime under it.
    const installCandidates = animeExtensions.filter(
        (extension) => !extension.isNsfw && extension.lang !== 'localsourcelang',
    );
    if (!installCandidates.length) {
        throw new Error('No installable (non-local, non-NSFW) anime extensions were listed by the seeded repo.');
    }

    // Not every extension in the repo is guaranteed to actually resolve real content right now
    // (geo-blocking, upstream site changes) - install candidates one at a time until one works,
    // instead of hardcoding a single extension name that could silently rot.
    let source: { id: string; name: string } | undefined;
    let anime: { id: number; title: string } | undefined;
    const attemptCount = Math.min(installCandidates.length, 20);
    for (const candidate of installCandidates.slice(0, attemptCount)) {
        try {
            // eslint-disable-next-line no-await-in-loop
            await graphQL(
                `mutation($id: String!) { updateAnimeExtension(input: { id: $id, patch: { install: true } }) { extension { pkgName isInstalled } } }`,
                {
                    id: candidate.pkgName,
                },
            );

            // eslint-disable-next-line no-await-in-loop
            const { animeSources } = await graphQL<{ animeSources: { id: string; name: string }[] }>(
                `query { animeSources { id name } }`,
            );
            const newestSource = animeSources[animeSources.length - 1];
            if (!newestSource) {
                continue;
            }

            // eslint-disable-next-line no-await-in-loop
            const { popularAnimeList } = await graphQL<{
                popularAnimeList: { animeList: { id: number; title: string }[] };
            }>(
                `query($sourceId: LongString!) { popularAnimeList(sourceId: $sourceId, page: 1) { animeList { id title } } }`,
                { sourceId: newestSource.id },
            );
            if (popularAnimeList.animeList.length) {
                source = newestSource;
                [anime] = popularAnimeList.animeList;
                break;
            }

            // eslint-disable-next-line no-await-in-loop
            await graphQL(
                `mutation($id: String!) { updateAnimeExtension(input: { id: $id, patch: { uninstall: true } }) { extension { pkgName } } }`,
                {
                    id: candidate.pkgName,
                },
            );
        } catch (error) {
            // This extension failed to install, or its site is unreachable/broken right now
            // (real conditions this repo's extension list can hit) - log and try the next candidate.
            process.stderr.write(
                `Skipping "${candidate.pkgName}": ${error instanceof Error ? error.message : error}\n`,
            );
        }
    }
    if (!source || !anime) {
        throw new Error(`None of the first ${attemptCount} anime extensions returned any popular anime to seed with.`);
    }

    await graphQL(
        `mutation($id: Int!) { updateAnime(input: { id: $id, patch: { inLibrary: true } }) { anime { id title inLibrary } } }`,
        {
            id: anime.id,
        },
    );

    await graphQL(`query($animeId: Int!) { episodes(animeId: $animeId, onlineFetch: true) { id name } }`, {
        animeId: anime.id,
    });

    process.stdout.write(`Seeded anime: "${anime.title}" (id=${anime.id}) from source "${source.name}"\n`);
}

seedRealAnimeAndManga()
    .then(() => process.exit(0))
    .catch((error) => {
        process.stderr.write(`${error instanceof Error ? error.stack : error}\n`);
        process.exit(1);
    });
