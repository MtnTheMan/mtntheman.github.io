---
layout: default
title: Experimental deer encounter map v2 — methods and limits
permalink: /northern-hardwood-deer-relative-v2-experimental-methods/
excerpt: Methods, validation failure, provenance, and interpretation limits for the NHPA 5-km deer encounter diagnostic.
---

<style>
  #content { max-width: 1120px; }
  .nhpa-warning { background: #252504; border: 2px dotted #00FF00; padding: 0.9rem 1rem; margin: 1rem 0 1.4rem; }
  .nhpa-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 1rem 0 1.5rem; }
  .nhpa-actions a { border: 2px outset #00FF00; padding: 0.45rem 0.7rem; }
  #content table { border-collapse: collapse; display: block; max-width: 100%; overflow-x: auto; }
  #content th, #content td { border: 1px dotted #00FF00; padding: 0.45rem 0.6rem; text-align: left; vertical-align: top; }
</style>

<div class="nhpa-actions">
  <a href="/assets/maps/northern-hardwood-deer-relative-v2-experimental/">Open the interactive diagnostic</a>
  <a href="/assets/maps/northern-hardwood-deer-relative-v1/">Open the governed v1 map</a>
  <a href="/projects.html">Return to projects</a>
</div>

<div class="nhpa-warning"><strong>Experimental, not promoted:</strong> the v2 map is public for inspection and discussion, not an approved regional prediction. It did worse than a constant-rate baseline in spatial holdouts. Its values are modeled camera encounters per 30 nights, <em>not</em> deer density, deer/km², browse damage, or a management rating. Gray cells mean insufficient display support, not zero deer.</div>

# White-tailed deer relative encounter diagnostic v2

**Public diagnostic posted:** 2026-09-22
**Project:** Northern Hardwoods Pressure Atlas (NHPA-W002-T04), independent of the interview study
**Model target:** 2024, standardized to 30 camera nights
**Display support:** exact 5 km × 5 km NHPA reporting cells
**Disposition:** `NOT_PROMOTED_FAIL_CLOSED`; public hosting does not change the model decision

## Why this view exists

The governed [v1 map](/northern-hardwood-deer-relative-v1-technical-methods/) displays a binary camera-encounter probability. On the T04 reporting crosswalk, that probability is often near saturation: 83.4% of cells exceed 0.75. The v2 diagnostic asks whether expected *counts* of independent deer camera sequences per standardized 30-night effort make regional variation easier to see. A less-saturated color scale is not, by itself, evidence of a better predictive model.

## Evidence and calculation

The displayed rate comes from the governed SNAPSHOT negative-binomial generalized additive model. Its response is independent deer camera-sequence count, with a camera-night offset, spatial and year smooths, and habitat and development classes. Predictions set year to 2024 and effort to 30 nights. Habitat and development are held at the modal reference classes (Forest and Rural); no cell-specific environmental predictor stack was available. Thus the displayed differences mainly reflect the fitted geographic smooth, not measured habitat differences among cells.

SNAPSHOT USA [2019–2023, Dryad version 6](https://doi.org/10.5061/dryad.k0p2ngfhn) and [2024, Dryad version 3](https://doi.org/10.5061/dryad.bnzs7h4qf) supply the structured camera observations and effort (CC0-1.0). [GBIF white-tailed deer](https://doi.org/10.15468/dl.djeu57) and paired [Mammalia](https://doi.org/10.15468/dl.sv79qv) downloads inform a separate target-group observation-support classification; they do **not** enter the displayed count-rate model or set an abundance scale. GBIF record licenses vary by record. The canonical NHPA-W001 lattice and northern-hardwood reporting crosswalk define the display geometry; a 5-km predicted cell is not a 5-km field measurement. No interview-case location or raw camera coordinate is published.

## Coverage and map controls

The reporting crosswalk contains 25,784 cells. Numeric results appear in 7,493 display-eligible cells: 786 with joint camera/target-group support, 1,024 camera-neighborhood-only, and 5,683 target-group-only. Another 18,291 high-extrapolation cells are neutral gray and expose no numeric value. Canada is shown only as geographic context because evidence was insufficient for this particular reporting product. The selectable views show area-weighted percentile among eligible cells, encounter rate, v1 probability for reference, source-support class, and relative uncertainty width. The percentile is a within-product ranking, not a biological threshold.

## Validation and claim boundary

Five contiguous longitude-band holdouts refitted the exact negative-binomial model formula. Mean held-out Spearman correlation was **0.097**. Mean absolute error was **23.38** sequences per 30 nights versus **22.17** for a training-rate constant baseline; root mean squared error was **43.38** versus **37.98**. Factor-level transfer was incomplete in four of five blocks. The prespecified promotion gate required mean Spearman at least 0.30 and RMSE below the constant baseline, so it failed. These tests do not support an improved regional prediction or a deer-density claim.

Use this map to inspect how the current count-rate model behaves and where its support mask stops it. Do not read its colors as animal population density, infer browse impacts, compare unsupported gray cells with numeric cells, extend values into Canada, or use it for site-level decisions. The long-term NHPA target remains an independently calibrated October 1 pre-hunt density estimate where sufficient evidence becomes available.

## Reproducibility and provenance

The public HTML is a byte-identical, self-contained copy of the staged T04 diagnostic: SHA-256 `b331e715b5a086122875a22a8361dd4a584f4d8994aa04f953e5e1fae9626523`. It embeds display-safe cell values and requires no live data service. The [public package manifest](/assets/maps/northern-hardwood-deer-relative-v2-experimental/public_package_manifest.csv) records the source path, size, hash, and release boundary. The build and spatial-validation scripts, model card, input/output hashes, and QA results remain in the NHPA-W002-T04 research workspace. This public diagnostic does not replace the [v1 methods and release](/northern-hardwood-deer-relative-v1-technical-methods/).
