# Releasing SignetPad

SignetPad publishes as a single unscoped npm package: [`signetpad`](https://www.npmjs.com/package/signetpad).

## First publish

From `main`, after `npm login`:

```sh
pnpm run publish
```

That builds `packages/signetpad` and publishes it to npm.

## Routine releases

1. Contributors add a changeset in their pull request (`pnpm changeset`).
2. On a trusted machine, from `main`:

   ```sh
   pnpm install
   pnpm check
   pnpm changeset version
   git add -A && git commit -m "chore: version packages"
   pnpm run publish
   git push --follow-tags
   ```

Do not publish `@signetpad/docs` or `@signetpad/examples`. They are private workspace apps.
