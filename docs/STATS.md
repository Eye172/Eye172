# GitHub statistics

The profile cards refresh daily using GitHub Actions. The date printed on each card is the last successful refresh in UTC. A failed fetch keeps the last successful snapshot.

- **Contributions / active days:** the public GitHub profile contribution calendar over its displayed last-year interval. Active days have at least one contribution. This follows GitHub's attribution rules; it does not count every commit ever made or claim to measure effort. Only the anonymously visible profile data is used.
- **Code repositories:** non-empty, public, non-fork repositories owned by Eye172. The profile repository and repositories ending in `-showcase` are excluded. Historical public projects are included.
- **Language mix:** sum of GitHub's reported language byte counts across those code repositories, shown as percentages of the combined total. The five largest entries appear individually and remaining entries are grouped as Other. These are code composition figures, not time spent or proficiency scores. Generated or vendored files follow GitHub Linguist's classifications.

Sources: [public contribution calendar](https://github.com/users/Eye172/contributions), [GitHub language API](https://docs.github.com/en/rest/repos/repos#list-repository-languages). [Current snapshot](../widgets/stats.json).

Run `node build-stats.mjs` to refresh or `node build-stats.mjs --offline` to render the saved snapshot without network access. No personal token or external widget service is required. The workflow uses its repository-scoped GitHub token for public REST requests and publishing the generated cards.
