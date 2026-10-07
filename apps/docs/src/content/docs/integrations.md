---
title: Integrations
description: Import paths for React, Vue, Svelte, Solid, Angular, and React Native.
section: integrations
order: 30
---

Install `signetpad` once. Import the entry for your app.

| App                | Import                       | Start with                  | Guide                              |
| ------------------ | ---------------------------- | --------------------------- | ---------------------------------- |
| React, Vite, Remix | `signetpad/react`            | `<SignaturePad />`          | [React](/docs/react)               |
| Next.js            | `signetpad/react`            | Client `<SignaturePad />`   | [Next.js](/docs/nextjs)            |
| Vue 3, Nuxt        | `signetpad/vue`              | `<SignaturePad />`          | [Vue](/docs/vue)                   |
| Svelte, SvelteKit  | `signetpad/svelte`           | Action or `.svelte` field   | [Svelte](/docs/sveltekit)          |
| Solid              | `signetpad/solid`            | `useSignaturePad`           | [Solid](/docs/solid)               |
| Angular            | `signetpad/angular`          | `attachAngularSignaturePad` | [Angular](/docs/angular)           |
| React Native       | `signetpad/react-native-svg` | `<SignaturePad />`          | [React Native](/docs/react-native) |
| Custom canvas      | `signetpad/canvas`           | `attachCanvasRenderer`      | [API](/docs/api)                   |
| Headless RN input  | `signetpad/react-native`     | `useSignaturePad`           | [React Native](/docs/react-native) |

There is no Next.js or Nuxt package. Use the React or Vue field inside a client boundary.
