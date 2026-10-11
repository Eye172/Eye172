# GitHub statistics

The profile cards refresh daily using GitHub Actions. The date printed on each card is the last successful refresh in UTC. A failed fetch keeps the last successful snapshot.

- **Contributions / active days:** GitHub GraphQL's `contributionCalendar`, using the account's default last-year interval. Active days have at least one contribution. Anonymized private contributions are enabled on this profile and included in the total; private repository names and code are not collected. This follows GitHub's attribution rules; it does not count every commit ever made or claim to measure effort. Cards are dated daily snapshots, so new contributions may appear in the live calendar before the next refresh.
- **Code repositories:** non-empty, public, non-fork repositories owned by Eye172. The profile repository and repositories ending in `-showcase` are excluded. Historical public projects are included.
- **Language mix:** sum of GitHub's reported language byte counts across those code repositories, shown as percentages of the combined total. The five largest entries appear individually and remaining entries are grouped as Other. These are code composition figures, not time spent or proficiency scores. Generated or vendored files follow GitHub Linguist's classifications.

Sources: [GitHub contribution calendar API](https://docs.github.com/en/graphql/reference/users#contributioncalendar), [GitHub language API](https://docs.github.com/en/rest/repos/repos#list-repository-languages). [Current snapshot](../widgets/stats.json).

Run `node build-stats.mjs` with `GITHUB_TOKEN` to refresh, or `node build-stats.mjs --offline` to render the saved snapshot without network access. A local calendar export can be supplied with `--calendar <export.json>`. No personal token or external widget service is required for automation. The workflow uses its repository-scoped GitHub token for the public GraphQL/REST data and publishing the generated cards. It cannot read other private repositories.
