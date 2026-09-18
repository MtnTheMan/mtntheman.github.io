---
layout: default
title: Northern Hardwood deer relative-observation map v1
permalink: /northern-hardwood-deer-relative-v1-technical-methods/
excerpt: Objectives, evidence, methods, validation, uncertainty, claim boundaries, and provenance for the 5-km deer relative-observation benchmark.
---

<style>
  #content { max-width: 1120px; }
  #content table { border-collapse: collapse; display: block; margin: 1rem 0 1.4rem; max-width: 100%; overflow-x: auto; width: max-content; }
  #content th, #content td { border: 1px dotted #00FF00; padding: 0.48rem 0.58rem; text-align: left; vertical-align: top; }
  #content th { background-color: #252504; }
  #content h2 { margin-top: 2.25rem; }
  #content h3 { margin-top: 1.65rem; }
  .nhr-note { background-color: #252504; border: 2px dotted #00FF00; margin: 1rem 0 1.4rem; padding: 0.9rem 1rem; }
  .nhr-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 1rem 0 1.5rem; }
  .nhr-actions a { border: 2px outset #00FF00; padding: 0.45rem 0.7rem; }
  .nhr-flow { background-color: #252504; border: 1px dotted #00FF00; line-height: 1.7; margin: 1rem 0 1.4rem; padding: 0.9rem 1rem; }
</style>

<div class="nhr-actions">
  <a href="/assets/maps/northern-hardwood-deer-relative-v1/">Open the interactive map</a>
  <a href="/assets/maps/northern-hardwood-deer-relative-v1/public_package_manifest.csv">Public package manifest</a>
  <a href="/projects.html">Return to projects</a>
</div>

<div class="nhr-note"><strong>Interpretation limit:</strong> this is a Tier-3 relative camera-observation benchmark, not population density, absolute abundance, deer/km2, browse damage, or a management-performance score. Unsupported or unsurveyed does not mean zero deer.</div>

# Version 1 methods and documentation

**Released:** 2026-09-18  
**Decision:** DEC-NHPA-W002-T03-2026-09-18-01  
**Displayed year:** 2024  
**Native/reporting support:** structured camera deployments and native-unit evidence; approximately 5-km grid cells are computational prediction/reporting support, not native 5-km measurements  
**Status:** governed relative-observation release with explicit support, uncertainty, extrapolation, provenance, and monitoring-priority companions

## Objective and intended construct

The long-term scientific target is annual white-tailed deer density on October 1, before the primary firearms harvest, expressed as animals per square kilometre of terrestrial land excluding permanent open water. The available evidence does not identify that absolute estimand consistently across the binational domain. Agency estimates differ in season, denominator, method, uncertainty, and native geography, while camera detections and opportunistic occurrence records do not directly measure abundance.

Version 1 therefore publishes the supported intermediate product: a relative camera-observation benchmark. It answers where the fitted observation process predicts higher or lower standardized encounter probability, while showing where that pattern is well supported, uncertain, extrapolated, or unsupported. It does not convert the index into deer/km2.

## How to use the map

The safest default view combines three independent layers:

1. **Relative baseline** - the accepted 2024 camera-only benchmark.
2. **Evidence support / extrapolation** - the governed four-class interpretation mask.
3. **Country and border context** - majority-country assignment while retaining exact U.S./Canada overlap and a border flag.

Additional independent layers show uncertainty interval width, source support and age, the downstream northern-hardwood/reporting relationship, and monitoring priority. Click or move across the map to inspect the nearest governed 5-km cell. Zoom is intentionally limited to prevent parcel-scale or site-scale interpretation. The optional 1-km layer is alignment and QA geometry only; it is not a deer surface.

## Evidence streams and roles

| Evidence stream | Evidence class | Role in this release | Claim boundary |
|---|---|---|---|
| SNAPSHOT USA 2019-2023 and 2024 | Structured camera detections and effort | Baseline detection and camera-night count models | Detections and valid-effort zero detections are observation outcomes, not density or confirmed absence |
| GBIF/iNaturalist white-tailed deer | Presence-only occurrence records | Target-group-controlled sensitivity/augmentation branch | Spatial-pattern sensitivity only; cannot establish abundance |
| GBIF/iNaturalist Mammalia | Same-platform reporting-effort control | Conditions the presence-only deer signal | Effort proxy, not deer evidence or absence data |
| Agency and designed-survey estimates | Native-support population evidence | Separate Tier-2 context and future calibration audit | Retained at native support; not painted into 5-km cells or used to force October-1 density |
| Harvest and hunter effort | Auxiliary population/observation evidence | Future observation-model and timing work | Harvest counts cannot be divided into density without a validated abundance and effort model |
| U.S.-Canada range and reporting geometries | Domain and downstream reporting support | Defines modelable domain, border context, and later reporting relationships | Reporting overlays do not define the ecological prediction domain |

The accepted observation streams include 12,806 unique SNAPSHOT deployments, 1,328,027 unique camera sequences, 289,829 white-tailed deer occurrence records, and 2,645,646 paired Mammalia effort-control records. Exact camera locations are excluded from the public package.

## Production workflow

<div class="nhr-flow"><strong>Workflow:</strong> verify immutable source files and licences -> normalize deployments, sequences, occurrences, dates, and effort -> preserve native support and missingness -> fit the camera-only baseline -> fit a paired target-group occurrence sensitivity -> validate by time, contiguous spatial blocks, and held-out regions -> compare 5-km and 10-km behavior -> build uncertainty, source-support, extrapolation, country/border, reporting, and monitoring layers -> assemble and browser-test the portable public package.</div>

The baseline uses structured SNAPSHOT camera detections and camera-night effort without presence-only records. A separate augmented branch adds the white-tailed deer occurrence signal conditioned on same-platform Mammalia records. Alternate effort surfaces use all Mammalia, non-deer Mammalia, and unique observer counts. Human population is never used as a divisor.

The target-group augmentation performs worse than the camera-only baseline in contiguous-band spatial transfer (mean AUC 0.512 versus 0.577), so it remains a sensitivity component rather than evidence of spatial portability. The displayed baseline is the safer camera-only branch.

## Validation, uncertainty, and extrapolation

Validation includes a 2024 temporal holdout, five contiguous longitude-band folds, leave-year-out and leave-region-out checks, alternate effort surfaces, baseline-versus-augmentation ablation, and 5-km-versus-10-km stability checks. Companion products keep uncertainty, source leverage, coverage, extrapolation, and missingness distinct.

The support mask has four interpretation classes: supported, caution, high extrapolation within the camera envelope, and unsurveyed/unsupported. High-extrapolation and unsupported cells remain visible to expose evidence gaps; their apparent local variation should not be interpreted as reliable ecology. Environmental novelty is not reported because no governed environmental predictor stack was available.

## Five-kilometre support and the 1-km QA pilot

The approximately 5-km lattice is the accepted computational prediction and reporting support. Camera deployments, occurrence points, agency units, designed-survey areas, and other evidence retain their native supports. Aggregation never turns them into native 5-km measurements.

The aligned 1-km pilot contains 900 child polygons used to test deterministic nesting, area reconciliation, identifiers, and future predictor contracts. It does not contain a 1-km deer estimate. Promotion to a finer deer surface would require a governed environmental predictor stack, refitting rather than disaggregation, independent validation, acceptable uncertainty and residual behavior, and a new release decision.

## Country and Canadian evidence

Each cell retains U.S. and Canadian overlap areas, majority-country assignment, and a border flag. Majority assignment does not erase cross-border support. Country-specific diagnostics are shown only when pre-specified sample-size and response-balance rules pass.

Canadian camera support is materially thinner than U.S. support, and several Canadian native-support sources are historical, seasonal, or otherwise misaligned with the October-1 target. Canadian provincial evidence is therefore a priority for monitoring and future calibration, not a basis for claiming a seamless binational density surface.

## Permitted and prohibited interpretations

| Permitted | Prohibited |
|---|---|
| Compare relative modeled camera-observation values within the stated year and support class | Describe values as deer/km2, population density, or absolute abundance |
| Use uncertainty, extrapolation, source support, and monitoring priority to plan evidence improvement | Treat unsupported, unsurveyed, or zero-detection areas as absence |
| Report exact U.S./Canada overlap areas and the governed downstream reporting relationship | Infer browse damage, regeneration failure, winter redistribution, response capacity, or manager performance |
| Use the 1-km polygons to inspect alignment and area reconciliation | Publish or interpret a 1-km deer surface |
| Treat monitoring priority as an evidence-gap screen | Treat monitoring priority as an optimized field-site prescription |

## Sources, versions, retrievals, and licences

All listed sources were retrieved and hash-verified on 2026-09-18 unless noted.

- **SNAPSHOT USA 2019-2023, Dryad version 6** (published 2025-04-10), CC0 1.0: [doi:10.5061/dryad.k0p2ngfhn](https://doi.org/10.5061/dryad.k0p2ngfhn).
- **SNAPSHOT USA 2024, Dryad version 3** (published 2026-06-01), CC0 1.0: [doi:10.5061/dryad.bnzs7h4qf](https://doi.org/10.5061/dryad.bnzs7h4qf).
- **GBIF white-tailed deer occurrence download**, 289,829 records, GBIF occurrence terms: GBIF.org (18 September 2026), [doi:10.15468/dl.djeu57](https://doi.org/10.15468/dl.djeu57).
- **GBIF paired Mammalia effort-control download**, 2,645,646 records, GBIF occurrence terms: GBIF.org (18 September 2026), [doi:10.15468/dl.sv79qv](https://doi.org/10.15468/dl.sv79qv).
- **White-tailed deer U.S. range component**, U.S. Geological Survey GAP, CONUS 2001 v1 / 2018 release, CC0 1.0: [doi:10.5066/F7KS6QN9](https://doi.org/10.5066/F7KS6QN9).
- **Adirondack designed-survey diagnostic**, Hinton et al. (2022), PLOS ONE and supplements, CC0: [doi:10.1371/journal.pone.0273707](https://doi.org/10.1371/journal.pone.0273707).
- **Minnesota 2024 population model**, public agency report; analytic-reuse licence not explicit: [Minnesota DNR report](https://files.dnr.state.mn.us/wildlife/deer/reports/popmodel/popmodel_2024.pdf).
- **Wisconsin 2024 population status**, public agency report; analytic-reuse licence not explicit: [Wisconsin DNR report](https://widnr.widen.net/s/w2zghhj85g/deerpopulation2024).
- **Manitoba 2014-15 aerial survey**, public agency report; licence not explicit: [Manitoba survey report](https://www.gov.mb.ca/nrnd/fish-wildlife/pubs/fish_wildlife/hunting/survey_results2014_15.pdf).

Agency reports with no explicit analytic-reuse licence are cited for provenance and methods context; their raw files are not redistributed here. Raw public-data archives, exact camera coordinates, local paths, credentials, restricted interviews, and internal governance records are excluded.

## Reproducibility and integrity

The public map is a static HTML-plus-assets package with vendored Leaflet; it makes no external runtime requests. The 416 on-demand detail chunks are gzip-compressed for GitHub Pages transport and decompressed in the browser without changing values. The public package contains 838 raster tiles, 437,891 governed 5-km cell-detail records, the experimental 1-km QA geometry, browser-QA evidence, and a SHA-256 manifest.

- [Public package transformation notes](/assets/maps/northern-hardwood-deer-relative-v1/PUBLIC_PACKAGE_README.md)
- [Public SHA-256 manifest](/assets/maps/northern-hardwood-deer-relative-v1/public_package_manifest.csv)
- [Source-package manifest](/assets/maps/northern-hardwood-deer-relative-v1/source_package_manifest.csv)
- [Functional QA results](/assets/maps/northern-hardwood-deer-relative-v1/browser_qa_results.json)
- [Reproducible public-package builder](https://github.com/MtnTheMan/mtntheman.github.io/blob/master/scripts/build-nhpa-deer-public-package.mjs)

The package passed ten structural and integrity tests. Headless browser QA verified the default layers, independent monitoring-priority toggle, cell-detail lookup, desktop rendering, a 390-pixel responsive viewport without horizontal overflow, and zero external requests.

## Recommended citation

> Hopkins, P. A. 2026. *Northern Hardwood deer relative-observation map, version 1*. Tier-3 governed camera-observation benchmark with support, uncertainty, extrapolation, border, reporting, and monitoring-priority companions. https://www.mtntheman.com/northern-hardwood-deer-relative-v1-technical-methods/

