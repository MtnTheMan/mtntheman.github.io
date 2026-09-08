---
layout: default
title: Northern Hardwood Market Map v0.8 Technical Methods
permalink: /northern-hardwood-market-v0-8-technical-methods/
excerpt: Detailed v0.8 data lineage, assumptions, equations, scenario results, QA, claim boundaries, and unfinished validation work.
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
  <a href="/northern-hardwood-market-v0-8-documentation/">Read the stage-by-stage guide</a>
</div>

<div class="nhr-note"><strong>How to use this page:</strong> numerical results are conditional model outputs. “Assigned” does not mean purchased or delivered, and unassigned potential offer is not an estimate of harvested wood going unsold.</div>

# Version 0.8 Methods, Production, and Validation Status

## Northern Hardwood Market Strength and Weakness Research Preview

**Last updated:** 2026-09-08
**Scope:** northern-hardwood portions of Connecticut, Maine, Massachusetts, Michigan, Minnesota, New Hampshire, New Jersey, New York, Pennsylvania, Rhode Island, Vermont, and Wisconsin
**Status:** **research preview**. Numerical allocation, road-network, route-cache, map-assembly, and browser checks passed. Local outcome validation is incomplete. The formal unattended production pipeline remains closed after stage 60.

## Executive summary

Version 0.8 is a belt-wide screening model for a practical forestry question:

> Where do the product mixes produced by hardwood forest management appear to have strong or weak market access?

It does more than count mills or draw circular buffers. The model represents a joint annual basket of five forest-product classes in each 5-kilometre supply cell, admits only buyer-product combinations that meet explicit evidence rules, assigns finite demand bands to those buyers, estimates delivered access over an OpenStreetMap road network, and solves all cells and buyers together under capacity constraints. The map shows where a greater or smaller share of modeled offer can find a compatible destination, which product has the weakest native channel, which buyers receive modeled volume, and how complete the local evidence is.

Under the default assumptions—base offered supply, base haul cost, central facility demand, and a 20% additional reserve for competition from within-state wood outside the mapped belt—the model assigns about **12.10 million of 39.89 million green short tons per year**, or **30.34%** of potential annual offer. Across the six displayed demand/reserve scenarios, the assigned share ranges from **21.26% to 40.09%**.

Those percentages are **not estimates of how much harvested wood actually goes unsold**. Offered supply is a modeled potential annual offer. Facility intake is partly inferred from state Timber Products Output (TPO) totals and public mill evidence. About **4.08 million tons** in the five displayed product envelopes remain known only at state/product level and cannot yet be placed at eligible facilities; the broader demand reconciliation contains about **11.54 million tons** when balancing and residual products are included. Prices and harvest costs are absent, and no district has completed the independent Tier 2 outcome-validation procedure.

A cold cell can therefore indicate a plausible market constraint, incomplete facility evidence, a conservative assumption, or a combination of the three. The defensible interpretation today is:

> Under the stated supply, buyer, capacity, reserve, and road-cost assumptions, this product channel is comparatively difficult here. The map exposes the buyers, modeled volumes, delivered-access costs, competition, and evidence limitations behind that signal.

It is not yet defensible to state that a mapped amount of timber will go unsold, that a particular timber sale will fail, or that a forest treatment is profitable.

## 1. Release boundary

Two production tracks must be distinguished.

1. The **formal unattended pipeline** completed and passed through the merged full-belt road-access cache at stage 60. Official stages 65–90—accepted evidence snapshot, global allocation, map build, and release QA—remain unavailable and fail-closed.
2. The **published research preview** was built afterward through a separate, checked sequence using the final v0.8 route cache and the inherited v0.7.2 supply and demand contracts. It passed numerical and browser QA but did not open or bypass the stage-65 evidence gate.

The map is publicly reachable at <https://www.mtntheman.com/assets/maps/us-northern-hardwood-market-v0-8.html>, but “published” must not be used as a synonym for “empirically validated” or “formal stage-90 release.”

## 2. What v0.8 is—and is not

### It is

- A transparent regional **market-access and finite-demand stress test**.
- A joint model of veneer logs, sawlogs, industrial/pallet logs, pulpwood, and forest energy wood.
- A capacity-constrained transportation allocation across all 25,810 supply cells and admitted buyers at once.
- A delivered-road-cost improvement over radial distance.
- A tool for keeping modeled market weakness separate from weak underlying evidence.
- A research preview for prioritizing field validation, mill research, scenario testing, and later investment or policy analysis.

### It is not

- A census of actual timber movements or mill purchases.
- An estimate of unsold harvested wood.
- A stumpage-price, delivered-margin, or profitability surface.
- A parcel- or stand-level prescription.
- Proof that an inventory point is an active buyer.
- A completed empirical validation of strong and weak market claims.
- The formal stage-90 v0.8 release.

## 3. Analytical design

<div class="nhr-flow"><strong>Model flow:</strong> forest inventory and annual-growth controls → 5-km potential offer → conserved five-product basket; public mill evidence and state TPO receipts → finite buyer-product demand; OpenStreetMap roads → delivered haul access; all three enter the regional allocation, while district evidence and observed outcomes remain a separate validation layer.</div>

This separation is intentional. Inventory supports facility existence and approximate location; TPO supports state/product demand envelopes; roads support access costs; the optimization produces conditional assignments; and observed bid or market evidence is reserved for comparing predictions with real outcomes. One evidence type is not silently substituted for another.

## 4. Spatial scope and product units

The supply domain is the user-provided Northern Hardwood Range Objective 1 boundary intersected with the 12 included U.S. states. It contains **25,810 approximately 5 × 5 km cells** analyzed in **EPSG:5070**. Every cell belongs to exactly one of **233 adopted evidence districts**.

A context buffer inherited from earlier versions allows mills outside the ecological core to appear where evidence and route rules permit. Supply remains limited to the core. Québec, Ontario, and New Brunswick facilities appear as context, but v0.8 does **not** allocate U.S. supply across the international border.

The five product channels are:

1. **Veneer-quality logs** (`veneer_log`)
2. **Sawlogs** (`sawlog`)
3. **Industrial, pallet, and tie logs** (`industrial_log`)
4. **Pulpwood** (`pulpwood`)
5. **Forest energy wood** (`energy_wood`)

Forest energy wood means forest-origin material that could be delivered as a compatible feedstock. Chips, bark, sawdust, firewood, or residues merely produced by a mill do not establish that it buys forest energy wood.

Only veneer-quality material may downgrade, entering the sawlog channel with a penalty. Lower-quality products cannot upgrade. Native veneer movement and veneer downgraded to sawlogs are reported separately.

## 5. Data lineage

Version 0.8 inherits reconciled supply, demand, inventory, and geometry from v0.7–v0.7.2 and adds a rebuilt road graph, full-belt delivered-cost route cache, allocation preview, district evidence context, and standalone display.

| Component | Principal source or artifact | Use in v0.8 | Main limitation |
|---|---|---|---|
| Forest volume and structure | USDA Forest Service TreeMap 2023 and FIA state growth controls | Standing-volume proxy, hardwood share, and state-calibrated annual growth by cell | Imputed/public attributes are not stand inventories; grade recovery remains regional |
| Operability context | NALCMS 2020, DEM/slope, NWI, PAD-US, roads, and coverage diagnostics | Forest mask, review layers, and caution flags | Not yet a complete multiplicative operability or landowner-offer model |
| Offered supply | `cell_product_offered_supply_v0_7_2.csv` | Low/base/high potential annual offer by cell/product; v0.8 solves base supply | Potential offer is not observed harvest, sale volume, or willingness to sell |
| Mill inventory | `mill_inventory_evidence_v0_7_1.csv` | Full inventory display and evidence fields for buyer admission | State rosters vary in vintage and completeness; anonymous TPO points do not identify named receipts |
| State demand | USFS TPO receipts, 2021 for MI/MN and 2023 for the other states | State/product demand envelopes | State totals include wood originating outside the mapped ecological belt |
| Facility demand | `facility_product_demand_bands_v0_7_2.csv` and `physical_site_joint_demand_bands_v0_7_2.csv` | Finite low/base/high product and shared-site limits | Modeled intake, not nameplate capacity, unused capacity, quota, or observed receipt |
| Demand reconciliation | `state_product_demand_envelopes_v0_7_2.csv` | Preserves located demand, unlocated residuals, imports, and other products | 4.08M tons in displayed products are unlocated; broader residual accounting is 11.54M tons |
| Road network | OpenStreetMap Midwest and Northeast `.pbf` extracts plus connector corridor | Continuous log-truck graph and cell-to-buyer access costs | Public road presence is not proof of legal, seasonal, bridge, or private-road access |
| District research | 233-district packets and evidence ledger | Shows research maturity separately from market fit | Only 33 packets had an initial Tier 1 pass at the map snapshot; none had Tier 2 validation |
| Observed outcomes | Four Michigan DNR bid-opening summary sources | Displays 14 reconciled examples | Selected office-linked examples, not a representative or product-specific validation sample |

The inherited demand method is documented in `DEMAND_BAND_METHOD_V0_7_2.md`. Product, terminology, scenario, and route contracts are frozen in `CONTRACT_FREEZE_V0_8.md`.

## 6. Modeled potential annual offer

### 6.1 Supply calculation

The earlier supply workflow progressively reduces and calibrates inventory rather than labeling all standing timber “available”:

1. TreeMap 2023 `VOLCFNET_L` is summarized within each 5-km cell.
2. Hardwood share and mapped forest area produce a hardwood standing-volume proxy.
3. State FIA net-growth controls translate standing volume to an annual hardwood-growth basis.
4. Volume is converted at **35 cubic feet per green short ton**.
5. Scenario growth and likely-offer multipliers are applied.
6. Each cell's offer is divided **once** among the five products so the same harvest is not independently counted five times.

Conceptually, for cell \(i\) and product \(p\):

<pre class="nhr-equation"><code>S_{ip} = G_i \times a \times o \times r_p</code></pre>

where \(G_i\) is state-calibrated annual hardwood growth, \(a\) is the growth multiplier, \(o\) is the likely-offer multiplier, and \(r_p\) is the product-recovery share. Product shares sum to one.

The preview fixes supply at the base case: a growth multiplier of **1.00**, likely-offer multiplier of **0.65**, and **39,888,813.901 green short tons per year**.

### 6.2 Product baskets

| Product | Low basket | Base basket | High basket | Base offer (tons/year) |
|---|---:|---:|---:|---:|
| Veneer-quality logs | 2% | 3% | 4% | 1,196,664.417 |
| Sawlogs | 28% | 42% | 56% | 16,753,301.838 |
| Industrial/pallet logs | 15% | 15% | 15% | 5,983,322.085 |
| Pulpwood | 35% | 25% | 15% | 9,972,203.475 |
| Forest energy wood | 20% | 15% | 10% | 5,983,322.085 |
| **Total** | **100%** | **100%** | **100%** | **39,888,813.901** |

Supply QA contains 387,150 records—25,810 cells × five products × three supply cases—with no negative values and no cell basket exceeding annual growth. Low/base/high total offers are about **24.85 / 39.89 / 57.38 million tons**. The displayed v0.8 allocation uses only the base total and base basket.

The most important supply limitation is that product recovery is a regional scenario basket, not yet a cell-specific function of TreeMap/FIA species, diameter, size class, tree class, and forest type. The total annual basis is more defensible than the local product mix.

There is also a regional harmonization issue. Lake States hardwood share was estimated primarily with live-tree trees-per-acre weights and species/forest-type fallbacks; Mid-Atlantic and New England processing used live trees at least five inches in diameter and basal-area weighting. The combined table is structurally consistent, but the estimator is not identical across all regions. In addition, **45.6% of cells** carry a low-confidence supply-input flag, concentrated in Wisconsin (99.6%), Minnesota (93.8%), and Michigan (87.4%). These are warnings, not automatic tonnage deductions.

Slope, wetlands, protected land, roads, and data coverage are retained as operability cautions but are not silently multiplied into offered tons. Lake States cells also have fewer assembled operability components than the later regional builds.

## 7. Mill inventory, buyer admission, and evidence confidence

### 7.1 Inventory is not demand

All **3,107 public facility records** remain faintly visible regardless of selected product. A point establishes only that a public source placed a facility or anonymous TPO record there. It does not by itself prove current operation, hardwood acceptance, raw-material procurement, or capacity.

Evidence is separated into seven dimensions:

1. Location confidence
2. Operating-status confidence
3. Product confidence
4. Hardwood-species confidence
5. Intake/capacity confidence
6. Procurement-activity confidence
7. Cross-border relevance

This prevents a precise coordinate from masquerading as proof that a site is active and buys a particular feedstock.

The inventory includes **376 Canadian context records**—242 Québec, 101 Ontario, and 33 New Brunswick—but none has a sufficiently supported cross-border capacity role to enter the U.S. allocation. Minnesota retains its different evidence streams separately: 253 named DNR records and 254 anonymous public TPO locations.

### 7.2 Admission rules

A facility-product record enters the allocation only when evidence supports the relevant input direction and product role. Closed, output-only, producer-only, explicit softwood-only, and unlocated records are not routable buyers. Unknown demand is finite; it is never treated as unlimited absorption.

A hardwood pulpwood outlet requires evidence of current operation, hardwood acceptance, roundwood or an explicitly compatible low-grade form, usable location, and procurement activity. Capacity may remain uncertain, but the site then receives a bounded inferred band—not an unlimited market radius.

Veneer evidence distinguishes:

1. Direct veneer processor
2. Explicit veneer-log buyer or exporter
3. Sawmill or log yard with documented veneer sorting or resale
4. Ordinary sawlog fallback through economic downgrade

The display can therefore separate premium veneer access, aggregation access, downgrade-only access, and no supported outlet.

### 7.3 Conservative quarantine

The route-eligible input originally contained 1,342 buyer-product rows. Five disputed nodes were withheld without redistributing their bands:

- ARAUCO Grayling industrial material: hardwood-roundwood acceptance unresolved.
- Root River sawlog and veneer: operating-status conflict.
- Ocooch Mountain sawlog and Radiant Milling sawlog: unresolved 375,000-MBF weight or unit outliers.

The preview therefore uses **1,337 buyer-product nodes** sharing **1,331 physical-site caps**. Quarantine means “not used pending resolution,” not “real demand is zero.”

## 8. Demand bands and reconciliation

### 8.1 State demand envelopes

State TPO primary-product receipts establish low/base/high demand envelopes. Michigan and Minnesota use 2021 data; the other ten states use 2023 data.

| TPO vintage | Low | Base | High |
|---|---:|---:|---:|
| 2021 | 0.70 | 1.00 | 1.30 |
| 2023 | 0.85 | 1.00 | 1.15 |

Seventy-five percent of TPO `Miscellaneous` receipts is distributed among supported modeled products; 25% remains `other_unmodeled`. This choice is especially influential in New Hampshire, New Jersey, New York, and Pennsylvania.

Named rosters, public facility descriptions, size classes, operating changes, and anonymous TPO spatial representation distribute part of each state/product envelope among eligible sites. Production or output figures are used as relative weights unless the source explicitly supports raw intake. Shared physical-site caps prevent several product records from creating several full-capacity mills at one location.

The reconciliation preserves, by state, product, and scenario:

<pre class="nhr-equation"><code>\text{TPO envelope} = \text{located demand} + \text{unlocated residual} + \text{outside-domain reserve} + \text{other unmodeled demand, where applicable}</code></pre>

Explicit softwood evidence in Michigan and Minnesota remains residual rather than being reassigned to hardwood buyers. About **1.48 million tons** of reported receipts are already reserved as imports originating outside the 12 modeled states. The displayed `r20` scenarios then withhold an additional 20% of otherwise available facility demand to test competition from same-state wood outside the mapped ecological belt. That 20% is an uncalibrated sensitivity, not a measured procurement share.

Demand QA covers 1,493 reconciliation rows, including 1,342 originally route-eligible rows and 84 unlocated-residual rows. It passed 736 of 738 checks and retained two warnings concerning external-reserve scope and residue-table interpretation.

### 8.2 Strength of the current demand evidence

All inherited capacity-bearing records are classified as `modeled_state_calibrated_facility_share`, not observed intake. In the default allocation:

- **48.0%** of assigned volume goes to anonymous TPO canonical locations;
- **22.0%** goes to nodes whose current operating status is `unknown`;
- **9.8%** uses `soft_assumption_primary_input` feedstock direction; and
- **9.9%** goes to nodes whose hardwood status is `unknown`.

Across the full inventory, 1,953 of 3,107 records are anonymous, 2,356 have unknown intake confidence, and only 31 have high procurement confidence. These facts do not make the allocation mathematically invalid; they make buyer validation the highest-value empirical reinforcement step.

About 4.08 million tons across the five displayed central product envelopes remain unlocated before solving, concentrated in Minnesota (~2.02M), Wisconsin (~1.05M), Michigan (~0.81M), and New York (~0.16M). Unlocated demand means public evidence could not place it at qualified sites—not that the demand is absent.

## 9. Delivered-cost road access

### 9.1 Graph construction

Version 0.8 replaces circular access with a continuous OpenStreetMap network built from Midwest and Northeast extracts plus a lower-Michigan/Ohio/Pennsylvania/New York connector corridor. Original node and way identities are retained. Included road classes run from motorway through unclassified; ways tagged `no`, `private`, `military`, or `emergency` are excluded.

Base speeds are 55 mph motorway, 50 trunk, 45 primary, 40 secondary, 35 tertiary, and 30 unclassified, with lower link speeds. Gravel raises time by 10%, poor surfaces by 35%, and unknown-surface unclassified roads by 10%.

The audited graph contains **15,478,116 nodes** and **28,315,923 directed edges**. The dominant weak component contains about **97.878% of nodes** and **97.794% of edges**. Graph structure, identity, and coverage QA passed.

### 9.2 Snapping and route candidates

All supply cells and 3,106 usable facility coordinates were processed for snapping; one inventory coordinate is an outlier. Routing QA admits 25,572 supply origins. About **99.08%** of cells are within 10 km of the graph and **99.96%** of core facilities are within 5 km. The 95th-percentile snap distances are approximately 4,365 m for supply and 1,264 m for facilities.

Product-specific straight-line envelopes determine which pairs are sent to road routing:

| Product | Search envelope |
|---|---:|
| Veneer-quality logs | 300 km |
| Sawlogs | 250 km |
| Industrial/pallet logs | 200 km |
| Pulpwood | 150 km |
| Forest energy wood | 100 km |

These are candidate bounds, not findings that all trips inside them are economically viable.

### 9.3 Delivered-haul cost

Low/base/high route-cost scenarios were built; the displayed allocation uses **base haul only**. Base parameters include:

- 1.75 terminal hours;
- $100 per truck hour;
- $1.40 per total truck mile;
- 1.9 return-distance factor;
- 1.15 seasonal-edge time multiplier;
- 1.30 winter-service “no” multiplier;
- 10 mph origin-spur and 15 mph facility-spur speeds; and
- 2.0 spur-cost multiplier.

Payloads are 23 tons veneer, 24 sawlogs, 25 industrial logs, 25 pulpwood, and 18 energy wood. Maximum admissible delivered-haul costs are $90, $50, $40, $28, and $18 per ton respectively.

Conceptually:

<pre class="nhr-equation"><code>C_{ijp}=\frac{\text{terminal cost}+\text{return-adjusted network cost}+\text{seasonal and spur costs}}{\text{payload}_p}</code></pre>

The full run evaluated 1,297 destination units and produced **8,674,211 candidate pairs** or **26,022,633 low/base/high records** in four nonoverlapping, restartable shards. There were 1,267 completed units, 30 valid empty units, and zero failed units. Merge QA passed. The allocation uses all **4,485,878** admitted, economically eligible base-haul arcs after supply/product/demand joins; it does not retain only a few nearest buyers.

Routes are access evidence, not observed deliveries. Map connections are straight visual lines between centroid and buyer; road distance and cost come from the network, but the displayed line is not the route geometry.

## 10. Regional allocation

Let \(x_{ijp}\) be tons assigned from cell \(i\) to buyer \(j\) through compatible product channel \(p\). The network is:

`source → cell-product offer → buyer-product demand → shared physical site → sink`

OR-Tools 9.14.6206 `SimpleMinCostFlow` applies a lexicographic objective:

1. Maximize total modeled tons finding a destination.
2. Among maximum-throughput solutions, minimize haul cost plus a **$25/ton veneer-to-sawlog downgrade penalty**.

The solution enforces cell-product supply, buyer-product capacity, shared-site capacity, evidence and product compatibility, route eligibility, reserves, and quarantine. Veneer downgrade consumes the same sawlog pool as native sawlogs. Lower products cannot upgrade.

The model uses 0.01-ton integer units and cent-per-ton costs. Flooring leaves about 635 tons below retained integer increments across the 39.89-million-ton basket.

This is not a maximum-net-value model. It omits stumpage, harvest, loading or processing beyond trucking, mill-gate value, current utilization, contracts, and forest-owner profit. It also does not require every coproduct of a proposed treatment to find a buyer before declaring that treatment feasible.

### Scenarios

Supply and haul are fixed at base. Facility demand and additional nonbelt reserve vary:

| Scenario | Demand | Reserve | Assigned tons/year | Share of base offer |
|---|---|---:|---:|---:|
| `low_r20` | Low | 20% | 8,481,830 | 21.26% |
| `base_r20` **default** | Base | 20% | 12,103,595 | 30.34% |
| `high_r20` | High | 20% | 14,381,436 | 36.05% |
| `low_r00` | Low | 0% | 10,083,867 | 25.28% |
| `base_r00` | Base | 0% | 13,995,246 | 35.09% |
| `high_r00` | High | 0% | 15,992,083 | 40.09% |

These are sensitivities, not statistical confidence intervals.

### Default product results

| Product | Assigned | Offer | Assigned share | Key caution |
|---|---:|---:|---:|---|
| Forest energy wood | 286,794 | 5,983,322 | 4.8% | Feedstock direction and buying evidence are sparse |
| Industrial/pallet logs | 1,492,042 | 5,983,322 | 24.9% | Facility roles remain unevenly verified |
| Pulpwood | 2,699,492 | 9,972,203 | 27.1% | Public facility evidence varies sharply by state |
| Sawlogs | 7,215,930 | 16,753,302 | 43.1% | Physical assignment is not grade value or profitability |
| Veneer-quality logs | 409,337 | 1,196,664 | 34.2% total | 208,592 tons are native veneer; 200,745 are downgraded |

Alternative optimal or near-equivalent solutions can redistribute some cell-level flows while preserving system throughput and cost. Regional patterns are more stable than a single cell-to-mill pairing. A cell's match also need not rise monotonically when total demand rises because all cells compete together.

## 11. Map display and interpretation

The default “fit” surface is total assigned modeled tons divided by total potential offer for the joint basket. Warm colors mean a larger assigned share; cool colors mean a smaller assigned share. The alternate supply surface shows potential offer itself. Neither surface directly measures price, profit, purchases, observed harvest, or sale success.

The full facility inventory remains faintly visible. Compatible admitted buyers are highlighted for the selected product. The cell panel reports offer, assigned and unassigned modeled volume, native versus downgraded movement, weighted haul cost, product basket, scenario sensitivity, buyer connections, unlocated state demand, evidence notes, and available observations.

The “weakest material native channel” is the lowest native assigned share among products offering at least **25 tons/year** and at least **2% of the cell basket**. These are display thresholds, not economic break-even rules.

District outlines communicate evidence maturity separately:

- Solid: initial Tier 1 packet pass.
- Dashed: research complete but packet not independently passed.
- Dotted: research incomplete.

The outline is not a market grade. A frozen taxonomy exists for a future categorical market/evidence classification, but the present map is a continuous matched-share surface. It does not yet implement calibrated “strong,” “difficult,” or “weak” categories.

| Visible combination | Appropriate reading |
|---|---|
| Cool fit + stronger evidence | Priority candidate for genuine market weakness and outcome validation |
| Cool fit + weak evidence | Could be market weakness, missing buyers, understated demand, or several together |
| Warm fit + stronger evidence | Candidate stronger market that still needs outcome and price checks |
| Warm fit + weak evidence | Potentially optimistic assumption requiring buyer and capacity confirmation |

## 12. Local evidence and outcome validation

### 12.1 District coverage

The adopted Stage 62.3 geography partitions all cells into **233 districts**, each no more than 175 km across and covering no more than two states. It supersedes the older 177-zone design; reports based on 177 zones are not current coverage records.

At the map snapshot:

- 116 districts were research-complete, covering 16,911 cells (65.5%);
- 111 had materialized canonical packets, covering 16,575 cells (64.2%);
- 33 had an initial independent Tier 1 packet pass, covering 5,640 cells (21.9%);
- zero had completed Tier 2 validation; and
- zero were eligible for formal stage 65.

Research remained incomplete in 117 districts: Maine 6, Michigan 46, Minnesota 37, New York 10, and Wisconsin 18. Five research-complete districts lacked canonical packets, and 78 existing packets had not passed independent Tier 1 gating. Later tightened audits rejected several earlier passes for missing current intake/procurement proof, weak district-linked outcomes, identity/hash problems, or unresolved conflicts. “Initial packet pass” is therefore deliberately cautious language.

A Grayling-parity packet should contain a manifest, zone context, facility/product claims, seven confidence dimensions, source ledger, negative and conflicting evidence, observed performance, demand reconciliation, frozen prediction comparison, validation summary, and QA. See `GRAYLING_PARITY_VALIDATION_STANDARD.md` and `EVIDENCE_RESEARCH_OPERATING_PROTOCOL.md`.

### 12.2 What local evidence currently changes

The **111 packets do not yet revise buyer admission, demand bands, routes, or allocation**. The solver manifest records `evidence_admission_changed: false`, and no accepted stage-65 snapshot exists. District packet status and source notes are display context and assembled research—not hidden model calibration.

The map includes 14 independently reconciled Michigan bid-opening examples from four DNR summaries: seven bid and seven no-bid events. They demonstrate the intended observation workflow but do not validate the belt because they are selected, office-linked rather than sale-polygon-linked, mixed-product, and not representative. A no-bid does not identify a hardwood product cause; a bid does not prove award, harvest, delivery, or destination. Observations never create mill capacity.

A Grayling identity issue also needs resolution. The preregistered panel's Grayling district is `EZ63_4d5648586fc90709` (183 cells), while the map's Grayling–Crawford examples use `EZ63_0bafc0848c71fb05` (34 cells). They cannot be treated as the same validation unit without an explicit crosswalk and scope decision.

### 12.3 Preregistered Tier 2 panel

A 30-district panel was selected before outcome evaluation using seed `20260903`: 20 development districts and 10 untouched holdout districts, spanning all 12 states and five products. The holdout should be opened only after development evidence is complete and calibration is frozen.

No district has passed Tier 2. One collection batch was quarantined after prohibited local-file access compromised blinding. Clean or remediated collection currently covers only ten development districts, and neither development batch is evaluator-ready. The remaining development work must follow the preregistered procedure before the holdout is opened. See `TIER2_VALIDATION_PANEL_PREREGISTRATION_V0_8.md`.

## 13. Product and geographic findings that require targeted checking

These are not established conclusions; they are high-value validation targets created by the current model:

- **Energy wood:** 4.8% assigned; 91.5% of cells have no admitted buyer. Missing feedstock-direction or procurement evidence could readily resemble market weakness.
- **Pulpwood:** 27.1% assigned; roughly two-thirds of cells have no admitted buyer. Wisconsin's 77.5% modeled fit contrasts with New York's 3.6%, Vermont's 0.2%, and near-zero southern New England results.
- **Industrial logs:** 24.9% assigned. Apparent Michigan and Wisconsin strength depends on panel/industrial roles that remain incompletely verified.
- **Sawlogs:** 43.1% assigned. High modeled results in New Jersey and Pennsylvania versus low Massachusetts/New Hampshire results may reflect localized demand, small denominators, cross-state competition, or anonymous-site assumptions.
- **Veneer:** native fit is only 17.4%; another 200,745 tons move through downgrade. High total fit does not necessarily mean premium veneer access.
- **Cross-border areas:** absent supported Canadian demand may bias northern New York, Vermont, Maine, and parts of the Lake States toward apparent weakness.

Specific records and transitions requiring attention include Minnesota's Root River status, Michigan's ARAUCO hardwood-roundwood role, Weyerhaeuser and PCA Filer City intake, Wisconsin capacity outliers, Maine's largely anonymous located pulp demand, New York's Finch transition and current Sylvamo procurement, PA/NJ veneer roles, and Vermont's dependence on adjacent states and Québec.

## 14. Production workflow

### 14.1 Formal unattended sequence

The unattended runner is restartable, checkpointed, fail-closed, and independent of an AI session. It uses a single lock, atomic status/checkpoints, input fingerprints, bounded workers, disk-space gates, and resumable route shards. The authoritative stage manifest is `runner/pipeline.json`.

| Stage | Function | Status |
|---:|---|---|
| 00 | Input, software, frozen-artifact, and disk preflight | Passed, 35/35 |
| 05 | Road inputs and runtime preflight | Passed |
| 07 | Product, terminology, scenario, cost, and shard contracts | Passed, 62/62 |
| 10 | Frozen Grayling regression | Passed |
| 20 | Diagnose inherited split graph | Diagnostic passed; old graph blocked from production |
| 25 | Three-destination route smoke | Passed |
| 30 | 70-destination, 12-state, five-product benchmark | Passed |
| 40 | Build continuous production graph | Completed |
| 42 | Build supply and facility snaps | Completed |
| 45 | Deep graph audit | Passed; release-ready for routing |
| 50 | Build four full-belt route shards | Completed; zero failed units |
| 60 | Strictly merge route shards | Passed |
| 65 | Accepted evidence snapshot | **Unavailable / gate closed** |
| 70 | Formal global allocation | **Unavailable / gate closed** |
| 80 | Formal map build | **Unavailable / gate closed** |
| 90 | Formal release QA | **Unavailable / gate closed** |

The completed cache is `delivered_cost_routes_v0_8.parquet`; `merged_routes_v0_8.json` records the PASS. The route-output SHA-256 is `97768829e5e3cd24ba61376306a9796a0646ace7a9b0120a039878cba3facd4f`, and the full route run identity is `36e1cee526cf179f8ad4`.

The four numbered launchers in `v0.8/runner` run through stages 10, 30, 45, and 60. A power interruption is recovered by rerunning the same launcher; completed partials are reopened and hash-validated.

### 14.2 Research-preview build

The hosted map used this separate sequence:

1. `build_evidence_context.py`
2. `test_flow_contract.py`
3. `solve_belt_flow.py`
4. `build_map.py`
5. `browser_qa.mjs`

The first four use the configured ArcGIS Python runtime; browser QA uses bundled Node/Playwright and local Chrome. This sequence currently lacks an official numbered launcher and runner checkpoints.

## 15. Quality assurance completed

- All six solves passed supply, product-capacity, shared-site-capacity, reserve, residual, quarantine, product-direction, and quantization checks.
- Tiny-network regressions cover scarce demand, maximum-throughput then minimum-cost behavior, shared-site capacity, veneer fallback, no-route supply, and the 20% reserve.
- Graph and route QA cover identity, structure, components, snaps, completeness, nonoverlap, provenance, status, and row counts.
- Map assembly passed with 25,810 cells, 3,107 inventory records, 1,337 demand nodes, six scenarios, and 233 districts.
- Offline browser QA checked full counts, scenario changes, product filtering, Grayling details, mobile overflow, removal of hover-title text, and zero external requests.

The standalone artifact is `northern_hardwood_market_basket_v0_8_preview.html`:

- 31,917,520 bytes;
- SHA-256 `19f2b45efca65af1e7d1046a4979a15306cb0e32aecd1ee899fbba374c57679e`;
- no external runtime dependencies.

The analytical scenarios were generated September 3. The revised heading and display shell were rebuilt September 8 without changing the numerical manifest. The website copy was committed as `0b39b8add64e85a412c4fc90b43acdee7327bbbb`; HTTP, title, and heading checks passed. No site navigation or blog link was added. See `PUBLIC_DEPLOYMENT_CHECKPOINT_2026-09-08.md`.

## 16. Claim boundaries

| Claim level | Example | Current status |
|---|---|---|
| Descriptive evidence | “This dated source identifies a facility here and supports this product role.” | Permitted where the ledger supports each element |
| Conditional result | “In `base_r20`, this cell assigns 28% of modeled pulpwood offer within the route-cost envelope.” | Permitted with scenario and evidence caveats |
| Screening interpretation | “This district is a candidate pulpwood-pressure area under current assumptions.” | Permitted when market and evidence weakness are separate |
| Observed outcome | “This sale received no bids” or “three bidders participated.” | Permitted only with a dated, linked source and product caveats |
| Validated market-health conclusion | “Pulpwood markets are demonstrably weak in this district.” | **Not supported belt-wide; requires Tier 2 and holdout performance** |
| Financial or operational prediction | “This sale will fail” or “this treatment is profitable.” | **Not supported by v0.8** |

Use “assigned,” “matched,” and “unassigned modeled offer.” Avoid “delivered,” “purchased,” “sold,” “served,” “stranded,” and “profitable” unless an observation or later economic analysis supports the term.

## 17. What still needs to be done

Documentation and evidence reinforcement are the immediate critical path, but they are not the only unfinished work.

### Priority 0 — Preserve and document the release

Required:

- Keep the page labeled as a research preview.
- Publish a concise methods page, data dictionary, source and assumption registers, change log, and release manifest.
- Record source date, license, stable locator or archive, and checksum for every raw input.
- Capture the full software environment in a lock file or container.
- Remove hard-coded machine paths and cross-version imports.
- Put builders, contracts, QA, and accepted packets under version control and independent backup; only rendered website artifacts are currently committed online.
- Preserve a dated machine-readable result for the solver regression tests.

**Acceptance:** another analyst can trace every input, reproduce the six totals from a clean environment, and match the accepted HTML hash.

### Priority 1 — Finish Tier 1 evidence for all 233 districts

Required:

- Research the remaining 117 districts.
- Materialize the five completed-but-missing packets.
- Independently adjudicate the 78 canonical-but-ungated packets.
- Apply the Grayling structure everywhere, including negative searches, conflicts, dates, and geographic relevance.

**Acceptance:** 233 canonical, independently reviewed packets with five explicit product dispositions, seven confidence dimensions, source locators/dates/tiers, conflict treatment, hashes, and no unresolved schema blockers.

### Priority 2 — Validate flow-dominant facilities and locate demand

Required:

- Rank buyers by assigned volume and concentration, not just by record count.
- Verify operation, raw-input direction, hardwood acceptance, product role, procurement activity, coordinate, sourcing area, and finite intake band.
- Resolve the five quarantined nodes without pre-redistributing their volume.
- Locate or explicitly bound the 4.08M displayed-product and 11.54M broader residual-demand totals.
- Reconcile closures, curtailments, quotas, expansions, and seasonal buying.

**Acceptance:** facilities accounting for at least 90% of modeled flow in each state-product combination are currently evidenced or explicitly excluded, and remaining unlocated demand is represented as a visible sensitivity.

### Priority 3 — Complete independent outcome validation

Required:

- Complete and gate all 20 development districts without opening the holdout.
- Gather linked bidder counts, no-bid/reoffer rates, bid-to-appraisal ratios, stumpage prices, withdrawals, curtailments, and credible local confirmations.
- Predefine treatment of mixed-product sales and nonmarket failures.
- Compare frozen product predictions with outcomes using confusion matrices, abstention, calibration, rank agreement, and a mismatch taxonomy.
- Freeze calibration before evaluating the ten holdout districts once.

**Acceptance:** useful out-of-sample agreement is demonstrated and failures are reported, not tuned away.

### Priority 4 — Spatialize and validate the product basket

Required:

- Estimate cell-varying product recovery from species, diameter, size class, tree class, and forest type.
- Calibrate with utilization, grade-yield, scaling, and logging studies.
- Preserve joint-harvest conservation and expose uncertainty.

**Acceptance:** product shares respond credibly to local forest composition and reproduce independent regional utilization totals within documented tolerances.

### Priority 5 — Separate growth, operability, willingness, and actual offer

Required:

- Model terrain, wetlands, seasonal access, protection, ownership, parcel fragmentation, landing cost, logger availability, landowner willingness, and sale timing as distinct factors.
- Compare potential offer with removals and sale programs without treating historically suppressed removals as unconstrained supply.
- Allow ecologically or economically appropriate material to remain on site.

**Acceptance:** standing resource, sustainable growth, operable volume, likely offer, and economic offer can be reported separately.

### Priority 6 — Add value and treatment economics

Required:

- Add harvest, processing, loading, stumpage, and mill-gate value ranges by product, species, grade, and region.
- Compare volume-first allocation with delivered-margin or maximum-net-value objectives.
- Model joint treatment feasibility and distinguish physical disposal from grade-value preservation.

**Acceptance:** the map can distinguish “a buyer might take it” from “it can plausibly move at a positive margin.”

### Priority 7 — Improve routes and cross-border context

Required:

- Add seasonal closures, spring-thaw restrictions, bridge/weight limits, local truck rules, forest/private roads, and realistic landings or entrances.
- Calibrate payloads, terminal time, return factor, speeds, surface penalties, and ceilings.
- Before enabling Canada, verify Ontario, Québec, and New Brunswick buyer roles, cross-border procurement, border time/cost, currency, and regulatory constraints.

**Acceptance:** reviewed local routes and border behavior agree with model access closely enough for district-scale use.

### Priority 8 — Test stability and establish maintenance

Required:

- Vary supply, demand, haul, reserve, product recovery, evidence admission, closures, quotas, and expansions.
- Identify stable versus assumption-sensitive hot and cold areas.
- Audit alternative optimal assignments and avoid parcel-level precision.
- Refresh TPO, mill status, and observed outcomes on a published schedule with stale-source flags and regression tests.

**Acceptance:** each market interpretation carries a stability statement and data-vintage record.

## 18. Reproducibility risks

1. The analytical workspace is not a Git repository; only rendered public HTML copies are committed online.
2. No environment lock captures ArcGIS Python, DuckDB, pandas, PyArrow, GeoPandas, Node, Playwright, and Chrome together.
3. Some paths are hard-coded to this computer and earlier-version directories.
4. The map builder imports v0.7.1/v0.7.2 assets, creating cross-version coupling.
5. OSM inputs are identified by path, size, and time rather than raw-file SHA-256, although final graph and route artifacts are hashed.
6. The first evidence-context build may require live retrieval if cached Michigan DNR snapshots are missing.
7. The standalone HTML is portable but approximately 32 MB and can be slow on constrained connections.
8. The research-preview sequence is not yet wrapped in the restartable runner.

These are production issues, not cosmetic documentation gaps, and should be resolved before calling v0.8 a reproducible formal release.

## 19. Version lineage

- **v0.7.1** established the full U.S. belt inventory, persistent faint mill context, separate confidence fields, product-specific admission, and corrected pulpwood and veneer roles.
- **v0.7.2** developed the Grayling market-health pilot, finite demand bands, offered-supply contract, delivered-cost routing design, and explicit market/evidence separation.
- **v0.8** operationalized the continuous 12-state graph and restartable route cache, adopted the 233-district evidence framework, solved a belt-wide finite-demand preview, and assembled the current standalone map.

Grayling remains the standard for local evidence depth. Belt-wide coverage does not replace that rigor; it identifies where the rigor matters most.

## 20. Key project records

### Map and interpretation

- `READ_THIS_FIRST.md`
- `northern_hardwood_market_basket_v0_8_preview.html`
- `MARKET_PREVIEW_CHECKPOINT_2026-09-03.md`

### Methods and contracts

- `market_preview/README.md`
- `market_basket_map/README.md`
- `CONTRACT_FREEZE_V0_8.md`
- `delivered_cost_route_contract_v0_8.json`
- `route_shard_contract_v0_8.json`
- `product_channels_v0_8.json`
- `scenario_axes_v0_8.json`

### Evidence and validation

- `DISTRICT_STATUS_LEDGER_SUMMARY_V0_8.md`
- `EVIDENCE_RESEARCH_OPERATING_PROTOCOL.md`
- `GRAYLING_PARITY_VALIDATION_STANDARD.md`
- `TIER2_VALIDATION_PANEL_PREREGISTRATION_V0_8.md`
- `QA_REMEDIATION_WAVE_PLAN.md`

### Production and QA

- `runner/README.md`
- `runner/pipeline.json`
- `graph_audit_v0_8.json`
- `full_belt_route_shards_v0_8.json`
- `merged_routes_v0_8.json`
- `map_assembly_qa.json`
- `browser_qa.json`
- `PUBLIC_DEPLOYMENT_CHECKPOINT_2026-09-08.md`

## 21. Recommended citation

> **Northern Hardwood Market Strength and Weakness Map, version 0.8 research preview (2026).** A conditional five-product, finite-demand, delivered-road-cost allocation model for the 12-state U.S. northern-hardwood belt. Results describe modeled access under stated assumptions and have not completed belt-wide empirical outcome validation.
