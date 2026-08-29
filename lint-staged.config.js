/*
 * Copyright (C) Contributors to the Suwayomi project
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/.
 */

// oxfmt is configured (.oxfmtrc.json) to ignore .github/** entirely. When every staged
// file matching a glob below happens to live under .github/, passing them to `oxfmt
// --write` anyway leaves oxfmt with zero non-ignored targets, and it exits with an error
// instead of a no-op ("Expected at least one target file"). Filter those paths out here
// so lint-staged doesn't invoke oxfmt on files it's already told to skip.
const excludingGithubWorkflows = (files) => files.filter((file) => !file.split(/[\\/]/).includes('.github'));

export default {
    '*.{ts,tsx,js,jsx}': ['oxfmt --write', 'oxlint --fix', () => `pnpm i18n:extract`, 'git add src/i18n/locales/*.po'],
    '*.{json,md,yml,yaml,css,scss,html,graphql}': (files) => {
        const targets = excludingGithubWorkflows(files);
        return targets.length ? `oxfmt --write ${targets.join(' ')}` : [];
    },
    '*.{ts,tsx,json}': () => 'pnpm tsc',
};
