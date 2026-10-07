# Security policy

## Supported versions

The latest published `0.x` release line of `signetpad` receives security fixes.

## Reporting a vulnerability

Do **not** open a public issue for security reports.

- Prefer [GitHub Security Advisories](https://github.com/thevipinmishra/signetpad/security/advisories/new)
- Or email [thevipinmishra@gmail.com](mailto:thevipinmishra@gmail.com) with a description, impact,
  and a reproduction if you have one

You should receive an acknowledgement within 7 days. If we accept the report, we will work on a
fix and credit you unless you ask otherwise.

## Notes for integrators

`toSvg()` escapes attribute values. It rejects paint values that are not plain CSS colors.

Canvas rendering also checks stroke colors before paint. Host apps still treat signature payloads
as untrusted user input when they store or render them in HTML. Prefer the provided serializers.
Do not build SVG with string concatenation from raw user colors.

Payload limits reject oversized `loadData()` input. Tune `limits` for your threat model.
