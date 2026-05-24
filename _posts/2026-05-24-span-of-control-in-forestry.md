---
layout: post
title: "Span of Control in Forestry"
date: 2026-05-24
categories: [northern-hardwoods, research, travel]
tags: [Northern Hardwoods Resilience Project, forestry, silviculture, megatrip, fieldwork, span of control, staffing]
excerpt: "A time-budget look at how many acres one forester can realistically manage with intensive silviculture."
---

I was chatting with a state forester recently about a concept that rarely makes it into academic literature but dictates almost everything on the ground: the practical span of control. We talk constantly about sustainable harvest levels and silvicultural prescriptions, which are the specific management plans tailored to a forest stand, but we rarely calculate the physical limits of human bandwidth.

When an agency or land management firm assigns a single forester a massive footprint, say a round number like 20,000 acres, there is an underlying assumption that the land is being actively managed. In reality, raw acreage is a deceptive metric. The true ceiling of sustainable forestry is a time-budget problem, determined by active decision acres and the long administrative tail that follows every single harvest.

## The First Attempt: The Back-of-the-Napkin Calculation

To see how this looks on paper, we can run a simple, back-of-the-napkin calculation using standard baseline assumptions for northern hardwoods. Let us look at a manageable 5,000-acre baseline first to see how the logic operates.

If we assume a typical 20-year re-entry interval, which is the time elapsed between scheduled harvests in the same stand, then a 5,000-acre forest requires 250 active treatment acres per year. If our average timber sale unit is 40 acres, the math is straightforward:

<div class="nhr-equation" role="img" aria-label="Annual sales equals 250 active acres divided by 40 acres per sale, which equals 6.25 sales per year.">
  Annual Sales =
  <span class="frac"><span>250 active acres</span><span>40 acres per sale</span></span>
  = 6.25 sales per year
</div>

On paper, managing six or seven sales a year sounds like a comfortable workload. A forester should easily have enough time to mark the timber, write the prescriptions, and file the paperwork. If we scale that exact same logic up to a 20,000-acre assignment, the formula implies the forester just needs to clear 1,000 active acres across 25 sales each year.

## The "Oh No" Reality Check

That clean paper model quickly falls apart the moment it hits real-world operational friction. The first major flaw is assuming a forester is responsible for only 5,000 acres. Oftentimes, it will be four or more times that. Second is the assumption that forest treatments occur in perfect, uniform blocks. In practice, timber sales follow a wide bell curve, frequently stretching from tight 13-acre cuts to 120-acre structural thinnings, with 40 acres serving as an assumed mean.

Even small sales can carry a high fixed administrative time cost. Setting up a 13-acre sale requires almost the same baseline of desk work as a 100-acre sale: you must still establish boundaries, verify property lines, draft the contract, and advertise the bid package. A year dominated by smaller, fragmented units results in a skyrocketing administrative workload, even if the total treated acreage remains the same.

Furthermore, the initial calculation can overlook the fact that foresters cannot teleport. Windshield time, meaning the hours spent driving to remote, scattered forest units, consumes a significant portion of the work week. Weather and other surprises can also interfere with schedules.

Beyond travel and incidentals, the most glaring omission in the presumptive model is the monitoring tail and the continuous requirement for forest inventory. Forestry is not a sequence of isolated cutting events: it is a continuous loop of verification and measurement. Most sustainable forestry certifications mandate regular field checks:

**One-year post-harvest:** Verifying Best Management Practices (BMPs) for water quality and soil stabilization.

**Three-year post-harvest:** Evaluating seedling regeneration and assessing deer browse impacts.

**Five-year post-harvest:** Monitoring for invasive species introductions and overall stand health.

**Ten-year inventory cycle:** Standard agency policy usually requires a complete re-inventory of every stand every ten years to maintain accurate database records.

## Our Span of Control Model V2

If we rebuild the calculation for a 20,000-acre responsibility and include these missing operational components, the numbers change dramatically.

On a 20-year rotation, our forester must handle 1,000 active treatment acres per year. Assuming the historical mean of 40 acres per unit, which may be large, that requires establishing 25 distinct sales annually. Cruising the forest, which means walking lines to collect tree inventory data, adds an additional, massive baseline burden. A 10-year inventory cycle for a 20,000-acre forest requires cruising 2,000 background acres each year, independent of active timber sales.

The table below breaks down a realistic hour budget for these combined responsibilities:

| Workload Component | Operational Assumption | Annual Hours Required |
| --- | --- | ---: |
| Sale Layout & Timber Marking | 1.5 hours per active acre for cruising, marking, and boundary paint | 1,500 hours |
| Bidding, Contracts, & Administration | 40 hours per sale contract, with 25 sales per year | 1,000 hours |
| Active Sale Inspections & Travel | 2 hours per week per active sale during harvest | 800 hours |
| Post-Harvest Certification Checks | 1, 3, and 5-year regeneration and invasive monitoring | 300 hours |
| Mandatory 10-Year Inventory | Cruising 2,000 background acres at 0.25 hours per acre | 500 hours |
| General Stewardship & Public Inquiries | Forest health anomalies, boundary disputes, and road washouts | 400 hours |
| **Total Annual Workload** |  | **4,500 hours** |

Considering that a single full-time employee provides roughly 1,100 to 1,400 hours of actual, direct field-management capacity per year after subtracting leave, mandatory training, and general agency meetings, a 20,000-acre forest actually requires three to four full-time foresters to manage intensively.

To see how these operational constraints scale within your own organization or geographic region, use the interactive calculator below. By adjusting the sliders, you can simulate different management scenarios, test the impact of smaller or larger average sale sizes, and calculate exactly how many full-time foresters are required to maintain intensive, sustainable silviculture on a given landscape footprint.

<section class="nhr-calculator" id="span-control-calculator" aria-labelledby="span-control-title">
  <h3 id="span-control-title">Span of Control Calculator</h3>
  <div class="nhr-calc-grid">
    <div class="nhr-calc-control">
      <label for="soc-acres">Total District Acres</label>
      <output id="soc-acres-value" for="soc-acres">20,000 acres</output>
      <input id="soc-acres" type="range" min="1000" max="50000" step="500" value="20000">
    </div>
    <div class="nhr-calc-control">
      <label for="soc-reentry">Re-entry Interval</label>
      <output id="soc-reentry-value" for="soc-reentry">20 years</output>
      <input id="soc-reentry" type="range" min="5" max="40" step="1" value="20">
    </div>
    <div class="nhr-calc-control">
      <label for="soc-sale-size">Average Sale Size</label>
      <output id="soc-sale-size-value" for="soc-sale-size">40 acres</output>
      <input id="soc-sale-size" type="range" min="10" max="160" step="5" value="40">
    </div>
    <div class="nhr-calc-control">
      <label for="soc-admin">Fixed Setup Hours Per Sale</label>
      <output id="soc-admin-value" for="soc-admin">40 hours</output>
      <input id="soc-admin" type="range" min="10" max="100" step="5" value="40">
    </div>
    <div class="nhr-calc-control">
      <label for="soc-inventory">Inventory Cycle</label>
      <output id="soc-inventory-value" for="soc-inventory">10 years</output>
      <input id="soc-inventory" type="range" min="5" max="25" step="1" value="10">
    </div>
    <div class="nhr-calc-control">
      <label for="soc-field-hours">Direct Field Hours Available Annually</label>
      <output id="soc-field-hours-value" for="soc-field-hours">1,300 hours</output>
      <input id="soc-field-hours" type="range" min="800" max="1800" step="50" value="1300">
    </div>
  </div>
  <div class="nhr-calc-results" aria-live="polite">
    <div class="nhr-calc-result">
      <strong>Annual Active Treatment Acres</strong>
      <span id="soc-active-acres">1,000</span>
    </div>
    <div class="nhr-calc-result">
      <strong>Annual Sale Units</strong>
      <span id="soc-sale-units">25.0</span>
    </div>
    <div class="nhr-calc-result">
      <strong>Total Annual Workload</strong>
      <span id="soc-workload">4,500 hrs</span>
    </div>
    <div class="nhr-calc-result">
      <strong>Required Workforce</strong>
      <span id="soc-fte">3.5 FTE</span>
    </div>
  </div>
  <p class="nhr-calc-note">Fixed model assumptions: 1.5 prep hours, 0.8 inspection/travel hours, and 0.3 post-harvest monitoring hours per active acre; 0.25 inventory hours per inventory acre; and 0.02 background stewardship hours per district acre.</p>
</section>

Behind the interactive simulator sits an expanded operational model that accounts for the cumulative impact of active harvest preparation, fixed contract administration, mandatory inventory tracking, and background stewardship maintenance. This multi-variable equation quantifies the cumulative workload, which allows land managers to pinpoint exactly where administrative bottlenecks emerge as district sizes expand:

<div class="nhr-equation" role="img" aria-label="W equals A divided by R times the sum of h prep, h inspection, and h post, plus A divided by R times S multiplied by h admin, plus A divided by I multiplied by h inventory, plus A multiplied by h background.">
  W =
  <span class="frac"><span>A</span><span>R</span></span>
  (h<sub>prep</sub> + h<sub>insp</sub> + h<sub>post</sub>)
  +
  <span class="frac"><span>A</span><span>R &middot; S</span></span>
  (h<sub>admin</sub>)
  +
  <span class="frac"><span>A</span><span>I</span></span>
  (h<sub>inv</sub>)
  + A &middot; h<sub>bg</sub>
</div>

In this formulation, <em>W</em> represents the total annual operational hours required to sustain the forest tract. The geographic scale of responsibility is captured by <em>A</em>, which represents the total district footprint in acres, while <em>R</em> represents the re-entry interval in years, and <em>I</em> represents the mandatory inventory cycle length in years. The operational units are defined by <em>S</em>, which is the average treatment size in acres. Time allocations are distributed across specific field and office tasks, where <em>h</em><sub>prep</sub> represents the layout and tree marking hours per active acre, <em>h</em><sub>insp</sub> represents active harvest inspection hours per active acre, and <em>h</em><sub>post</sub> represents post-harvest certification monitoring hours per active acre. The fixed overhead constraints are isolated by <em>h</em><sub>admin</sub>, which represents the baseline contract preparation and bidding hours per sale, while <em>h</em><sub>inv</sub> represents plot-level cruising hours per inventory acre, and <em>h</em><sub>bg</sub> represents background stewardship hours per district acre.

Expressing the time budget in this manner demonstrates that a forester's capacity is rarely limited by a single variable, because an adjustment to any single parameter propagates across the entire management system. For example, compressing the re-entry interval or reducing the average sale size increases the frequency of contract boundary layouts, which accelerates the consumption of available field hours. By analyzing the interactions among these variables, organizations can move beyond arbitrary acreage quotas and design staffing structures that reflect the true physical constraints of field operations.

## What Does "Responsible For" Actually Mean?

When we see a single forester assigned to a 20,000-acre area, they are rarely practicing idyllic and intensive, stand-level silviculture taught in textbooks; rather, they are practicing triage. They are often deciding which few hundred acres will receive meticulous attention this year, while accepting that the remaining thousands of acres must be managed via deferred entries, standardized prescriptions, or broad, landscape-scale planning. The physical bottleneck in forestry is the number of stands a human being can realistically walk, mark, inspect, maintain, and return to monitor in a year.

<script>
(function () {
  var calculator = document.getElementById("span-control-calculator");
  if (!calculator) return;

  var constants = {
    prepHoursPerAcre: 1.5,
    inspectionHoursPerAcre: 0.8,
    postHarvestHoursPerAcre: 0.3,
    inventoryHoursPerAcre: 0.25,
    backgroundHoursPerAcre: 0.02
  };

  var controls = {
    acres: document.getElementById("soc-acres"),
    reentry: document.getElementById("soc-reentry"),
    saleSize: document.getElementById("soc-sale-size"),
    admin: document.getElementById("soc-admin"),
    inventory: document.getElementById("soc-inventory"),
    fieldHours: document.getElementById("soc-field-hours")
  };

  var outputs = {
    acresValue: document.getElementById("soc-acres-value"),
    reentryValue: document.getElementById("soc-reentry-value"),
    saleSizeValue: document.getElementById("soc-sale-size-value"),
    adminValue: document.getElementById("soc-admin-value"),
    inventoryValue: document.getElementById("soc-inventory-value"),
    fieldHoursValue: document.getElementById("soc-field-hours-value"),
    activeAcres: document.getElementById("soc-active-acres"),
    saleUnits: document.getElementById("soc-sale-units"),
    workload: document.getElementById("soc-workload"),
    fte: document.getElementById("soc-fte")
  };

  function number(value) {
    return Number(value).toLocaleString("en-US", { maximumFractionDigits: 0 });
  }

  function decimal(value, digits) {
    return Number(value).toLocaleString("en-US", {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits
    });
  }

  function calculate() {
    var acres = Number(controls.acres.value);
    var reentry = Number(controls.reentry.value);
    var saleSize = Number(controls.saleSize.value);
    var admin = Number(controls.admin.value);
    var inventory = Number(controls.inventory.value);
    var fieldHours = Number(controls.fieldHours.value);

    var activeAcres = acres / reentry;
    var saleUnits = activeAcres / saleSize;
    var activeWorkload = activeAcres * (constants.prepHoursPerAcre + constants.inspectionHoursPerAcre + constants.postHarvestHoursPerAcre);
    var adminWorkload = saleUnits * admin;
    var inventoryWorkload = (acres / inventory) * constants.inventoryHoursPerAcre;
    var backgroundWorkload = acres * constants.backgroundHoursPerAcre;
    var totalWorkload = activeWorkload + adminWorkload + inventoryWorkload + backgroundWorkload;
    var requiredFte = totalWorkload / fieldHours;

    outputs.acresValue.textContent = number(acres) + " acres";
    outputs.reentryValue.textContent = number(reentry) + " years";
    outputs.saleSizeValue.textContent = number(saleSize) + " acres";
    outputs.adminValue.textContent = number(admin) + " hours";
    outputs.inventoryValue.textContent = number(inventory) + " years";
    outputs.fieldHoursValue.textContent = number(fieldHours) + " hours";
    outputs.activeAcres.textContent = number(activeAcres);
    outputs.saleUnits.textContent = decimal(saleUnits, 1);
    outputs.workload.textContent = number(totalWorkload) + " hrs";
    outputs.fte.textContent = decimal(requiredFte, 1) + " FTE";
  }

  Object.keys(controls).forEach(function (key) {
    controls[key].addEventListener("input", calculate);
  });

  calculate();
})();
</script>
