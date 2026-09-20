# Contributing to SignetPad

Thanks for helping keep SignetPad small, typed, and portable.

## Local setup

This is a pnpm + Turborepo workspace. Node.js 18.17+ is required.

```sh
pnpm install
pnpm check
```

`pnpm check` runs format, typecheck, tests, and the package builds.

Useful app commands:

```sh
pnpm --filter @signetpad/docs dev
pnpm --filter @signetpad/examples dev
```

## How the package fits together

`packages/signetpad` is the only published package. Dedicated import paths keep unused code out of
app bundles:

1. `signetpad` owns stroke state, history, validation, and serialization.
2. `signetpad/react`, `signetpad/vue`, `signetpad/svelte`, and `signetpad/react-native` translate host input into `begin` / `move` / `end`. Ready-made `SignaturePad` components (and the Svelte canvas action) also paint for you.
3. `signetpad/canvas` and `signetpad/react-native-svg` draw `SignatureStroke[]` when you bring your own surface.

Keep new features on the smallest entry that can own them. Do not add a Next.js or Nuxt
import path unless the base React or Vue adapter cannot express the integration.

## Pull requests

- Keep the public controller contract stable unless the change is intentional and documented.
- Add or update tests next to the code you change.
- Update the README or `apps/docs` when the public API or an integration pattern changes.
- Run `pnpm check` before you push.
- Use [changesets](https://github.com/changesets/changesets) for user-facing package changes:

  ```sh
  pnpm changeset
  ```

Internal apps (`@signetpad/docs`, `@signetpad/examples`) do not need a changeset.

## Code style

Prettier is the formatter. TypeScript is the linter: `strict`, `noUncheckedIndexedAccess`, and
`exactOptionalPropertyTypes` are on. Prefer small, dependency-free modules in the SignetPad core.

## Releases

Maintainers follow [RELEASING.md](./RELEASING.md). Publishing needs an `NPM_TOKEN` repository
secret. There is no npm organization; the package name is `signetpad`.

## Reporting issues

- Bugs and API gaps: GitHub issues
- Security vulnerabilities: [SECURITY.md](./SECURITY.md)

By participating, you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md).
