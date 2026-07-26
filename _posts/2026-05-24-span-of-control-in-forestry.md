---
layout: post
title: "NHR Log 4: Span of Control in Forestry"
date: 2026-05-24
categories: [northern-hardwoods, research, travel]
tags: [Northern Hardwoods Resilience Project, forestry, silviculture, megatrip, fieldwork, span of control, staffing]
excerpt: "A time-budget look at how many acres one forester can manage with intensive silviculture."
---

I was talking recently with a state forester about a concept that rarely makes it into academic literature but controls a lot of what happens on the ground: practical span of control. We talk constantly about sustainable harvest levels and silvicultural prescriptions, which are the stand-level plans that guide management. We talk less about the physical limits of one person's time.

When an agency or land management firm assigns one forester a large area, say 20,000 acres, there is usually an assumption that the land is being actively managed. Raw acreage can hide the problem. The better question is how many acres require decisions this year, and how much work follows each harvest once the trees are marked and the contract is signed.

## The first attempt: the back-of-the-napkin calculation

Start with a simple version of the problem. A 5,000-acre forest on a 20-year re-entry interval, meaning the time between scheduled harvests in the same stand, would need about 250 active treatment acres per year. If the average timber sale unit is 40 acres, the math is simple:

<div class="nhr-equation" role="img" aria-label="Annual sales equals 250 active acres divided by 40 acres per sale, which equals 6.25 sales per year.">
  Annual Sales =
  <span class="frac"><span>250 active acres</span><span>40 acres per sale</span></span>
  = 6.25 sales per year
</div>

On paper, six or seven sales a year sounds manageable. A forester should have enough time to mark timber, write prescriptions, and keep the paperwork moving. If we scale the same arithmetic up to 20,000 acres, the assignment becomes 1,000 active acres across 25 sales each year.

## The "oh no" reality check

This is where the paper model starts to break. First, 5,000 acres is not always the assignment. It may be four times that, or more. Second, forest treatments do not arrive as clean, uniform blocks. Timber sales follow a wide bell curve, with some tight 13-acre cuts and some 120-acre structural thinnings. Forty acres may be a workable average, but the year-to-year mix matters.

Small sales can carry nearly the same fixed desk cost as large sales. Setting up a 13-acre sale still means checking boundaries, verifying property lines, drafting a contract, and advertising the bid package. A year filled with smaller, scattered units can create a heavy administrative load even when the treated acreage stays the same.

Then there is windshield time. Driving to remote or scattered units eats into the work week before any marking, cruising, or inspection happens. Weather and other surprises can also push a tidy schedule out of shape.

The bigger miss is monitoring and inventory. Forestry is not a set of isolated cutting events. It is a loop of checking, measuring, and returning to stands after the sale is finished. Certification programs and agency policies often require a one-year post-harvest check for Best Management Practices (BMPs), a three-year check for regeneration and deer browse, a five-year check for invasive species and stand health, and a ten-year re-inventory to keep stand records current. The exact schedule changes by owner and program, but the tail is the point.

## A more complete span-of-control model

If we rebuild the calculation for a 20,000-acre responsibility and include the work that follows each entry, the numbers change fast.

On a 20-year rotation, the forester has to handle 1,000 active treatment acres per year. At 40 acres per unit, that means establishing 25 sales annually. Cruising adds another layer. A 10-year inventory cycle on a 20,000-acre forest requires 2,000 background acres each year, separate from the active timber sales.

The table below lays out one workable annual hour budget:

| Workload Component | Operational Assumption | Annual Hours Required |
| --- | --- | ---: |
| Sale Layout & Timber Marking | 1.5 hours per active acre for cruising, marking, and boundary paint | 1,500 hours |
| Bidding, Contracts, & Administration | 40 hours per sale contract, with 25 sales per year | 1,000 hours |
| Active Sale Inspections & Travel | 2 hours per week per active sale during harvest | 800 hours |
| Post-Harvest Certification Checks | 1, 3, and 5-year regeneration and invasive monitoring | 300 hours |
| Mandatory 10-Year Inventory | Cruising 2,000 background acres at 0.25 hours per acre | 500 hours |
| General Stewardship & Public Inquiries | Forest health anomalies, boundary disputes, and road washouts | 400 hours |
| **Total Annual Workload** |  | **4,500 hours** |

A full-time employee does not have 2,080 usable field-management hours. Leave, mandatory training, meetings, reporting, and general agency work cut into that number. A more believable annual field-management capacity is roughly 1,100 to 1,400 hours. That puts the 20,000-acre example at about three to four full-time foresters if the goal is intensive management.

The calculator below keeps those assumptions adjustable. You can change the acreage, re-entry interval, sale size, fixed setup time, inventory cycle, and available field hours to see how quickly the workload moves.

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

Behind the calculator is a simple workload equation. It adds active harvest preparation, contract administration, inventory, post-harvest monitoring, and background stewardship into one annual hour estimate:

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

Here, <em>W</em> is total annual operational hours. <em>A</em> is district acres, <em>R</em> is the re-entry interval, <em>I</em> is the inventory cycle, and <em>S</em> is the average treatment size. The <em>h</em> terms are the time costs: <em>h</em><sub>prep</sub> covers layout and tree marking per active acre, <em>h</em><sub>insp</sub> covers active harvest inspection, <em>h</em><sub>post</sub> covers post-harvest monitoring, <em>h</em><sub>admin</sub> covers contract preparation and bidding per sale, <em>h</em><sub>inv</sub> covers cruising per inventory acre, and <em>h</em><sub>bg</sub> covers background stewardship per district acre.

The useful part of writing the budget this way is that no single variable tells the whole story. A shorter re-entry interval increases active acres. Smaller sale units increase contracts and boundary layouts. A tighter inventory cycle adds background cruising. Staffing should follow the work a forester can physically complete, not an acreage number that looks clean in a spreadsheet.

## What does "responsible for" actually mean?

When one forester is assigned to a 20,000-acre area, textbook silviculture may still be the ideal, but the job often turns into triage. They decide which few hundred acres will get close attention this year while the remaining acres move through deferred entries, standardized prescriptions, or broader planning.

I do not think that makes broad-acre assignments unserious by default. It means acreage alone is a bad measure of responsibility. The bottleneck is the number of stands a person can walk, mark, inspect, maintain, and revisit in a year.

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
