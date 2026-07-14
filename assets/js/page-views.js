(function () {
  var apiBase = window.PAGE_VIEWS_API_BASE_URL || "https://mtntheman-trip-tracker.mtntheman.workers.dev";
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-view-counter]"));
  var productionHosts = ["mtntheman.com", "www.mtntheman.com", "mtntheman.github.io"];

  if (counters.length === 0) return;

  var paths = unique(counters.map(function (counter) {
    return counter.getAttribute("data-page-path");
  }).filter(Boolean));

  if (paths.length === 0) return;

  if (productionHosts.indexOf(window.location.hostname) !== -1) {
    var hitCounter = counters.find(function (counter) {
      return counter.getAttribute("data-counter-mode") === "hit";
    });

    if (hitCounter) {
      incrementView(hitCounter);
      paths = paths.filter(function (path) {
        return path !== hitCounter.getAttribute("data-page-path");
      });
    }
  } else {
    counters.forEach(function (counter) {
      if (counter.getAttribute("data-counter-mode") === "hit") {
        setCounter(counter, "LOCAL");
      }
    });
  }

  if (paths.length > 0) readCounts(paths);

  function incrementView(counter) {
    fetch(apiBase + "/api/views/hit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: counter.getAttribute("data-page-path"),
        title: counter.getAttribute("data-page-title") || document.title
      }),
      keepalive: true
    })
      .then(function (response) {
        if (!response.ok) throw new Error("view counter unavailable");
        return response.json();
      })
      .then(function (data) {
        setMatchingCounters(data.path, data.views);
      })
      .catch(function () {
        hideCounter(counter);
      });
  }

  function readCounts(pathsToRead) {
    fetch(apiBase + "/api/views/counts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paths: pathsToRead })
    })
      .then(function (response) {
        if (!response.ok) throw new Error("view counts unavailable");
        return response.json();
      })
      .then(function (data) {
        Object.keys(data.counts || {}).forEach(function (path) {
          setMatchingCounters(path, data.counts[path]);
        });
      })
      .catch(function () {
        pathsToRead.forEach(function (path) {
          hideMatchingCounters(path);
        });
      });
  }

  function setMatchingCounters(path, value) {
    counters.forEach(function (counter) {
      if (counter.getAttribute("data-page-path") === path) {
        setCounter(counter, value);
      }
    });
  }

  function setCounter(counter, value) {
    var target = counter.querySelector("[data-view-count]");
    if (!target) return;
    target.textContent = formatCount(value, counter.classList.contains("site-hit-counter"));
    counter.setAttribute("data-view-counter-loaded", "true");
  }

  function hideMatchingCounters(path) {
    counters.forEach(function (counter) {
      if (counter.getAttribute("data-page-path") === path) {
        hideCounter(counter);
      }
    });
  }

  function hideCounter(counter) {
    counter.setAttribute("data-view-counter-hidden", "true");
  }

  function formatCount(value, padded) {
    if (typeof value === "string") return value;
    var number = Number(value);
    if (!Number.isFinite(number)) return "--";
    return padded ? String(Math.max(0, Math.floor(number))).padStart(6, "0") : number.toLocaleString();
  }

  function unique(values) {
    return values.filter(function (value, index) {
      return values.indexOf(value) === index;
    });
  }
})();
