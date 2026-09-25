---
layout: default
title: Experimental 16-state relative deer-signal synthesis (T21) — methods and limits
permalink: /northern-hardwood-deer-t21-relative-index-experimental-methods/
excerpt: Methods, sources, support, sensitivity, and interpretation limits for the NHPA T21 research map.
---

<style>
  #content { max-width: 1120px; }
  .nhpa-warning { background: #252504; border: 2px dotted #00FF00; padding: 0.9rem 1rem; margin: 1rem 0 1.4rem; }
  .nhpa-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 1rem 0 1.5rem; }
  .nhpa-actions a { border: 2px outset #00FF00; padding: 0.45rem 0.7rem; }
</style>

<div class="nhpa-actions">
  <a href="/assets/maps/northern-hardwood-deer-t21-relative-index-experimental/">Open the T21 interactive research map</a>
  <a href="/northern-hardwood-deer-t09-continuous-percentile-experimental-methods/">Read the earlier T09 methods</a>
  <a href="/projects.html">Return to projects</a>
</div>

<div class="nhpa-warning"><strong>Experimental research display; not a validated deer-abundance map.</strong> T21 combines two modeled observation signals into an illustrative rank synthesis. The wide colored footprint reflects model predictions, not a camera or wildlife survey in every cell. Do not use its composite as a deer count, population density, browse-impact measure, forest-exposure estimate, or management priority.</div>

# Experimental 16-state relative deer-signal synthesis (NHPA-W002-T21)

- **Research build:** 2026-09-25; full computation complete, geographic transfer not validated
- **Map support:** 59,373 aligned 5 km grid cells across CT, IA, IL, IN, MA, ME, MI, MN, NH, NJ, NY, OH, PA, RI, VT, and WI
- **Modeled cells:** 59,292; the other 81 remain missing because climate inputs are incomplete
- **Reference period:** frozen camera-season predictions for 2019–2024 plus GBIF reporting-share predictions for complete calendar years 2019–2025
- **Map denominator:** 1,442,905.410 km² of eligible, clipped 16-state land intersection, **not** northern-hardwood forest area

## The two source signals

The camera layer is the frozen T13 **camera-only** model prediction of independent deer sequences per 30 camera nights at a reference camera placement, averaged over 2019–2024 late-summer/autumn seasons. It draws on [SNAPSHOT USA 2019–2023, Dryad version 6](https://doi.org/10.5061/dryad.k0p2ngfhn) and [SNAPSHOT USA 2024, Dryad version 3](https://doi.org/10.5061/dryad.bnzs7h4qf). The previously fused T13 camera-plus-GBIF output is deliberately excluded: including it would count GBIF evidence twice.

The GBIF layer is T20's modeled, standardized white-tailed-deer share **among reported Mammalia records**, averaged over 2019–2025. It uses paired [white-tailed deer](https://doi.org/10.15468/dl.djeu57) and [Mammalia](https://doi.org/10.15468/dl.sv79qv) occurrence downloads, both retrieved 2026-09-18. The comparison attempts to account for variation in observation/reporting opportunity; it does **not** turn opportunistic occurrence records into a census, measured absence, or occupancy estimate. T20's 2019–2024 subset is a subset of its seven-year refit, not the separate older T12 model. The 2025 layer is a complete-year T20 prediction.

The source streams and their models have different timing, observation processes, and limitations. They share some landscape predictors and are not statistically independent. The aligned grid and simplified state outlines use [U.S. Census Bureau 2025 cartographic state boundaries](https://www2.census.gov/geo/tiger/GENZ2025/shp/cb_2025_us_state_5m.zip). No Canadian values or northern-hardwood forest mask enter this T21 display.

## How the composite is made

Each modeled signal is converted separately to an **area-weighted percentile within the eligible 16-state footprint**. Each cell is weighted by its actual clipped state-union intersection area; tied values share a weighted midrank. The illustrative score is then `0.5 × camera percentile + 0.5 × GBIF percentile`. The main combined color layer is the area-weighted percentile of that score against the same eligible-area reference. The map retains the uncombined components and two alternatives, `0.25 × camera + 0.75 × GBIF` and `0.75 × camera + 0.25 × GBIF`, rather than implying the 50/50 weight is fitted or biologically calibrated.

This construction is a **within-footprint comparison of model ranks**, not an estimate with animal units. A 5-km square shows one prediction for that reporting cell. Optional screen-color smoothing changes appearance only; it does not add observations, alter cell values, or create a 1-km analysis. The 81 missing cells are not scored as zero. Source-map coverage is the full 16-state footprint, not the narrower northern-hardwood forest resource.

## Observation support and sensitivity

The viewer opens on years with a direct spatially qualified GBIF Mammalia report. Only **20,679** cells have such a report in any year from 2019 through 2025; **10,620** have one in 2025. Just **377** cells contain a camera training deployment. Across all 59,373 cells, **38,546** have neither a camera training cell nor a direct GBIF Mammalia report in 2019–2025. Colors there are model-only extrapolation, not local wildlife observations. A no-report cell has unknown reporting effort; it is not deer-free.

The January–August 2026 layer is **direct observation-support context only**: 10,164 cells have a Mammalia report dated within that partial-year window in the archive retrieved 2026-09-18. Reporting lag is possible. No 2026 annual prediction, 2026 composite, or complete-year 2026 comparison was made.

The 25/75 and 75/25 alternative weightings differ by a median of **10.1 percentile points** and a 90th-percentile difference of **26.7 points** across eligible cells. Weight choice materially changes the composite. That span is a sensitivity diagnostic, **not** a confidence interval. The GBIF 2019–2024 versus 2019–2025 rank change is much smaller: median **0.25** point, 90th percentile **0.74** point.

## Validation and safe interpretation

Upstream geographic-transfer tests of the camera and GBIF models did not establish a validated, transferable relationship to regional deer abundance. T21 adds no independent validation; a smooth-looking synthesis cannot repair either component's transfer problem. The modeled GBIF interval, where shown upstream, is conditional on its model and does not encompass all reporting or geographic-transfer bias. T21 has no defensible combined confidence interval. Harvest, vehicle-collision, vegetation-browse, and regeneration evidence do not enter this two-source map.

Use the layers to compare candidate spatial signals, inspect source disagreement and evidence gaps, and formulate follow-up tests. Do not interpret rank differences across cells as deer-count differences, infer browse consequences from color alone, or use T21 as a forest-management ranking. Publication preserves the research diagnostic for inspection; it does not promote the model to a validated regional estimate.

## Sources and reuse

The camera source releases cited above are recorded as **CC0-1.0** in the NHPA acquisition manifest. The paired GBIF downloads contain a **mixture of CC0, CC BY, and CC BY-NC record-level licenses**. This display republishes neither raw GBIF coordinates nor original occurrence records, but the mixed licenses still matter: the map and page should be treated as a noncommercial research archive, not blanket permission for commercial reuse or redistribution of underlying records. Follow the linked GBIF download citations and record-level license terms for any independent reuse. The public viewer should contain only derived 5-km values, aggregate reporting-support fields, and simplified public state outlines—never camera deployment locations, raw GBIF coordinates, interview-case locations, or participant evidence.
