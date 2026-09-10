---
layout: default
title: Documentation for the Northern Hardwood Market Map v0.8
permalink: /northern-hardwood-market-v0-8-documentation/
excerpt: How the v0.8 hardwood-market map estimates supply, buyer access, finite demand, road cost, and allocation, and how its evidence is checked.
---


<style>
  #content { max-width: 1120px; }
  #content table {
    border-collapse: collapse;
    display: block;
    margin: 1rem 0 1.4rem;
    max-width: 100%;
    overflow-x: auto;
    width: max-content;
  }
  #content th,
  #content td {
    border: 1px dotted #00FF00;
    padding: 0.48rem 0.58rem;
    text-align: left;
    vertical-align: top;
  }
  #content th { background-color: #252504; }
  #content h2 { margin-top: 2.25rem; }
  #content h3 { margin-top: 1.65rem; }
  #content blockquote {
    border-left: 3px solid #00FF00;
    margin-left: 0;
    padding: 0.25rem 1rem;
  }
  #content pre {
    max-width: 100%;
    overflow-x: auto;
    white-space: pre-wrap;
  }
  .nhr-note {
    background-color: #252504;
    border: 2px dotted #00FF00;
    margin: 1rem 0 1.4rem;
    padding: 0.9rem 1rem;
  }
  .nhr-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin: 1rem 0 1.5rem;
  }
  .nhr-actions a {
    border: 2px outset #00FF00;
    padding: 0.45rem 0.7rem;
  }
  .nhr-flow {
    background-color: #252504;
    border: 1px dotted #00FF00;
    line-height: 1.7;
    margin: 1rem 0 1.4rem;
    padding: 0.9rem 1rem;
  }
  .nhr-small { font-size: 0.92rem; }
</style>
<div class="nhr-actions">
  <a href="/assets/maps/us-northern-hardwood-market-v0-8.html">Open the interactive map</a>
  <a href="/northern-hardwood-market-v0-8-technical-methods/">Read the detailed technical methods</a>
</div>

<div class="nhr-note"><strong>Release status:</strong> v0.8 is a technically checked research preview, not yet a belt-wide empirically validated market-health classification. The formal unattended pipeline completed through stage 60; the evidence and release gates at stages 65–90 remain closed.</div>

# How the v0.8 market map is built

## From the market question to evidence review

**Last updated:** 2026-09-08
**Purpose:** explain how the forestry-market question becomes a publishable, independently tested map, including the evidence work in stages 62.x and 65.

## 1. Start with the market question

A nearby mill is only the starting point. The project asks:

> If a forest manager offers the joint mix of products that a plausible hardwood treatment produces, which products can reach compatible buyers, how much finite demand is available after competition, and where does a product channel remain difficult?

The result must distinguish four different conditions:

1. **Physical access:** can a log truck plausibly reach a compatible site?
2. **Finite market room:** does modeled demand remain after all supply cells compete for it?
3. **Economic access:** is haul cost inside the tested product-specific envelope?
4. **Evidence strength:** how well do dated sources support the buyer, capacity, and observed local market conditions?

The present map calculates the first three under stated assumptions and displays the fourth separately. It has not yet completed the final comparison of predicted market condition with independent observed outcomes.

## 2. End-to-end analytical stages

The table follows the market assessment itself, apart from the runner's numeric stage labels.

| Analytical stage | Question answered | Current v0.8 implementation | What remains |
|---|---|---|---|
| 1. Define the range and units | Where is the northern-hardwood resource, and at what spatial scale should claims be made? | 12-state U.S. ecological core; 25,810 approximately 5-km cells; 233 evidence districts | Final reproducible boundary documentation and cross-border expansion |
| 2. Estimate annual potential offer | How much wood could plausibly enter the market annually, rather than how much is merely standing? | TreeMap/FIA growth-calibrated potential offer with a 65% base likely-offer factor | Cell-specific operability, ownership, logger capacity, willingness, and observed removals calibration |
| 3. Form the joint product basket | What mix of veneer, sawlogs, industrial wood, pulpwood, and energy wood comes from management? | One conserved five-product basket per cell | Species-, diameter-, grade-, and forest-type recovery by cell |
| 4. Establish the buyer inventory | Which facilities exist, operate, procure raw material, accept hardwood, and accept each product form? | 3,107 public records and seven separate confidence dimensions | Current verification for influential mills, Canadian buyers, closures, quotas, and product roles |
| 5. Bound finite demand | How much of each product can each buyer and physical site plausibly absorb? | State TPO envelopes distributed to eligible sites as low/base/high bands with unlocated residuals | Direct intake/procurement evidence and better localization of state demand |
| 6. Calculate delivered access | What road distance and truck cost connect each cell-product to each compatible buyer? | Audited OpenStreetMap graph and low/base/high route cache | Seasonal restrictions, bridge limits, private/forest roads, calibrated trucking economics |
| 7. Allocate all supply jointly | What can find a destination after every cell competes for finite product and site capacity? | Global maximum-throughput, minimum-haul-cost allocation with veneer downgrade | Full value objective, treatment feasibility, and additional scenario axes |
| 8. Explain the modeled mechanism | Is a cold result driven by distance, product mismatch, competition, capacity, downgrade, or missing evidence? | Fit and supply surfaces, weakest native channel, buyer links, unlocated demand, and evidence outlines | Stable categorical interpretation tested across broader sensitivity cases |
| 9. Compare with actual market behavior | Do predicted hot and cold areas agree with bids, no-bids, reoffers, prices, procurement changes, and local expert evidence? | 14 selected Michigan examples and a preregistered 30-district panel | Complete development panel, freeze calibration, and evaluate the untouched holdout |
| 10. Release and maintain | Can another analyst reproduce the map, understand its claims, and refresh it without changing definitions silently? | Extensive contracts and QA; checked standalone preview | Accepted stage-65 snapshot, official stages 70–90, environment lock, versioned source archive, refresh policy |

This is why the map can be useful now and still remain a research preview. Numerical optimization is one part of the work. A market-health claim requires stronger local evidence for its inputs and a comparison between its predictions and independent outcomes.

## 3. Formal production stages 00–90

The unattended runner uses numeric stages for deterministic production and restartability.

### Stage 00: General preflight

This stage checks the inherited supply, demand, geography, software, frozen Grayling artifacts, and free disk space against their expected structure. It stops a long run when inputs are missing or have drifted.

**Current status:** passed 35 of 35 checks.

### Stage 05: Road preflight

This stage checks the OpenStreetMap extracts, road-building software, geography, facility inputs, and legacy network used for diagnosis. Passing means road work can begin; it does not make the inherited graph suitable for production.

**Current status:** passed.

### Stage 07: Coordination-contract preflight

This stage validates the frozen product definitions, terminology, scenario axes, delivered-cost formula, status taxonomy, and route-shard contract. It keeps later scripts and reviews from assigning different meanings to “pulpwood,” “buyer,” “matched,” or “route.”

**Current status:** passed 62 of 62 checks.

### Stage 10: Frozen Grayling regression

Confirms that the Grayling pilot's accepted supply, demand, route, allocation, and map behavior have not changed accidentally while the process scales to the belt.

**Current status:** passed.

### Stage 20: Legacy graph diagnostic

Tests the inherited Lake States and Northeast graph components and demonstrates that they do not form an acceptable continuous production network. A diagnostic can pass while the graph itself remains blocked.

**Current status:** diagnostic passed; legacy graph correctly blocked.

### Stage 25: Bounded route smoke test

Runs a very small set of destinations through the routing engine and checks row counts, status codes, nonnegative cost, and graph-component behavior before expensive work begins.

**Current status:** passed.

### Stage 30: Multi-state route benchmark

Runs a deterministic 70-destination sample spanning all 12 states, both road-network trunks, and all five products. It tests correctness, speed, memory, and realistic candidate behavior.

**Current status:** passed.

### Stage 40: Production graph build

Parses the Midwest and Northeast OpenStreetMap extracts and connects them through the lower-Michigan/Ohio/Pennsylvania/New York corridor while preserving node and way identity.

**Current status:** completed; 15,478,116 nodes and 28,315,923 directed edges.

### Stage 42: Production snapping

Snaps supply origins and located facilities to the released graph, records distances and graph components, and quarantines coordinate outliers rather than forcing them into the network.

**Current status:** completed; one facility coordinate outlier.

### Stage 45: Deep graph audit

This stage audits components, edge and node identity, connector integrity, road-class structure, snapping coverage, and release thresholds. It determines whether the graph is fit for full-belt routing; it does not assess market-health claims.

**Current status:** passed with `production_release_ready=true` for routing.

### Stage 50: Full-belt route shards

Computes restartable, destination-keyed route work for low/base/high haul assumptions. Product search envelopes limit candidate generation; road paths and costs then determine physical and economic eligibility.

**Current status:** completed in four shards; 8,674,211 candidate pairs, 26,022,633 scenario rows, zero failed units.

### Stage 60: Strict route merge

Verifies that all shards are complete, nonoverlapping, correctly fingerprinted, scenario-complete, and row-count consistent before creating one content-addressed route cache.

**Current status:** passed. This is the last completed formal unattended stage.

## 4. The evidence branch between stages 60 and 65

Evidence review runs alongside the model as a separate validation and admission process.

### Stage 62.3: Adopt the evidence districts

Stage 62.3 creates the current local research geography:

- 233 districts;
- all 25,810 cells represented exactly once;
- no district over 175 km measurable diameter;
- no district with more than two materially represented states;
- reconciled supply membership; and
- explicit crosswalks to older zone designs.

The older 177-zone geography is superseded. Old packets can provide screening context, but their children do not inherit validation status.

### Stage 62.4 r2: Freeze predictions before local evaluation

Stage 62.4 r2 creates **1,165 immutable rows: 233 districts × five products**. Each row preserves the model's pre-evidence prediction and distinguishes:

- a compatible site with a physical route;
- a physically routed site beyond the tested cost envelope;
- an economically eligible outlet;
- a capacity-bearing compatible outlet; and
- no physical route.

The freeze uses model inputs only, without local research, outcomes, return queues, or state evidence. Later validation therefore cannot redefine the prediction after seeing the answer. Each row has stable hashes and must be carried into its district packet with `tuning_performed=false`.

### Local research and Tier 1 packet gate

Each district packet must independently document all five products, even when the answer is `no_evidence_found`. It records:

- canonical facility identity and location;
- current operation;
- product and raw-feedstock direction;
- hardwood acceptance;
- procurement activity;
- finite capacity or demand evidence;
- cross-border relevance;
- observed market events;
- negative searches and conflicts;
- source dates, locators, tiers, and hashes; and
- comparison with the frozen prediction.

An initial Tier 1 pass means the packet meets the source and schema rules. It does not mean the market prediction is correct.

### Tier 2 outcome validation

The preregistered panel contains 20 development districts and 10 untouched holdouts across all states and products. Evidence collectors should be blinded to the relevant frozen prediction. Development outcomes can inform a documented calibration; the calibration is then frozen before the holdout is opened once.

Outcome evidence includes bidder counts, no-bid and reoffer rates, bid-to-appraisal relationships, prices, closures or curtailments, procurement changes, and geographically relevant forester or buyer confirmation. Packet completeness and truth-positive performance are separate gates.

## 5. Stage 65: Immutable evidence reconciliation

Stage 65 governs which local evidence may change the model and enforces the related documentation contract. Allocation occurs later.

### Inputs expected by stage 65

- Frozen stage-60 route cache and hashes
- Frozen offered-supply and state-demand contracts
- Adopted stage-62.3 district registry and cell membership
- Stage-62.4 r2 prediction rows and hashes
- Independently gated district packets covering all five products
- Claim-level source records with dates, locators, polarity, scope, and hashes
- Canonical site identities and proposed evidence deltas
- Observed-event rows kept separate from demand and capacity
- Conflict and negative-search records

### Deterministic reconciliation

The proposed gate would:

1. Verify frozen hashes, schemas, and unique keys.
2. Normalize product IDs, statuses, feedstock direction, units, scenarios, and dates without changing source values.
3. Deduplicate facility aliases to physical sites while retaining conflicting source records.
4. Apply evidence deltas in a fixed order: exclude/close, correct identity, correct status, correct product, correct feedstock, set capacity band, then add site.
5. Reapply hard gates for operation, input direction, hardwood acceptance, route eligibility, finite intake, and geometry.
6. Reconcile every state/product/scenario envelope, direct anchors, facility shares, outside-domain reserves, `other_unmodeled`, and explicit unlocated residuals.
7. Enforce finite monotone facility bands and one joint physical-site cap unless independent lines are documented.
8. Enforce product rules, including only the frozen veneer-to-sawlog downgrade and no conversion of mill residue output into roundwood demand.
9. Verify that every district packet declares every product and carries all required upstream hashes.
10. Compare observed truth-positive evidence with model admissions without collapsing market condition and evidence condition.
11. Require zero blocking issues and reproducible content hashes before promotion.

Blocking issues include demand mass-balance failure, duplicate or unresolved site identity, invalid operation/feedstock/product admission, missing or infinite capacity, missing material source metadata, crossed observed/model labels, incomplete zone/product/hash coverage, and unresolved material conflicts.

### Output of stage 65

A passing stage creates a new **content-addressed, immutable evidence snapshot** containing packet IDs, district IDs, sorted input hashes, code and contract hashes, ordered evidence deltas, reviewer decision, issue counts, and an explicit record that stage 70 is still disabled until promotion completes. Upstream route, supply, and demand files are never overwritten. A failed candidate produces diagnostics only.

This snapshot connects local research to the formal allocation in an auditable form. Until it exists, local findings may appear in memos or on the map but cannot change buyers, capacity, or results without review.

### Why stage 65 is currently closed

- No district has completed Tier 2 validation.
- Only 33 of 233 packets had an initial independent Tier 1 pass at the map snapshot.
- The 111 materialized packets have not been promoted as a single accepted, immutable evidence set.
- Important operation, product, procurement, capacity, and identity conflicts remain.
- Large portions of state demand remain unlocated.
- One attempted blinded collection batch was compromised; clean/remediated work is not evaluator-ready.
- The existing proposed stage-65 contract and failure memo were written against the superseded 177-zone system and old `EZ###` identity convention. They still document the design, but the formal contract and automated gate must be reissued for the adopted 233 hashed district IDs and stage-62.4 r2 prediction freeze before promotion.

Therefore the current state is not “stage 65 failed for the final 233-district evidence set.” The accurate statement is: **the earlier prototype gate failed closed, the research geography and prediction freeze were subsequently replaced, and no current 233-district stage-65 candidate has been accepted.**

## 6. Stages 70, 80, and 90

### Stage 70: Formal global allocation

Stage 70 will consume only the accepted stage-65 evidence snapshot, frozen supply, and final route cache. It will rebuild admitted buyers and finite demand, solve the agreed scenarios, preserve quarantine and residual accounting, and produce machine-readable conservation and capacity QA.

The research-preview solve demonstrates this machinery, but it deliberately uses inherited buyer admission and records `evidence_admission_changed=false`. It is not stage 70.

### Stage 80: Formal map build

Stage 80 will assemble the accepted scenario outputs, inventory, evidence-condition layer, district summaries, observed outcomes, source locators, and release metadata into the manager-facing map. It must distinguish modeled market condition from evidence condition and expose assumptions without overwhelming the user.

The present map previews this display. It is not the formal stage-80 artifact.

### Stage 90: Release QA

Stage 90 will verify analytical hashes, feature counts, scenario behavior, interaction behavior, responsive layout, accessibility, terminology, source links, evidence labels, absence of external runtime dependencies, and equality between the accepted local artifact and hosted copy.

Only after this gate should the product be described as the formal v0.8 release. Empirical validity still must be described according to the Tier 2 and holdout results; technical release QA cannot substitute for outcome validation.

## 7. Work completed and remaining

The project now has full-belt road access, a checked global allocation, and a working map. It also has a structure for collecting and reviewing local evidence. The remaining work is to complete that evidence, reconcile it into a current immutable stage-65 snapshot, rerun the formal allocation, evaluate the preregistered development and holdout panels, and publish a stage-90 artifact whose claims reflect the observed performance.

Continue to the [detailed numerical methods, results, limitations, and acceptance criteria](/northern-hardwood-market-v0-8-technical-methods/).



---

# Which stage records are current

**Last updated:** 2026-09-08

Several v0.8 evidence-stage records document earlier work but no longer describe the current geography or prediction contract. Future documentation and automation should identify them as superseded.

- Stage 62.1 and stage 62.2 were unsuccessful district-design iterations and are not current assignment geographies.
- Stage 62.3 supersedes them with 233 adopted evidence districts covering all 25,810 cells exactly once.
- Stage 62.4 version 1 failed its route-status semantics audit. Stage 62.4 r2 supersedes it with 1,165 immutable prediction rows: 233 districts × five products.
- The September 2 stage-65 reviewer memo tested the obsolete 177-zone geography and found zero accepted packets. Its `FAIL_CLOSED` decision remains the latest formal stage-65 decision, but its individual zone and issue counts are historical and must not be reported as the current 233-district audit.
- The proposed stage-65 contract predates the 233 hashed district IDs and has not been implemented as a runner stage, assembler, or accepted output. It must be reissued against stage 62.3 and stage 62.4 r2 before a new promotion attempt.
- The Grayling parity standard permits a provisional Tier 1 snapshot with explicit limitations, while the implemented district ledger currently requires Tier 2 plus explicit stage-65 approval. That governance conflict must be resolved before the automated gate is implemented.
- The public research preview deliberately does not use the newer district packets to change buyer admission or capacity. It is not evidence that stage 65 or stage 70 has run.

The current authoritative progress count is:

| Measure | Current count |
|---|---:|
| Adopted districts | 233 |
| Research complete | 116 |
| Canonical packets | 111 |
| Initial independent Tier 1 passes | 33 |
| Tier 2 passes | 0 |
| Stage-65 eligible | 0 |
