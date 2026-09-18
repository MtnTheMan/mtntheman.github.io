# Public package

Derived from the governed interactive-map package for decision DEC-NHPA-W002-T03-2026-09-18-01.

The public transform changes only transport packaging: the 416 cell-detail JSON chunks are gzip-compressed as .jsonz and decompressed in the browser on demand. Raster tiles, values, layer defaults, claim boundaries, and interface content are unchanged. No confidential camera coordinates, raw source archives, credentials, restricted interviews, or local absolute paths are included.

Rebuild from the canonical package with:

    node scripts/build-nhpa-deer-public-package.mjs <source-package> assets/maps/northern-hardwood-deer-relative-v1

The authoritative public integrity record is public_package_manifest.csv. source_package_manifest.csv records the pre-transform governed package and is retained for lineage.
