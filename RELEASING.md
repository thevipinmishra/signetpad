# Releasing SignetPad

SignetPad publishes as a single unscoped npm package: [`signetpad`](https://www.npmjs.com/package/signetpad).

## First publish

1. Confirm `pnpm check` is green on `main`.
2. Add an automation `NPM_TOKEN` as a GitHub Actions secret.
3. Publish once from a trusted machine or let the Release workflow publish:

   ```sh
   pnpm --filter signetpad build
   pnpm changeset publish
   ```

GitHub Actions can publish later releases with provenance when `NPM_TOKEN` is present. The
workflow opens a Version Packages PR from merged changesets and publishes when that PR lands.

## Routine releases

1. Contributors add a changeset in their pull request (`pnpm changeset`).
2. Merging to `main` lets the Release workflow open or update the Version Packages PR.
3. Review that PR, then merge it. Changesets publishes `signetpad` and pushes a git tag.

Do not publish `@signetpad/docs` or `@signetpad/examples`. They are private workspace apps.
