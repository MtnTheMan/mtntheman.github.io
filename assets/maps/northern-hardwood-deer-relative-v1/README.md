# Portable NHPA deer relative-observation map

This package implements decision `DEC-NHPA-W002-T03-2026-09-18-01`. It is a relative-observation map, not deer density.

Start locally from this directory:

`node serve.js`

Then open `http://127.0.0.1:8765`. A local server is required because the browser loads partitioned cell-detail assets on demand. No external network service is used.

The package uses offline Leaflet, zoom 3–6 XYZ raster tiles, 2-degree cell-detail JSON partitions, and a small experimental 1-km QA GeoJSON. Exact camera coordinates are omitted. Rebuild with `scripts/NHPA-W002-T03/build_interactive_deer_map.R`.
