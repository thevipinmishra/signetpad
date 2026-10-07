# Changelog

This file lists notable changes to SignetPad.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). This project follows
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added

- `signetpad/solid` hook and `signetpad/angular` canvas attach helper
- Svelte `SignaturePad.svelte` component export
- Optional `pressureWidth` and `curveFitting` behavior flags
- Payload `limits` for strokes, points, and undo history
- Public `assertCssColor` helper

### Changed

- Named CSS colors use a small closed allowlist
- Canvas renderer validates stroke colors before paint

## [0.1.0] - 2026-09-20

### Added

- Single `signetpad` package with dedicated import paths
- Headless controller with stroke history, validation, snapshots, and SVG export
- Framework adapters for React, React Native, Vue 3, and Svelte
- Canvas 2D and React Native SVG renderers
- Documentation site and React example app

[0.1.0]: https://github.com/thevipinmishra/signetpad/releases/tag/v0.1.0
