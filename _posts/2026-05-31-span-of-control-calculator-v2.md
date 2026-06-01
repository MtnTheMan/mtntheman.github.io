---
layout: post
title: "NHR Log 4.5: Updated Span of Control Calculator"
date: 2026-05-31
categories: [northern-hardwoods, research, travel]
tags: [Northern Hardwoods Resilience Project, forestry, silviculture, megatrip, fieldwork, span of control, staffing, calculator]
excerpt: "An updated workload calculator for testing agency and private forester responsibilities at different scales."
---

The first span-of-control calculator treated a forester's workload as a mostly fixed bundle of responsibilities. That was useful as a baseline, but it also hid a reality that matters a lot in practice: not every forester carries the same job. A state agency forester, a county forester, a private consulting forester, and an industrial land manager may all be "responsible" for acres, but the work attached to those acres can be very different.

This updated version makes those responsibilities explicit. Instead of assuming that every workload term is always present, the calculator below lets you toggle major responsibilities on or off, change the hour assumptions behind each one, and compare how quickly staffing needs change when a forester is expected to do more than simply prepare timber sales. District size now extends to 500,000 acres, which makes the tool more useful for agency contexts where large administrative footprints can mask the difference between nominal responsibility and actual field capacity.

<div class="nhr-equation" role="img" aria-label="Total workload equals the sum of enabled responsibility modules divided by available annual field hours to estimate full time equivalent staffing.">
  Required FTE =
  <span class="frac"><span>Enabled annual workload modules</span><span>Direct field hours available per forester</span></span>
</div>

Use the preset buttons as starting points, then adjust the sliders, number fields, and responsibility toggles. The model is intentionally simple: it does not claim to predict every agency or consulting business, but it does make the tradeoffs visible.

<section class="nhr-calculator" id="span-control-v2" aria-labelledby="span-control-v2-title">
  <h3 id="span-control-v2-title">Updated Span of Control Calculator</h3>
  <div class="nhr-calc-actions" aria-label="Scenario presets">
    <button class="nhr-calc-button" type="button" data-soc2-preset="agency">Agency Forester</button>
    <button class="nhr-calc-button" type="button" data-soc2-preset="private">Private Consultant</button>
    <button class="nhr-calc-button" type="button" data-soc2-preset="intensive">Intensive Stand-Level</button>
  </div>

  <div class="nhr-calc-grid">
    <div class="nhr-calc-control">
      <label for="soc2-acres">District or Client Acres</label>
      <output id="soc2-acres-value" for="soc2-acres">200,000 acres</output>
      <input id="soc2-acres" type="range" min="1000" max="500000" step="1000" value="200000">
      <input id="soc2-acres-number" type="number" min="1000" max="500000" step="1000" value="200000" aria-label="District or client acres exact value">
    </div>
    <div class="nhr-calc-control">
      <label for="soc2-reentry">Re-entry Interval</label>
      <output id="soc2-reentry-value" for="soc2-reentry">20 years</output>
      <input id="soc2-reentry" type="range" min="5" max="60" step="1" value="20">
      <input id="soc2-reentry-number" type="number" min="5" max="60" step="1" value="20" aria-label="Re-entry interval exact value">
    </div>
    <div class="nhr-calc-control">
      <label for="soc2-sale-size">Average Sale or Project Size</label>
      <output id="soc2-sale-size-value" for="soc2-sale-size">80 acres</output>
      <input id="soc2-sale-size" type="range" min="5" max="500" step="5" value="80">
      <input id="soc2-sale-size-number" type="number" min="5" max="500" step="5" value="80" aria-label="Average sale or project size exact value">
    </div>
    <div class="nhr-calc-control">
      <label for="soc2-field-hours">Direct Field Hours Per Forester</label>
      <output id="soc2-field-hours-value" for="soc2-field-hours">1,200 hours</output>
      <input id="soc2-field-hours" type="range" min="500" max="2200" step="25" value="1200">
      <input id="soc2-field-hours-number" type="number" min="500" max="2200" step="25" value="1200" aria-label="Direct field hours per forester exact value">
    </div>
    <div class="nhr-calc-control">
      <label for="soc2-client-count">Client or Ownership Count</label>
      <output id="soc2-client-count-value" for="soc2-client-count">20 accounts</output>
      <input id="soc2-client-count" type="range" min="0" max="300" step="1" value="20">
      <input id="soc2-client-count-number" type="number" min="0" max="300" step="1" value="20" aria-label="Client or ownership count exact value">
    </div>
    <div class="nhr-calc-control">
      <label for="soc2-harvest-weeks">Average Active Harvest Window</label>
      <output id="soc2-harvest-weeks-value" for="soc2-harvest-weeks">16 weeks</output>
      <input id="soc2-harvest-weeks" type="range" min="1" max="40" step="1" value="16">
      <input id="soc2-harvest-weeks-number" type="number" min="1" max="40" step="1" value="16" aria-label="Average active harvest window exact value">
    </div>
  </div>

  <h3>Responsibility Modules</h3>
  <div class="nhr-calc-modules">
    <div class="nhr-calc-module">
      <label><input type="checkbox" id="soc2-use-prep" checked> Sale Layout & Timber Marking <small>Applied to annual active treatment acres.</small></label>
      <label for="soc2-prep-hours">Hours per active acre<input id="soc2-prep-hours" type="number" min="0" max="10" step="0.1" value="0.9"></label>
      <label for="soc2-prep-note">Scale driver<input id="soc2-prep-note" type="text" value="Active acres" disabled></label>
    </div>
    <div class="nhr-calc-module">
      <label><input type="checkbox" id="soc2-use-admin" checked> Contracts, Bidding & Administration <small>Applied to the number of sale or project units.</small></label>
      <label for="soc2-admin-hours">Hours per sale<input id="soc2-admin-hours" type="number" min="0" max="200" step="1" value="28"></label>
      <label for="soc2-admin-note">Scale driver<input id="soc2-admin-note" type="text" value="Sale units" disabled></label>
    </div>
    <div class="nhr-calc-module">
      <label><input type="checkbox" id="soc2-use-inspection" checked> Active Sale Inspections & Travel <small>Repeated oversight during active operations.</small></label>
      <label for="soc2-inspection-hours">Hours per sale per week<input id="soc2-inspection-hours" type="number" min="0" max="20" step="0.25" value="1.5"></label>
      <label>Uses harvest window<input type="text" value="Weeks above" disabled></label>
    </div>
    <div class="nhr-calc-module">
      <label><input type="checkbox" id="soc2-use-post" checked> Post-Harvest Certification Checks <small>BMP, regeneration, deer browse, and invasive checks.</small></label>
      <label for="soc2-post-hours">Hours per active acre<input id="soc2-post-hours" type="number" min="0" max="5" step="0.05" value="0.2"></label>
      <label for="soc2-post-note">Scale driver<input id="soc2-post-note" type="text" value="Active acres" disabled></label>
    </div>
    <div class="nhr-calc-module">
      <label><input type="checkbox" id="soc2-use-inventory" checked> Forest Inventory & Database Updates <small>Applied to acres due for re-inventory this year.</small></label>
      <label for="soc2-inventory-cycle">Inventory cycle years<input id="soc2-inventory-cycle" type="number" min="1" max="50" step="1" value="10"></label>
      <label for="soc2-inventory-hours">Hours per inventory acre<input id="soc2-inventory-hours" type="number" min="0" max="5" step="0.01" value="0.08"></label>
    </div>
    <div class="nhr-calc-module">
      <label><input type="checkbox" id="soc2-use-background" checked> Background Stewardship <small>Roads, boundary issues, forest health checks, and routine stewardship.</small></label>
      <label for="soc2-background-hours">Hours per total acre<input id="soc2-background-hours" type="number" min="0" max="1" step="0.001" value="0.005"></label>
      <label for="soc2-background-note">Scale driver<input id="soc2-background-note" type="text" value="Total acres" disabled></label>
    </div>
    <div class="nhr-calc-module">
      <label><input type="checkbox" id="soc2-use-public" checked> Public, Interagency & Policy Work <small>Agency meetings, public inquiries, permits, complaints, and coordination.</small></label>
      <label for="soc2-public-hours">Annual hours<input id="soc2-public-hours" type="number" min="0" max="2000" step="25" value="350"></label>
      <label for="soc2-public-note">Scale driver<input id="soc2-public-note" type="text" value="Fixed annual load" disabled></label>
    </div>
    <div class="nhr-calc-module">
      <label><input type="checkbox" id="soc2-use-client"> Client Service & Landowner Communication <small>Private consulting visits, calls, estimates, and follow-up.</small></label>
      <label for="soc2-client-hours">Hours per account<input id="soc2-client-hours" type="number" min="0" max="80" step="0.5" value="6"></label>
      <label for="soc2-client-note">Scale driver<input id="soc2-client-note" type="text" value="Client count" disabled></label>
    </div>
  </div>

  <div class="nhr-calc-results" aria-live="polite">
    <div class="nhr-calc-result">
      <strong>Annual Active Acres</strong>
      <span id="soc2-active-acres">10,000</span>
    </div>
    <div class="nhr-calc-result">
      <strong>Annual Sale Units</strong>
      <span id="soc2-sale-units">125.0</span>
    </div>
    <div class="nhr-calc-result">
      <strong>Total Annual Workload</strong>
      <span id="soc2-total-hours">25,950 hrs</span>
    </div>
    <div class="nhr-calc-result">
      <strong>Required Workforce</strong>
      <span id="soc2-fte">21.6 FTE</span>
    </div>
  </div>

  <div class="nhr-calc-bars" id="soc2-bars" aria-label="Workload breakdown"></div>

  <table class="nhr-calc-breakdown">
    <thead>
      <tr>
        <th>Enabled Workload</th>
        <th>Annual Hours</th>
      </tr>
    </thead>
    <tbody id="soc2-breakdown"></tbody>
  </table>

  <p class="nhr-calc-note">This is a scenario model, not a staffing prescription. The point is to expose which responsibilities are consuming time and whether an acreage assignment is plausible under the assumptions being used.</p>
</section>

The most important part of this version is not the 500,000-acre ceiling by itself. It is the ability to separate the idea of assigned land from the bundle of tasks attached to that land. A forester who is primarily reviewing plans and answering public inquiries can carry a very different acreage footprint than a forester who is laying out timber sales, inspecting operations, updating inventories, meeting with landowners, and checking regeneration after harvest.

This is why "responsible for" needs to be treated as a workload claim rather than a map label. When responsibility modules are added, the limiting factor becomes time. When modules are removed or shifted to technicians, contractors, county partners, or consulting firms, the same nominal footprint can become more realistic. The question is not just how many acres sit inside the boundary. The question is which acres must be walked, which decisions must be documented, which people must be served, and how often the forester is expected to return.

<script>
(function () {
  var root = document.getElementById("span-control-v2");
  if (!root) return;

  var numberFormat = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  var oneDecimal = new Intl.NumberFormat("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

  var pairs = [
    ["acres", "acres"],
    ["reentry", "years"],
    ["sale-size", "acres"],
    ["field-hours", "hours"],
    ["client-count", "accounts"],
    ["harvest-weeks", "weeks"]
  ];

  function el(id) {
    return document.getElementById("soc2-" + id);
  }

  function value(id) {
    return Number(el(id).value) || 0;
  }

  function checked(id) {
    return el("use-" + id).checked;
  }

  function setPair(id, nextValue) {
    var slider = el(id);
    var exact = el(id + "-number");
    slider.value = nextValue;
    exact.value = nextValue;
  }

  function syncPair(id, source) {
    var slider = el(id);
    var exact = el(id + "-number");
    var min = Number(slider.min);
    var max = Number(slider.max);
    var next = Math.min(max, Math.max(min, Number(source.value) || min));
    slider.value = next;
    exact.value = next;
  }

  function setModule(id, isEnabled, moduleValue, secondaryValue) {
    el("use-" + id).checked = isEnabled;
    if (id === "prep") el("prep-hours").value = moduleValue;
    if (id === "admin") el("admin-hours").value = moduleValue;
    if (id === "inspection") el("inspection-hours").value = moduleValue;
    if (id === "post") el("post-hours").value = moduleValue;
    if (id === "inventory") {
      el("inventory-cycle").value = moduleValue;
      el("inventory-hours").value = secondaryValue;
    }
    if (id === "background") el("background-hours").value = moduleValue;
    if (id === "public") el("public-hours").value = moduleValue;
    if (id === "client") el("client-hours").value = moduleValue;
  }

  var presets = {
    agency: function () {
      setPair("acres", 200000);
      setPair("reentry", 20);
      setPair("sale-size", 80);
      setPair("field-hours", 1200);
      setPair("client-count", 20);
      setPair("harvest-weeks", 16);
      setModule("prep", true, 0.9);
      setModule("admin", true, 28);
      setModule("inspection", true, 1.5);
      setModule("post", true, 0.2);
      setModule("inventory", true, 10, 0.08);
      setModule("background", true, 0.005);
      setModule("public", true, 350);
      setModule("client", false, 6);
    },
    private: function () {
      setPair("acres", 15000);
      setPair("reentry", 15);
      setPair("sale-size", 35);
      setPair("field-hours", 1500);
      setPair("client-count", 70);
      setPair("harvest-weeks", 8);
      setModule("prep", true, 1.6);
      setModule("admin", true, 55);
      setModule("inspection", true, 2);
      setModule("post", true, 0.3);
      setModule("inventory", false, 10, 0.18);
      setModule("background", false, 0.01);
      setModule("public", false, 0);
      setModule("client", true, 6);
    },
    intensive: function () {
      setPair("acres", 20000);
      setPair("reentry", 20);
      setPair("sale-size", 40);
      setPair("field-hours", 1300);
      setPair("client-count", 0);
      setPair("harvest-weeks", 16);
      setModule("prep", true, 1.5);
      setModule("admin", true, 40);
      setModule("inspection", true, 2);
      setModule("post", true, 0.3);
      setModule("inventory", true, 10, 0.25);
      setModule("background", true, 0.02);
      setModule("public", false, 0);
      setModule("client", false, 0);
    }
  };

  function moduleHours(label, hours, enabled) {
    return { label: label, hours: enabled ? hours : 0 };
  }

  function calculate() {
    var acres = value("acres");
    var reentry = Math.max(1, value("reentry"));
    var saleSize = Math.max(1, value("sale-size"));
    var fieldHours = Math.max(1, value("field-hours"));
    var clients = value("client-count");
    var harvestWeeks = value("harvest-weeks");

    var activeAcres = acres / reentry;
    var saleUnits = activeAcres / saleSize;

    var modules = [
      moduleHours("Sale layout & marking", activeAcres * value("prep-hours"), checked("prep")),
      moduleHours("Contracts & administration", saleUnits * value("admin-hours"), checked("admin")),
      moduleHours("Inspections & travel", saleUnits * harvestWeeks * value("inspection-hours"), checked("inspection")),
      moduleHours("Post-harvest checks", activeAcres * value("post-hours"), checked("post")),
      moduleHours("Inventory updates", (acres / Math.max(1, value("inventory-cycle"))) * value("inventory-hours"), checked("inventory")),
      moduleHours("Background stewardship", acres * value("background-hours"), checked("background")),
      moduleHours("Public & policy work", value("public-hours"), checked("public")),
      moduleHours("Client service", clients * value("client-hours"), checked("client"))
    ];

    var totalHours = modules.reduce(function (sum, item) {
      return sum + item.hours;
    }, 0);

    el("acres-value").textContent = numberFormat.format(acres) + " acres";
    el("reentry-value").textContent = numberFormat.format(reentry) + " years";
    el("sale-size-value").textContent = numberFormat.format(saleSize) + " acres";
    el("field-hours-value").textContent = numberFormat.format(fieldHours) + " hours";
    el("client-count-value").textContent = numberFormat.format(clients) + " accounts";
    el("harvest-weeks-value").textContent = numberFormat.format(harvestWeeks) + " weeks";
    el("active-acres").textContent = numberFormat.format(activeAcres);
    el("sale-units").textContent = oneDecimal.format(saleUnits);
    el("total-hours").textContent = numberFormat.format(totalHours) + " hrs";
    el("fte").textContent = oneDecimal.format(totalHours / fieldHours) + " FTE";

    var tbody = el("breakdown");
    tbody.innerHTML = "";
    modules.forEach(function (item) {
      var row = document.createElement("tr");
      var label = document.createElement("td");
      var hours = document.createElement("td");
      label.textContent = item.label;
      hours.textContent = numberFormat.format(item.hours);
      row.appendChild(label);
      row.appendChild(hours);
      tbody.appendChild(row);
    });

    var bars = el("bars");
    bars.innerHTML = "";
    var maxHours = Math.max.apply(null, modules.map(function (item) { return item.hours; }).concat([1]));
    modules.forEach(function (item) {
      var row = document.createElement("div");
      var label = document.createElement("span");
      var track = document.createElement("span");
      var fill = document.createElement("span");
      var valueText = document.createElement("span");
      row.className = "nhr-calc-bar-row";
      label.textContent = item.label;
      track.className = "nhr-calc-bar-track";
      fill.className = "nhr-calc-bar-fill";
      fill.style.width = Math.max(0, Math.round((item.hours / maxHours) * 100)) + "%";
      valueText.textContent = numberFormat.format(item.hours);
      track.appendChild(fill);
      row.appendChild(label);
      row.appendChild(track);
      row.appendChild(valueText);
      bars.appendChild(row);
    });
  }

  pairs.forEach(function (pair) {
    var id = pair[0];
    el(id).addEventListener("input", function () {
      syncPair(id, el(id));
      calculate();
    });
    el(id + "-number").addEventListener("input", function () {
      syncPair(id, el(id + "-number"));
      calculate();
    });
  });

  Array.prototype.forEach.call(root.querySelectorAll("input[type='checkbox'], .nhr-calc-module input[type='number']"), function (input) {
    input.addEventListener("input", calculate);
    input.addEventListener("change", calculate);
  });

  Array.prototype.forEach.call(root.querySelectorAll("[data-soc2-preset]"), function (button) {
    button.addEventListener("click", function () {
      presets[button.getAttribute("data-soc2-preset")]();
      calculate();
    });
  });

  calculate();
})();
</script>
