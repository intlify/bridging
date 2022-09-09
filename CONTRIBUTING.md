# Contributing Guide

- [Contributing Guide](#contributing-guide)
  - [General Guidelines](#general-guidelines)
  - [Pull Request Guidelines](#pull-request-guidelines)
    - [Work Step Example](#work-step-example)
  - [Development Setup](#development-setup)
  - [Scripts](#scripts)
    - [`pnpm test`](#pnpm-test)
  - [Project Structure](#project-structure)
  - [Contributing Tests](#contributing-tests)
  - [Financial Contribution](#financial-contribution)
  - [Credits](#credits)

## General Guidelines

Thanks for understanding that English is used as a shared language in this repository.
Maintainers do not use machine translation to avoid miscommunication due to error in translation.
If description of issue / PR are written in non-English languages, those may be closed.

It is of course fine to use non-English language, when you open a PR to translate documents and communicates with other users in same language.

## Pull Request Guidelines

- The `main` branch is the latest stable version release. All development should be done in dedicated branches.

- Checkout a topic branch from the relevant branch, e.g. `main`, and merge back against that branch.

- Work in the `src` folder and **DO NOT** checkin `dist` in the commits.

- If adding new feature:

  - Add accompanying test case.
  - Provide convincing reason to add this feature. Ideally you should open a suggestion issue first and have it greenlighted before working on it.

- If fixing a bug:

  - Provide detailed description of the bug in the PR. Live demo preferred.
  - Add appropriate test coverage if applicable.

- It's OK to have multiple small commits as you work on the PR - we will let GitHub automatically squash it before merging.

- Make sure `pnpm test` passes. (see [development setup](#development-setup))

### Work Step Example

- Fork the repository from [intlify/bridging](https://github.com/intlify/bridging) !
- Create your topic branch from `main`: `git branch my-new-topic origin/main`
- Add codes and pass tests !
- Commit your changes: `git commit -am 'Add some topic'`
- Push to the branch: `git push origin my-new-topic`
- Submit a pull request to `main` branch of `intlify/bridging` repository !

## Development Setup

You will need [Node.js](http://nodejs.org) **version 14.16+**, and [PNPM](https://pnpm.io).

After cloning the repo, run:

```sh
$ pnpm i # install the dependencies of the project
```

A high level overview of tools used:

- [TypeScript](https://www.typescriptlang.org/) as the development language
- [Vite](https://vitejs.dev/) for bundling
- [Vitest](https://vitest.dev/) for testing
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io/) for code formatting

## Scripts

### `pnpm test`

The `test` script calls the following npm scripts:

- `test:i18n9:unit`: unit test `@intlify/vue-i18n-bridge` on vue-i18n v9
- `test:i18n8:unit`: unit test `@intlify/vue-i18n-bridge` on vue-i18n v8
- `test:router4:unit`: unit test `@intlify/vue-router-bridge` on vue-router v4
- `test:router3:unit`: unit test `@intlify/vue-router-bridge` on vue-router v3

## Project Structure

This repository employs a [monorepo](https://en.wikipedia.org/wiki/Monorepo) setup which hosts a number of associated packages under the `packages` directory:

- `vue-i18n-bridge`: Vue I18n bridging for Vue 2 & Vue 3
- `vue-router-bridge`: Vue Router bridging for Vue 2 & Vue 3

## Contributing Tests

Unit tests are collocated with directories named `test` on `examples/**/`. Consult the [Vitest docs](https://vitest.dev/api/) and existing test cases for how to write new test specs.

## Financial Contribution

As a pure community-driven project without major corporate backing, we also welcome financial contributions via GitHub Sponsors

- [Become a backer or sponsor on GitHub Sponsors](https://github.com/sponsors/kazupon)

Funds donated via GitHub Sponsors and Patreon go to support kazuya kawaguchi full-time work on Intlify.

## Credits

Thank you to all the people who have already contributed to Intlify project and my OSS work !
