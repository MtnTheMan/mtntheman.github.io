---
layout: post
title: "NHR Log 22: Practice Bundles, Part Two: Modeling the Gray Area"
date: 2026-08-17 01:00:00 -0400
categories: [northern-hardwoods, research, travel]
tags: [Northern Hardwoods Resilience Project, forestry, silviculture, megatrip, fieldwork, practice bundles, agent-based modeling, decision-making]
excerpt: "Practice bundles can carry ranges of likely behavior into a model that connects forest decisions, active management, and ecological outcomes."
math: true
---

In the first practice bundles post, I tried to define a unit that could make millions and millions and millions of forest managers feasible to model without pretending that every one of them behaves the same way. A practice bundle was my way to be a lumper and not a splitter: group people or organizations whose objectives, constraints, and management practices appear similar enough to estimate a range of outcomes, while keeping the variability inside that range visible.

The next problem is behavior. If practice bundles are going to operate as agents in a model of the northern hardwood forest, I need some way to quantify what decision-making really looks like and what decision-making can really represent. Human decision-making behavior is infamously difficult to model, which makes this part of the idea difficult too, but if we can find trends among actors, then those trends should form the basis for how we model those actors.

I do not expect a practice bundle to predict whether one person will harvest one parcel in one year. I want it to describe the distribution of decisions we might reasonably expect across the acreage represented by a group, how that distribution changes when conditions change, and what those changes might do to the forest.

## Deciding where to lump and where to split

Before assigning behavior to a bundle, I have to decide which actors belong together. The grouping should reflect geographic qualities, forest composition, policy, governance, and management capacity, although none of those variables automatically determines the boundary.

National forests are a useful example. Forest planning, public participation, multiple-use and sustained-yield requirements, technical staffing, and written records create a fairly consistent institutional framework. That does not mean the White Mountain National Forest and the Allegheny National Forest should automatically share every model parameter. Their species composition, stand histories, markets, and localized ecological pressures can differ enough to justify separate bundles. A workable arrangement might include a northeastern national-forest group, a group covering the southern edge of the northern hardwood region in Pennsylvania and New York, and a Lake States group covering forests in Michigan, Wisconsin, and possibly Minnesota. The point is to avoid creating a separate national-forest agent for every state when several forests are operating under similar enough circumstances.

Family forest landowners probably require more splitting. Each state or province can have a different tax program, incentive structure, regulatory framework, extension system, and culture surrounding private forest management. A New Hampshire family forest bundle may therefore need to remain separate from a Vermont bundle even when a large industrial landowner group can cross the same border. Industrial owners in the Upper Peninsula of Michigan and northern Wisconsin may operate at a scale, and within a regional market, that makes their decision frameworks more alike than the frameworks of smaller landowners living in the same states.

Tribal entities in the United States and First Nations in Canada raise another grouping problem. Sovereignty, governance, access to technical capacity, and the acreage represented in a regional model all have to be considered, but small modeled acreage is not evidence that different nations share one value set. Lumping those actors solely to reduce the modeling burden would erase differences that the bundle is supposed to carry. This is the sort of boundary that will need evidence and consultation rather than a convenient assumption.

At some point, though, the grouping has to become deterministic. We decide that a set of actors is similar enough, document the reasons, carry an upper and lower range for their behavior, and leave ourselves a rule for splitting the bundle when the evidence says its internal variation has become too large.

## Behavior without a hard line

Thresholds are useful here because they help me avoid drawing a distinct line. A bundle can contain a gray area or a distribution of common decisions rather than a single rule that says this actor harvests and that actor does not.

Consider active management. Almost every national forest is incentivized, planned, and staffed to harvest some amount, even though the acreage and intensity will vary. I would expect its likelihood distribution to be comparatively narrow. A family forest landowner bundle could have a much wider range, possibly something closer to a bimodal distribution of people who are likely to harvest and people who probably will not. Some owners are doing nothing with their land. Some are managing intensively. A single mean would flatten the part of that distribution that I am most interested in.

The evidence behind these distributions can come from tax-program documentation, forest plans and management records, previous social science estimates, interviews, observed activity, or "best informed guess" estimates when the other evidence runs out. Those sources will not produce the same level of confidence. I am thinking of the resulting parameters as semi-deterministic thresholds: bounded by what we know, allowed to vary within those bounds, and open to change based on the place and scenario being modeled.

That makes the bundle testable. If a state changes its current-use tax program, a market disappears, deer pressure increases, or technical assistance becomes more available, I can change the related parameter and estimate how the distribution of likely decisions shifts. The model estimates how many acres might move into another management condition and what that movement produces, while leaving room for actors who do not respond.

## Writing the model down

I think the model is easier to understand as a chain of connected equations than as one giant equation that attempts to explain human behavior and tree biology at the same time. The first part estimates the likelihood of active management for each practice bundle. The second converts that likelihood into acreage. The third connects the management acreage and treatment choices to ecological and other forest outcomes.

For practice bundle <span class="math-inline">\\(b\\)</span>, region <span class="math-inline">\\(r\\)</span>, and time <span class="math-inline">\\(t\\)</span>, the probability of active management could begin with:

<div class="nhr-equation">
\[
p_{b,r,t}
=
\operatorname{logit}^{-1}
\left(
\alpha_b
+\beta_{1b}D_{r,t}
+\beta_{2b}M_{b,r,t}
+\beta_{3b}I_{r,t}
+\beta_{4b}G_{b,r}
+\beta_{5b}V_b
+\beta_{6b}C_{r,t}
\right)
\]
</div>

Here, <span class="math-inline">\\(p_{b,r,t}\\)</span> is the probability that land represented by bundle <span class="math-inline">\\(b\\)</span>, in region <span class="math-inline">\\(r\\)</span>, at time <span class="math-inline">\\(t\\)</span>, receives active management. The bundle-specific intercept <span class="math-inline">\\(\alpha_b\\)</span> represents a baseline propensity to act. A national-forest bundle could begin with a different baseline from a family forest bundle before any other factor is changed.

The remaining terms describe the pressures and circumstances that can move that probability. <span class="math-inline">\\(D_{r,t}\\)</span> is the decision pressure or trigger, such as regeneration failure, deer browse, a pest or pathogen, or a market disruption. <span class="math-inline">\\(M_{b,r,t}\\)</span> is the bundle's mobility, meaning its ability to recognize a problem and respond in a timely manner. <span class="math-inline">\\(I_{r,t}\\)</span> represents incentives or disincentives. <span class="math-inline">\\(G_{b,r}\\)</span> describes governance, policy, and regulatory constraints. <span class="math-inline">\\(V_b\\)</span> carries the bundle's distribution of values and objectives, while <span class="math-inline">\\(C_{r,t}\\)</span> represents the broader ecological and market context.

The coefficients differ by practice bundle. An incentive may change behavior substantially among family forest landowners and only slightly among managers whose harvest program was already established through a forest plan. A pest outbreak could create a strong decision pressure, but that pressure will produce little active management when operator access or financing is missing. I would eventually expect interaction terms as well, since mobility can determine whether a bundle is able to use an incentive or respond to a disturbance before the available window closes.

Once the probability of action is estimated, the model can convert it into expected active-management acreage:

<div class="nhr-equation">
\[
A_{r,t}
=
\sum_b
L_{b,r}
\times p_{b,r,t}
\times q_{b,r,t}
\]
</div>

In this equation, <span class="math-inline">\\(L_{b,r}\\)</span> is the amount of land represented by bundle <span class="math-inline">\\(b\\)</span> in region <span class="math-inline">\\(r\\)</span>. The probability <span class="math-inline">\\(p_{b,r,t}\\)</span> tells us how likely the bundle is to act, and <span class="math-inline">\\(q_{b,r,t}\\)</span> describes how much of its land is likely to be treated, or the intensity of management conditional on action. Two practice bundles can therefore have the same probability of taking some action while producing very different amounts of active management across the acreage they own or control.

The final connection is from action to outcomes:

<div class="nhr-equation">
\[
O_{r,t+1}
=
f
\left(
O_{r,t},
E_{r,t},
A_{r,t},
T_{r,t}
\right)
+\varepsilon
\]
</div>

The outcome set <span class="math-inline">\\(O_{r,t+1}\\)</span> can include regeneration and recruitment, timber products, clean water, wildlife habitat, species composition, or other conservation and environmental outcomes. <span class="math-inline">\\(O_{r,t}\\)</span> carries the current forest condition forward. <span class="math-inline">\\(E_{r,t}\\)</span> represents ecological conditions, <span class="math-inline">\\(A_{r,t}\\)</span> is the acreage under active management, and <span class="math-inline">\\(T_{r,t}\\)</span> describes the treatment portfolio, including what was done, how intensively it was done, and whether follow-up work occurred. The error term <span class="math-inline">\\(\varepsilon\\)</span> stays in the equation because neither the human decision nor the ecological response can be modeled perfectly.

The linked equations move from pressure and context to a probability of action, from that probability to expected management acreage, and then from management to ecological outcomes. They also keep different kinds of uncertainty in the places where they enter, which gives us a better chance of understanding whether an unexpected outcome came from assumptions about behavior, assumptions about treatment, or the ecology itself.

## Mobility as one variable among many

Mobility has become a focal aspect of this idea, although it is still one of many variables that I would consider when designing a system to model human decision-making across the northern hardwood forest. I am using mobility to mean the ability to adapt or respond in a timely manner, which is more specific than a general willingness to act and different from literal movement.

People who manage forests as their career naturally have more regular access to forest management information, professional networks, foresters, operators, and planning systems. The vast amount of acreage held in family forest parcels probably has less consistent access to that information and capacity. A landowner can want to respond to a problem and still be unable to find a forester, hire an operator, finance the work, obtain planting material, or complete an approval process in time.

Mobility could therefore be treated as a composite term:

<div class="nhr-equation">
\[
M_{b,r,t}
=
g
\left(
K_{b,r,t},
N_{b,r,t},
O_{b,r,t},
F_{b,r,t},
R_{b,r,t},
A_{b,r,t}
\right)
\]
</div>

Here, <span class="math-inline">\\(K\\)</span> represents knowledge and access to current management information; <span class="math-inline">\\(N\\)</span> represents professional forestry networks; <span class="math-inline">\\(O\\)</span> is access to operators and contractors; <span class="math-inline">\\(F\\)</span> is financial capacity; <span class="math-inline">\\(R\\)</span> is access to restoration resources, including planting material or other follow-up capacity; and <span class="math-inline">\\(A\\)</span> represents the administrative authority to act. I am reusing <span class="math-inline">\\(A\\)</span> here for authority even though it represents active-management acreage in the prior equation, so that symbol would need to be renamed before this becomes a formal methods section. For now, the formula is conceptual and the definition is the part I care about.

Two practice bundles could face the same ecological pressure and want the same outcome while moving at different speeds. One may have staff already monitoring the forest, a contract mechanism, a nearby logging workforce, and money that can be redirected. Another may first need to learn that the problem exists, decide whether action fits the owner's objectives, locate professional help, and determine whether the work can pay for itself. Those differences are likely to affect both whether management happens and whether it happens early enough to change the outcome.

## Regeneration failure as a model scenario

Regeneration failure, or delayed productivity in recruiting stems to a level above deer browse, is a persistent issue across the northern hardwood belt and gives the model a practical scenario to follow.

Suppose one scenario shows regeneration failure across a set of stands. Part of that failure may connect to landowners' likelihood and heightened desirability for the "best" deer habitat. That objective is not irrational. Wildlife can be a primary reason someone owns forestland. But when deer habitat decisions increase browsing pressure across a larger area, the outcome does not stay neatly within a parcel boundary.

The model could then ask how other practice bundles respond. Do state, federal, tribal, NGO, or industrial managers change harvest timing, regeneration treatments, deer-management coordination, planting, or follow-up activity to mitigate some of that pressure? How much additional management would be required, and which bundles have enough mobility to do it? A landscape model gives us a way to examine those questions without assigning the same objective or responsibility to every landowner.

The scenario can also change one factor at a time. We could alter deer pressure, technical assistance, cost-share funding, operator availability, or the probability that a landowner takes regeneration into account before a harvest. The result would be a set of possible trajectories rather than one claim about what the northern hardwood forest will become.

## Pests, pathogens, and composition shifts

A pest or pathogen creates another kind of pressure, especially when it affects a focal species in the hardwood composition of a region. Ash and emerald ash borer are the obvious example from recent forest management experience: a species can be placed at risk across a broad area while landowners and institutions retain very different abilities to act.

Some bundles can harvest proactively or reactively because they already have access to foresters and operators. Some have monitoring systems, funding, regulatory authority, or resources that can slow spread, aid restoration, plant regeneration, or prepare for a composition shift. Other bundles may have no practical response available during the useful management window. They may also lack a substitute species that fits the site and the owner's objectives.

The mobility term should allow those differences to show up. It can also separate a landowner's reluctance from a landowner's inability. Those are different behavioral conditions and would call for different policy responses, even if both appear in the data as an untreated parcel.

## When no work will magically pay for itself

Markets may create an even larger constraint. If prices are poor, a landowner may hesitate to harvest even when a treatment would improve regeneration or reduce a forest-health risk. If a market disappears to the point where the landowner would have to pay to remove trees, then there is no ability to improve conditions through a commercial treatment because no work will magically pay for itself.

That constraint can move several terms in the model at once. It changes financial capacity, operator availability, management intensity, and the probability of action. It may also affect different bundles unevenly. A large owner with internal staff, long-term contracts, or multiple product streams may retain some mobility while a family forest landowner has none.

Governmentally subsidized insurance at different levels for timber or forest health as a commodity has been promoted before and could be tested as one response. In the model, insurance could reduce the financial risk attached to a pest outbreak, market loss, or restoration treatment. It could then be compared with direct cost-share assistance, technical support, or investments in markets and operator capacity, showing how much each policy changes timely action among different bundles and whether that change is large enough to alter regeneration, composition, or other forest outcomes.

## Keeping the error visible

The thresholds and equations can make the model look cleaner than the evidence will be. I do not want that appearance to turn into false precision. Behavior cannot be modeled perfectly, the ecological response to a treatment can vary, and several of the inputs will begin as estimates rather than measured parameters.

Each bundle should therefore carry an expected distribution, upper and lower bounds, and a description of where the evidence came from. A parameter derived from an agency harvest record should not be treated as equivalent to a best informed guess about unrecorded family forest activity. Sensitivity testing can show which uncertain assumptions change the model's outcomes and which ones barely move them.

This is also where the rule for splitting a bundle becomes clearer. If one parameter has to be stretched so widely that the group no longer behaves like a cohesive set of actors, the bundle probably needs to split. If the model produces similar outcomes across the plausible range, additional splitting may add work without improving what we can learn from it.

The uncertainty is part of the result. A scenario may tell us that a policy produces a fairly stable outcome across many assumptions, or it may show that the outcome depends heavily on a behavioral estimate that we do not yet know very well. Either result can guide the next round of interviews, document collection, field observation, or model refinement.

## From forest decisions to forest outcomes

The forest model I am trying to describe connects the variables we can influence as forest managers, policymakers, researchers, and landowners with the variables that emerge as outcomes. Some of those controllable variables are incentives, professional access, planning, market support, restoration capacity, and the timing or intensity of management. The outcomes include active-management acreage, regeneration, species composition, timber products, water, habitat, and the future condition of the forest.

Practice bundles carry human behavior across that connection without requiring a distinct agent for every person and parcel. They let the model say that a national-forest group is likely to act within one range, a family forest group within a wider or bimodal range, and an industrial group within another range shaped by markets and scale. Then we can modify pressure, mobility, policy, or resources and see whether the expected forest changes.

When we come down to the tree biology of it all, the purpose is still to understand what the northern hardwood forest is likely to look like under the management trajectories we are already on, and what could change under another scenario. Practice Bundles Part One defined the unit, while this part describes the larger model that the units might occupy, including the gray area of behavior that has to remain inside it. Part Three can stay with one bundle and walk slowly from evidence to assumptions to model inputs, which is a different job and probably the clearest way to find out whether this idea actually holds together.
