---
layout: post
title: "NHR Log 32: How to Predict a Plant Invasion in a Forest Near You"
date: 2026-09-09 01:50:00 -0400
categories: [northern-hardwoods, research, travel]
tags: [Northern Hardwoods Resilience Project, forestry, silviculture, megatrip, fieldwork, invasive species, early detection and rapid response, citizen science, iNaturalist, species distribution models, GIS, forest regeneration]
excerpt: "Predictive invasion tools could help managers find one stem at a vulnerable forest fringe before it becomes an established understory population."
---

Honeysuckle is an easy plant to underestimate. It flowers, it produces bright berries, and, if you do not know what it is doing, it can seem like a charismatic understory plant. Foresters, meanwhile, are usually going to call it honeysuckle and describe it as a problem.

That word is useful shorthand in the field, but it gets complicated real fast once you try to build a predictive model around it. Some honeysuckles are native and belong in the forest. The problem plants may be Morrow’s honeysuckle, Tatarian honeysuckle, Amur honeysuckle, or some hybrid version that can kind of take over the understory. Even when the shrubs are managed together, each of those invasive species has its own ecology, climatic tolerances, and dispersal behavior.

The nonnative bush honeysuckles were introduced for ornamental plantings, erosion control, windbreaks, and wildlife habitat. Their flowers and red fruits help explain why anyone wanted them in the first place, but those same fruits attract birds that disperse the seeds. Once established, an invasive honeysuckle can form a dense shrub layer, reduce plant diversity, and interfere with tree regeneration. At Acadia National Park, for example, Morrow’s honeysuckle is managed in old fields, young forests, abandoned sites, and even on islands along the coast (National Park Service 2020). A pretty flowering shrub can turn out to be a fairly vicious invasive species.

I keep coming back to the possibility of predicting where a plant like this is headed before it owns the understory. The prediction would have to go beyond drawing a buffer around the places where it has already been reported. It would need to consider how the plant moves, where it can establish, where people are likely to notice it, and where a manager can reasonably spend a day looking for it.

## The promise and difficulty of early detection

One of my first jobs coming out of school involved working from the administrative level at the Washington Support Office with the National Park Service’s invasive plant management teams. I thought then, and still think, that the National Park Service has done an exceptional job of developing teams that can work across parks and engage in early detection and rapid response. Early detection and rapid response, or EDRR, means locating a new invasive species while it is beginning to invade and removing it before it becomes an established population (National Park Service 2024).

The premise is basically that an ounce of prevention is worth a pound of cure, especially with invasive species. If someone finds one stem of an early invasion and responds quickly, that may be a manageable afternoon. Once the same species has established a large population base, the response becomes a long-term treatment commitment involving more people, more time, more money, and potentially much more herbicide.

By the time broadcast treatments become part of the schedule, you have kind of already lost a battle. The treatment may still be necessary, and it may accomplish a great deal, but the invasion has secured enough ground to demand considerably more resources.

The most difficult thing I saw was that the teams already had schedules of treatment they needed to approach and attack. Those schedules were generally dominated by larger, established invasions, so they were dealing with the cure. It takes much more effort to work through one of those populations than it takes to handle one stem of an early invasion, and treatment gradually crowds out the monitoring that might keep another large project from appearing on the schedule.

The National Park Service currently describes prevention, inventory and monitoring, EDRR, treatment, and restoration as connected parts of the work conducted by its Invasive Plant Management Teams (National Park Service 2025). Keeping all of those activities alive in an annual work plan is difficult when established populations are already consuming the available field time. A predictive tool could help managers reserve time for proactive work by narrowing the search area and giving them a defensible reason to survey one place before another.

## From a watch list to a vector model

In 2017, I published an invasive plant watch list for the National Capital regional national parks. That project used existing occurrence data from EDDMapS, along with formal species assessments, to identify invasive plants that occurred in the surrounding region and might appear inside park boundaries in the future. It produced a formal priority list that park staff could learn to identify, map, and treat when found (Frey 2017).

That first paper was basically a way to turn scattered occurrence records into a management decision. I later coauthored a paper led by Bruce Young that automated more of the process using iNaturalist observations. We compiled provisional watch lists of the 100 most frequently reported nonnative plants within 160 kilometers of 36 National Park Service units with relatively small operating budgets. The method relied on research-grade observations containing a photograph, date, coordinates, and an identification supported by the iNaturalist community. It was repeatable and relatively inexpensive, and it could alert managers to species recorded near a park but not yet recorded inside it (Young et al. 2021).

The prediction language in that paper is the part I want to hone in on. Geographic proximity gives you a useful first approximation: if an invasive plant is repeatedly reported around a management unit, it may eventually arrive within the unit. But a circular buffer cannot tell you how it will get there, how quickly it might move, whether the area between those locations is suitable, or where a manager should look first.

<figure class="nhr-figure full-width nhr-photo protected-image" oncontextmenu="return false;">
  <img
    src="{{ site.baseurl }}/assets/images/northern-hardwoods-megatrip/nhr-log-32-new-brunswick-forest-agriculture-edge.jpg"
    alt="Road through a New Brunswick agricultural landscape bordered by hardwood forest"
    loading="lazy"
    draggable="false"
  >
  <figcaption>Forest and agricultural land meet along a road in New Brunswick. An invasion model has to treat edges like this as pathways shaped by propagule pressure, disturbance, land use, and access.</figcaption>
</figure>

Some of the mechanics for answering those questions were already appearing in the modeling literature before my original watch-list paper. Horvitz and colleagues used historical records to compare the apparent contributions of roads, rivers, and more generalized dispersal to the spread of an invasive plant across China. Their model estimated arrival times and found that rivers best explained the rapid expansion of the species they studied (Horvitz et al. 2014). Straight-line distance did a poor job of representing the time involved when seeds were moving with rivers, vehicles, animals, or some other vector.

Later work has brought more of those processes together. Botella and colleagues developed a Bayesian model that combined short-distance spread, human-mediated long-distance dispersal, plant age and reproduction, habitat suitability, and uneven observation effort (Botella et al. 2022). Runghen and colleagues treated human-mediated dispersal as a network connecting people, vectors, and destinations, with the structure of that network helping to identify vulnerable sites (Runghen et al. 2023).

Sofaer and colleagues have since developed “first records distribution models,” which use historical first detections across many nonnative plants to identify places where future introductions are more likely. Their proof-of-concept included population, climate, roads, railroads, trails, ports, and other forms of human infrastructure (Sofaer et al. 2025). The pieces for a more spatially honest watch list are already there. The applied problem is assembling them at a scale that helps a manager answer a fairly ordinary question: Given the people and time I have, where should we survey first?

## Modeling honeysuckle without pretending it is simple

I would use invasive bush honeysuckle to work through the model, beginning with dated iNaturalist or EDDMapS observations and examining how the invasion appears to move toward a northern hardwood forest. Geographic distance would remain in the analysis, but it would be joined by roads, trails, development, forest edges, topography, climate, canopy conditions, disturbance, and whatever movement mechanisms are plausible for the plant.

The GIS problem begins to resemble a drive-time model, except the traveler is a propagule and every part of the landscape carries an ecological cost. Straight-line distance provides a baseline. A road or trail might lower the cost when people, equipment, or transported materials move the species. Unsuitable habitat raises it. A bird or another long-distance disperser may jump across much of it.

For bush honeysuckle, roads would not necessarily operate as literal seed highways. Historic ornamental plantings and developed areas can act as source populations, while birds move seeds between those sources and suitable forest habitat. Forest edges and canopy openings may then provide the light and disturbed ground needed for establishment. Research in Minnesota has examined whether Morrow’s and Tatarian honeysuckle, already established in the central and southern parts of the state, could become larger problems in northern forests under changing conditions (Minnesota Invasive Terrestrial Plants and Pests Center 2021).

The taxonomic problem has to stay visible throughout the analysis. A forester may reasonably manage invasive bush honeysuckle as a group, while a model needs to account for the ecologies of the species and hybrids inside that group. A first screening layer could pool well-supported observations of nonnative bush honeysuckles, followed by species-specific climate, habitat, and dispersal relationships wherever the data support them. Records identified only as “honeysuckle” might tell us where field verification is needed, but they should not quietly acquire species-level certainty during the analysis.

Older records could be used to fit the model while newer observations are held back. We could then ask whether the model would have sent a survey toward the places where honeysuckle was subsequently reported. If it sends us everywhere, or simply draws another ring around the existing observations, it has not improved much on the buffer. If it consistently identifies later points of establishment, then we have some evidence that the estimated vectors and habitat relationships are useful.

The resulting forecast should give arrival likelihoods across time windows instead of naming an exact year when one honeysuckle seedling will appear at a trailhead. A 2025 review found that only 29 percent of dynamic, spatially interactive invasion predictions reported uncertainty, even though incomplete records, uncertain starting conditions, model structure, and future environmental conditions all influence the result (Saffer et al. 2025). A ranked set of risk categories, with a range of plausible arrival times, would give the manager an honest expression of what the data can support.

## Finding the Goldilocks zone

The forest fringe is where I would point this model first, particularly where that fringe sees high usage. Roadsides, trailheads, parking areas, campgrounds, maintenance yards, livestock areas, and other points of repeated access can receive invasive species through different pathways. Those edges also face some of the greatest temperature extremes and the greatest exposure to weather, along with a pile of other abiotic concerns that come with being at the edge of a forested landscape. Add invasive species to that mixture and a little bit of disturbance will create really great ground for an invasion, basically.

The relevant pathway depends on the species. Contaminated hay or feed brought to a livestock area may move one set of plants, while footwear, vehicles, maintenance equipment, or nursery material move others. Honeysuckle brings in its own combination of planted sources, bird movement, forest structure, and climate. Applying one vector to every invasive plant could produce a clean-looking model with the wrong biology underneath it.

Citizen-science observations bring another concern into the same analysis. An iNaturalist record provides a photograph, location, and timestamp that can reveal an invasive species outside a management unit before park or forest staff encounter it. Yet an iNaturalist map records where people look along with where plants grow. Dimson and colleagues found that iNaturalist observations of invasive plants were concentrated in places with greater road and trail density and more vegetation disturbance, while professional surveys tended to reach less-accessible, more native-dominated sites. Combining the two datasets produced better estimates of suitable habitat than either source produced alone (Dimson et al. 2023).

Some places receive enough use to bring in seeds and enough observers to report them. Remote areas may receive few seeds and few observers. Between those conditions is the Goldilocks zone I would want the model to locate: a place with enough human activity, transported material, or disturbance to face meaningful invasion pressure, but too little attentive observation for an early detection to be likely.

A blank area on an iNaturalist map remains ambiguous. Maybe the species is absent. Maybe nobody has stopped to photograph it.

In my head, survey priority would combine arrival pressure, establishment suitability, management consequences, and the likelihood that an invasion has escaped observation, with the final ranking tempered by how long it takes to reach and survey each location. That would produce a ranked list of vulnerable places, paired with an estimate of how much a crew could reasonably survey in a day and what they should look for when they get there.

Honeysuckle can remain the species used to build and explain the model, but you are never going to be looking for one invasive species when you are already walking through the forest. Each route could include a short watch list of perhaps five or six species selected for the habitats and vectors encountered along the way. A trailhead might receive one list, while a maintenance yard, livestock area, or remote road corridor receives another. The watch-list idea would then become a field assignment that someone could complete in a day.

## What successful prevention looks like

There is an insurmountable element of risk attached to the way people and goods move. Freedom of movement is a human right, and so long as we are free to move as humans, we will also move species intentionally and unintentionally. That is part of the reason invasive plants will remain a persistent pressure rather than a problem we permanently complete and check off.

Predicting plant invasions is therefore a public-interest need. Managers need enough information to place limited monitoring time where it has the greatest chance of finding an invasion while the population is still small. A useful model narrows the search, admits what remains uncertain, and makes proactive fieldwork possible within a schedule already filled with treatment responsibilities.

After five years, the resilience created by that work might be apparent in fewer degraded acres and fewer invasive threats across high-transit areas. Stands would remain merchantable. Managers should see sufficient regeneration and recruitment into higher size classes, along with a healthier native ecosystem. Those are observable outcomes, although they can be difficult to attribute to a population that never became large enough for anyone else to notice.

A well-functioning ecosystem can be underappreciated in the end. We can take for granted that everything is working the way it could when everyone is doing their job correctly, especially when success looks like the absence of a crisis. If a crew walks the right forest fringe, finds one stem, confirms what it is, and responds before it becomes an established understory population, the prediction has accomplished what we asked of it. It helped someone decide where to spend a day before the problem demanded years.

## Works cited

- Botella, Christophe, Pierre Bonnet, Cang Hui, Alexis Joly, and David M. Richardson. 2022. “[Dynamic Species Distribution Modeling Reveals the Pivotal Role of Human-Mediated Long-Distance Dispersal in Plant Invasion](https://doi.org/10.3390/biology11091293).” *Biology* 11(9): 1293.

- Dimson, Monica, Lucas Fortini, Morgan W. Tingley, and Thomas Gillespie. 2023. “[Citizen Science Can Complement Professional Invasive Plant Surveys and Improve Estimates of Suitable Habitat](https://doi.org/10.1111/ddi.13749).” *Diversity and Distributions* 29(9): 1141–1156.

- Frey, Mark. 2017. “[An Invasive Plant Watch List for the National Capital Regional National Parks (USA)](https://doi.org/10.3375/043.037.0113).” *Natural Areas Journal* 37(1): 108–117.

- Horvitz, Nir, Rui Wang, Min Zhu, Fang Hao Wan, and Ran Nathan. 2014. “[A Simple Modeling Approach to Elucidate the Main Transport Processes and Predict Invasive Spread: River-Mediated Invasion of *Ageratina adenophora* in China](https://doi.org/10.1002/2014WR015537).” *Water Resources Research* 50(12): 9738–9747.

- Minnesota Invasive Terrestrial Plants and Pests Center. 2021. “[Woody Invasives in Future Climate](https://mitppc.umn.edu/research/research-projects/woody-invasives-future-climate).” University of Minnesota.

- National Park Service. 2020. “[Invasive Plant Profile: Morrow’s Honeysuckle](https://www.nps.gov/articles/morrows-honeysuckle.htm).”

- National Park Service. 2024. “[Early Detection and Rapid Response](https://www.nps.gov/subjects/invasive/early-detection-and-rapid-response.htm).”

- National Park Service. 2025. “[Invasive Plant Management Teams](https://www.nps.gov/subjects/invasive/20-years-ipmt.htm).”

- Runghen, Rogini, Cristina Llopis-Belenguer, Mark R. McNeill, Giulio V. Dalla Riva, and Daniel B. Stouffer. 2023. “[Using Network Analysis to Study and Manage Human-Mediated Dispersal of Exotic Species](https://doi.org/10.1007/s10530-023-03122-3).” *Biological Invasions* 25: 3369–3389.

- Saffer, Ariel, Chris Jones, Eli Horner, Brittany Laginhas, John Polo, Benjamin Seliger, Felipe Sanchez, Thom Worm, and Ross Meentemeyer. 2025. “[Quantifying Uncertainty in Forecasts of When and Where Invasions Happen](https://doi.org/10.1007/s10530-025-03573-w).” *Biological Invasions* 27: Article 117.

- Sofaer, Helen R., Demetra A. Williams, Catherine S. Jarnevich, Keana S. Shadwell, Caroline M. Kittle, Ian S. Pearse, Lucas Berio Fortini, and Kelsey C. Brock. 2025. “[First Records Distribution Models to Guide Biosurveillance for Non-Native Species](https://doi.org/10.1111/ecog.07522).” *Ecography* 2025(4): e07522.

- Young, Bruce E., Michael T. Lee, Mark Frey, Kris Barnes, and Parker Hopkins. 2021. “[Using Citizen Science Observations to Develop Managed Area Watch Lists](https://doi.org/10.3375/21-8).” *Natural Areas Journal* 41(4): 307–314.
