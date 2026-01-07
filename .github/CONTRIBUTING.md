# Contributing to WakaTime Box

Thank you for your interest in contributing to WakaTime Box! This document provides guidelines for contributing to the project.

## Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for automated versioning and changelog generation.

### Commit Format

```text
<type>(scope): <description>

[optional body]

[optional footer(s)]
```

### Commit Types

| Type       | Description                  | Release Impact                 |
|------------|------------------------------|--------------------------------|
| `feat`     | New features                 | Minor release (1.0.0 -> 1.1.0) |
| `fix`      | Bug fixes                    | Patch release (1.0.0 -> 1.0.1) |
| `perf`     | Performance improvements     | No release                     |
| `refactor` | Code refactoring             | No release                     |
| `docs`     | Documentation changes        | No release                     |
| `style`    | Code style changes           | No release                     |
| `test`     | Test additions/modifications | No release                     |
| `chore`    | Maintenance tasks            | No release                     |
| `ci`       | CI/CD changes                | No release                     |

### Scopes for WakaTime Box

| Scope      | Description                   |
|------------|-------------------------------|
| `action`   | GitHub Action configuration   |
| `wakatime` | WakaTime API logic            |
| `gist`     | Gist generation and update    |
| `config`   | Configuration and inputs      |
| `format`   | Statistics formatting         |
| `summary`  | GitHub Actions summary output |
| `deps`     | Dependencies                  |
| `project`  | Project-wide changes          |

### Examples

```bash
# New features
feat(action): add custom gist title support
feat(wakatime): add yearly statistics support
feat(format): add new display format option

# Bug fixes
fix(wakatime): resolve API authentication issue
fix(gist): fix date formatting
fix(config): handle missing environment variables

# Documentation
docs(readme): update usage examples
docs: add contributing guidelines

# Breaking changes
feat(action)!: rename input parameters

BREAKING CHANGE: Input names changed from INPUT_* to standard format.
Users must update their workflow files.
```

## Release Process

Our releases are fully automated using [semantic-release](https://github.com/semantic-release/semantic-release):

1. **Push commits** to `main` branch with conventional commit messages
2. **GitHub Actions** automatically analyzes commit messages
3. **Determines release type** (patch/minor/major) based on commit types
4. **Creates Git tag** with new version number
5. **Generates CHANGELOG.md** with grouped changes
6. **Creates GitHub Release** with release notes

### Release Types

- **Patch** (1.0.0 → 1.0.1): Only `fix` commits
- **Minor** (1.0.0 → 1.1.0): Contains `feat` commits
- **Major** (1.0.0 → 2.0.0): Contains breaking changes (`feat!`, `fix!`, or `BREAKING CHANGE:`)

## Development Workflow

### 1. Clone and Setup

```bash
git clone https://github.com/abordage/wakatime-box.git
cd wakatime-box
npm ci
```

### 2. Create Feature Branch

```bash
git checkout -b feature/add-new-feature
```

### 3. Development

```bash
# Run in development mode
npm run dev

# Or run once
npm run start

# Check types
npm run typecheck

# Lint code
npm run lint
npm run lint:fix
```

### 4. Build

```bash
npm run build
```

### 5. Commit Changes

Use conventional commit messages:

```bash
git commit -m "feat(wakatime): add monthly statistics support"
```

### 6. Push and Create PR

```bash
git push origin feature/add-new-feature
```

Create PR to `main` branch.

## Local Testing

Create `.env` file based on `.env.example`:

```bash
cp .env.example .env
```

Fill in required values:

```env
GH_TOKEN=your_github_token
GIST_ID=your_gist_id
WAKA_API_KEY=your_wakatime_api_key
```

Run locally:

```bash
npm run start
```

## Pull Request Guidelines

### PR Title

Use conventional commit format:

```text
feat(gist): add custom date format option
```

### PR Checklist

- [ ] Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/)
- [ ] Code passes `npm run lint` and `npm run typecheck`
- [ ] Build succeeds with `npm run build`
- [ ] Changes are documented (if needed)
- [ ] Tested locally with `npm run start`

## Bug Reports

When reporting bugs, please include:

- WakaTime Box version
- Node.js version
- GitHub Actions runner OS
- Steps to reproduce
- Expected vs. actual behavior
- Error messages or logs

## Getting Help

- **Issues**: Use GitHub Issues for bug reports
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Documentation**: Check README.md

Thank you for contributing to WakaTime Box!

