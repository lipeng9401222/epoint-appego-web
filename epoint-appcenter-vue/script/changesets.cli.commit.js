module.exports = {
  async getAddMessage(changeset, options) {
    const skipCI =
      'add' === (null == options ? undefined : options.skipCI) ||
      !0 === (null == options ? undefined : options.skipCI);
    return `chore(changeset): :hammer: ${changeset.summary}${
      skipCI ? '\n\n[skip ci]\n' : ''
    }`;
  },
  async getVersionMessage(releasePlan, options) {
    const skipCI =
        'version' === (null == options ? undefined : options.skipCI) ||
        !0 === (null == options ? undefined : options.skipCI),
      publishableReleases = releasePlan.releases.filter(
        (release) => 'none' !== release.type
      ),
      numPackagesReleased = publishableReleases.length,
      releasesLines = publishableReleases
        .map((release) => `  ${release.name}@${release.newVersion}`)
        .join('\n');
    return `release: Releasing ${numPackagesReleased} package(s)

Releases:
${releasesLines}
${skipCI ? '\n[skip ci]\n' : ''}
`;
  },
};
