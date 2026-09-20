# Security policy

## Supported versions

The latest published `0.x` release line of `@signetpad/*` receives security fixes.

## Reporting a vulnerability

Please do **not** open a public issue for security reports.

- Prefer [GitHub Security Advisories](https://github.com/thevipinmishra/signetpad/security/advisories/new)
- Or email [thevipinmishra@gmail.com](mailto:thevipinmishra@gmail.com) with a description, impact,
  and a reproduction if you have one

You should receive an acknowledgement within 7 days. If the report is accepted, we will work on a
fix and credit you unless you ask otherwise.

## Notes for integrators

`toSvg()` escapes attribute values, but host apps still need to treat signature payloads as
untrusted user input when storing or rendering them in HTML. Prefer the provided serializers over
string concatenation.
