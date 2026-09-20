# Contributing to SignetPad

Thanks for helping keep this toolkit small, typed, and portable.

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

## How the packages fit together

1. `@signetpad/core` owns stroke state, history, validation, and serialization.
2. Framework packages only translate host input into `begin` / `move` / `end`.
3. Renderers only draw `SignatureStroke[]`. They must not capture input.

Keep new features on the smallest layer that can own them. Do not add a Next.js or Nuxt
package unless the base React or Vue adapter cannot express the integration.

## Pull requests

- Keep the public controller contract stable unless the change is intentional and documented.
- Add or update tests next to the code you change.
- Update package READMEs or `apps/docs` when the public API or an integration pattern changes.
- Run `pnpm check` before you push.
- Use [changesets](https://github.com/changesets/changesets) for user-facing package changes:

  ```sh
  pnpm changeset
  ```

Internal apps (`@signetpad/docs`, `@signetpad/examples`) do not need a changeset.

## Code style

Prettier is the formatter. TypeScript is the linter: `strict`, `noUncheckedIndexedAccess`, and
`exactOptionalPropertyTypes` are on. Prefer small, dependency-free modules in `packages/core`.

## Releases

Maintainers follow [RELEASING.md](./RELEASING.md). First-time npm publishing also needs the
`@signetpad` npm org and an `NPM_TOKEN` repository secret.

## Reporting issues

- Bugs and API gaps: GitHub issues
- Security vulnerabilities: [SECURITY.md](./SECURITY.md)

By participating, you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md).
