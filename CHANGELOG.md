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
