## [4.0.1](https://github.com/abordage/wakatime-box/compare/v4.0.0...v4.0.1) (2026-11-28)


### Bug Fixes

* **gist:** fit the AI card title and drop line counts ([bf1af3e](https://github.com/abordage/wakatime-box/commit/bf1af3e76a77e76a2e6f869542cd68be756751e7))

# [4.0.0](https://github.com/abordage/wakatime-box/compare/v3.0.1...v4.0.0) (2026-11-28)


* feat(gist)!: publish one card and default to AI models ([757d699](https://github.com/abordage/wakatime-box/commit/757d6991a193f59d510e8275f4202948d76e031c))


### BREAKING CHANGES

* A workflow that omits CARD now publishes the AI models card and renames the gist file. Set CARD to languages to keep the language card.

Rank models by lines added or removed. Leave the gist unchanged when the selected card has no rows.

## [3.0.1](https://github.com/abordage/wakatime-box/compare/v3.0.0...v3.0.1) (2026-11-04)


### Bug Fixes

* **wakatime:** read stats with an OAuth token ([4c1f1cd](https://github.com/abordage/wakatime-box/commit/4c1f1cdbf5e1e4ad66ca0cd8e92e89cf52d7bd79))

# [3.0.0](https://github.com/abordage/wakatime-box/compare/v2.1.1...v3.0.0) (2026-01-07)


* feat(project)!: migrate to ESM, Rollup, and Node 24 ([18a634d](https://github.com/abordage/wakatime-box/commit/18a634dd8eea79124cdb637fd9abf6e0a86f4646))


### BREAKING CHANGES

* Complete rewrite with modern tooling.

- Migrate from CommonJS to ESM modules
- Replace ncc with Rollup for bundling
- Upgrade to Node.js 24 runtime
- Refactor codebase into modular structure
- Update all dependencies to latest versions
- Add comprehensive CI/CD with semantic-release
- Improve configuration handling for local development

Users upgrading from v2:
- Update workflow to use abordage/wakatime-box@v3
- No changes required for input parameters
