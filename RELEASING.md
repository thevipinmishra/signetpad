# Releasing SignetPad

Published packages live under the `@signetpad` npm scope and are released together.

## First publish

1. Create the [`@signetpad` npm org](https://www.npmjs.com/org/create) if it does not exist.
2. Add an automation `NPM_TOKEN` with permission to publish that scope.
3. Store the token as the `NPM_TOKEN` GitHub Actions secret.
4. Confirm `pnpm check` is green on `main`.
5. Merge a release pull request from Changesets, or publish once locally:

   ```sh
   pnpm build
   pnpm changeset publish
   ```

GitHub Actions can publish later releases with provenance when `NPM_TOKEN` is present. The
workflow opens a Version Packages PR from merged changesets and publishes when that PR lands.

## Routine releases

1. Contributors add a changeset in their pull request (`pnpm changeset`).
2. Merging to `main` lets the Release workflow open or update the Version Packages PR.
3. Review that PR, then merge it. Changesets publishes `@signetpad/*` and pushes git tags.

Do not publish `@signetpad/docs` or `@signetpad/examples`. They are private workspace apps.
