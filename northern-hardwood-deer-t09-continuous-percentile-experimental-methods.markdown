---
layout: default
title: Experimental continuous deer-encounter percentile (T09) — methods and limits
permalink: /northern-hardwood-deer-t09-continuous-percentile-experimental-methods/
excerpt: Archival methods, provenance, and interpretation limits for the NHPA T09 continuous-percentile research map.
---

<style>
  #content { max-width: 1120px; }
  .nhpa-warning { background: #252504; border: 2px dotted #00FF00; padding: 0.9rem 1rem; margin: 1rem 0 1.4rem; }
  .nhpa-actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin: 1rem 0 1.5rem; }
  .nhpa-actions a { border: 2px outset #00FF00; padding: 0.45rem 0.7rem; }
</style>

<div class="nhpa-actions">
  <a href="/assets/maps/northern-hardwood-deer-t09-continuous-percentile-experimental/">Open the T09 interactive archive</a>
  <a href="/assets/maps/northern-hardwood-deer-relative-v2-experimental/">Open the original T04 diagnostic</a>
  <a href="/northern-hardwood-deer-relative-v2-experimental-methods/">Read the T04 methods</a>
  <a href="/projects.html">Return to projects</a>
</div>

<div class="nhpa-warning"><strong>Experimental public archive, not a validated deer-density map.</strong> T09 interpolates an existing T04 <em>modeled camera-encounter</em> surface. T04 failed its independent geographic camera holdouts. The interpolated cells were originally classified as high extrapolation and remain visualization-only. Public access preserves the research view; it does not promote either model for ecological or management inference.</div>

# Continuous deer-encounter percentile exploration (NHPA-W002-T09)

- **Archived:** 2026-09-23
- **Display:** exact 5 km × 5 km NHPA reporting cells, with optional screen-only color smoothing
- **Time represented:** T04's 2024 reference prediction from 2019–2024 SNAPSHOT camera deployments; not an annual mean or October 1 population estimate
- **Footprint:** 25,784 cells in the T04 U.S. northern-hardwood reporting overlay; no Canadian values or values outside that overlay
- **Disposition:** experimental / not promoted

## What the colors mean

T04 modeled expected independent white-tailed deer camera sequences per 30 camera nights. The default T09 color is the **area-weighted percentile of that modeled encounter rate** relative to T04's original 7,493 display-eligible cells. A higher percentile means a higher value within this particular modeled reference distribution. It is **not** deer per square kilometer, a deer count, a browse measurement, a biological threshold, or a management rating. The selectable original T04 percentile, support class, and nearest-original-eligible-cell distance views help show where the apparent continuity comes from. The distance is to a **modeled grid cell**, not to a camera site.

T04 displayed numeric values in 7,493 cells and withheld the other 18,291 as high extrapolation. T09 preserves the original values in eligible cells and fills the blank cells for visual continuity by local ordinary kriging of `log1p` T04 modeled encounter rate from the 32 nearest eligible cell centers. The fill is mapped back to the original, frozen area-weighted percentile reference; filled cells do not enter or redefine its denominator. Their original high-extrapolation status remains visible in the support layer. Optional smooth colors change only screen appearance, not the 5-km cell values or analytical resolution.

## What was and was not validated

The underlying T04 model failed five geographic camera holdouts: mean Spearman rank correlation was **0.097**, and mean absolute and root mean squared errors were worse than a constant training-rate comparator. Four folds also had incomplete habitat-category transfer. Those tests limit any claim that T04 predicts deer encounters well in unfamiliar places. [T04's full methods and source citations](/northern-hardwood-deer-relative-v2-experimental-methods/) describe the camera model and its evidence boundary.

T09's own holdouts removed 50-km tiles of **T04 modeled values**, then tested whether kriging reconstructed them. Its mean percentile RMSE was **1.76 points**, compared with 2.87 for the tested inverse-distance method and 3.19 for nearest-source fill. This is a check of interpolation of an already modeled surface—not a test against new deer observations. Agreement with a continuation of the same T04 fitted model is likewise internal consistency, not independent validation. Kriging uncertainty here describes interpolation conditional on T04 output and the selected variogram; it does not measure deer-population uncertainty or repair T04's geographic transfer failure.

The T09 fallback variogram was used after the fitted variogram failed its predeclared plausibility checks. Its range parameter was 100 km, with 50- and 200-km alternatives tested for visual sensitivity. That choice is **not** a deer-ecology calibration. No new camera, GBIF, habitat, abundance, or browse observations entered T09. T04's camera evidence comes from [SNAPSHOT USA 2019–2023](https://doi.org/10.5061/dryad.k0p2ngfhn) and [SNAPSHOT USA 2024](https://doi.org/10.5061/dryad.bnzs7h4qf); the separately classified [GBIF deer](https://doi.org/10.15468/dl.djeu57) and [Mammalia](https://doi.org/10.15468/dl.sv79qv) records informed observation support, not this encounter-rate model. See the [T04 methods](/northern-hardwood-deer-relative-v2-experimental-methods/) for versions, licenses, and limitations.

## Safe use and provenance

Use this archive to inspect the exploratory display, compare it with the original supported-only view, and identify evidence gaps. Do not use the continuous colors to infer local abundance, browse damage, cross-border density, or forest-management priority. Unsurveyed or withheld areas are not deer-free. The current research direction considers a season-standardized **annual relative deer index** and a wider state footprint; neither is present in this archived T09 map.

The public HTML is a minimally edited copy of the staged T09 viewer: only the local-only publication notices, page title, and methods link were changed. The original staged file remains unchanged in the NHPA research workspace. The viewer contains modeled 5-km cell values and simplified jurisdiction outlines, not camera deployment coordinates, site identifiers, interview locations, or raw records. The [public package manifest](/assets/maps/northern-hardwood-deer-t09-continuous-percentile-experimental/public_package_manifest.csv) records hashes and source paths. The governing scripts, method card, source/output manifests, and QA records remain under `workstreams/NHPA-W002/T09/` in the canonical NHPA workspace.
