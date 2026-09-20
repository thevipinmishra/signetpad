---
title: Integrations
description: Import paths for React, Vue, Svelte, and React Native.
section: integrations
order: 30
---

Install `signetpad` once. Import the entry for your app.

| App                | Import                       | Start with                   | Guide                              |
| ------------------ | ---------------------------- | ---------------------------- | ---------------------------------- |
| React, Vite, Remix | `signetpad/react`            | `<SignaturePad />`           | [React](/docs/react)               |
| Next.js            | `signetpad/react`            | Client `<SignaturePad />`    | [Next.js](/docs/nextjs)            |
| Vue 3, Nuxt        | `signetpad/vue`              | `<SignaturePad />`           | [Vue](/docs/vue)                   |
| Svelte, SvelteKit  | `signetpad/svelte`           | `createSignaturePadAction()` | [Svelte](/docs/sveltekit)          |
| React Native       | `signetpad/react-native-svg` | `<SignaturePad />`           | [React Native](/docs/react-native) |

There is no Next.js or Nuxt package. Use the React or Vue field inside a client boundary.
