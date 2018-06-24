#!/usr/bin/env ts-node

// If the version in package.json is less than or equal to
// the published version on npm, set the version to a patch
// on top of the npm version so we can publish.

import * as shell from "shelljs";
const compareVersions = require("compare-versions");

function exec(command: string) {
    const result = shell.exec(command, { silent: true });
    return (result.stdout as string).trim();
}

const PUBLISHED = (() => {
    // Get the highest published version of any tag
    const all = JSON.parse(exec(`npm show autotune versions --json`));
    return all[all.length - 1];
})();

const CURRENT = exec(`npm version`).match(/autotune: '(.+)'/)![1];

switch (compareVersions(CURRENT, PUBLISHED)) {
    case -1:
        console.error(`* package.json version is ${CURRENT} but ${PUBLISHED} is published. Patching...`);
        exec(`npm version ${PUBLISHED} --force --no-git-tag-version`);
        shell.exec(`npm version patch --no-git-tag-version`);
        break;
    case 0:
        console.error(`* package.json version is ${CURRENT} but ${PUBLISHED} is published. Patching...`);
        shell.exec(`npm version patch --no-git-tag-version`);
        break;
    default:
        // Greater than published, nothing to do
        break;
}
