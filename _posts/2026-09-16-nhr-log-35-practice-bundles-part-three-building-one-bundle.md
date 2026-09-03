---
layout: post
title: "NHR Log 35: Practice Bundles, Part Three: Building One Bundle"
date: 2026-09-16 02:05:00 -0400
categories: [northern-hardwoods, research, travel]
tags: [Northern Hardwoods Resilience Project, forestry, silviculture, megatrip, fieldwork, practice bundles, agent-based modeling, forest planning, U.S. Forest Service, decision-making]
excerpt: "Building a northeastern U.S. Forest Service practice bundle requires comparing plans, evaluation reports, management context, and expected behavior before deciding where to lump and where to split."
---

Part Three is where I have to stop talking about practice bundles in the abstract and actually build one. [Part One](https://www.mtntheman.com/northern-hardwoods/research/travel/2026/08/03/nhr-log-18-practice-bundles-and-the-problem-of-millions-of-forest-managers.html) defined the idea as a way to make millions and millions and millions of forest managers feasible to model without pretending that everyone behaves the same way. [Part Two](https://www.mtntheman.com/northern-hardwoods/research/travel/2026/08/17/nhr-log-22-practice-bundles-part-two-modeling-the-gray-area.html) took the bundles across the northern hardwood range and started asking when geography, policy, forest composition, or management capacity should cause one bundle to split into several.

This post stays with one candidate bundle and works through that decision slowly. A reader should be able to see what information goes into the bundle, where I am relying on records, where assumptions enter, how much variability I am willing to keep inside the group, and what would eventually convince me to split it. I also want to be explicit about what the finished bundle cannot capture, since some information will be lost whenever individual managers are grouped into a larger modeling unit.

## Starting with the easy case

The U.S. Forest Service is probably the cleanest place to begin. Of the five broad management groups identified early in this project, the Forest Service is the group for which we have the most evidence. Forest plans, statutory mandates, inventory protocols, monitoring requirements, evaluation reports, timber-sale records, and other written material make both the intended management and at least part of the implemented management comparatively visible.

That amount of documentation means I can expect behavior to follow what is written down more closely than I could for many private landowners. I still have to test that expectation, but I am beginning with a group that has explicit goals, technical staff, planning capacity, and established ways of evaluating its own work. The assumptions should be narrower, or at least easier to locate.

The family forest landowner remains the chaotic practice one from a modeling perspective. Landowner priorities, willingness to harvest, access to a forester, participation in tax or incentive programs, technical knowledge, and the possibility of no active management will require much more variability and probably some randomization. Starting with the Forest Service lets me explain how the pieces fit together before trying to build the harder version.

## Beginning with the Finger Lakes National Forest

Suppose I begin with the Finger Lakes National Forest in west-central New York. At this point, it is a candidate unit rather than a finished practice bundle. I would start by pulling out its forest management plan and identifying the decision-making framework under which the forest operates.

The plan should tell me how the forest prioritizes timber, recreation, habitat, clean water, stewardship, and other multiple-use goals. It should also describe inventory and monitoring requirements, public participation, regeneration objectives, planning procedures, and at least some of the constraints that determine whether proposed management can occur. These are the parts of the bundle that require the fewest invented assumptions.

I would not copy every goal from the plan into a parameter table. I would use the plan to identify recurring features of management behavior: how often the forest expects to enter stands, what treatments it considers, how regeneration is incorporated into planning, what follow-up work is expected, how outcomes are monitored, and what conditions can delay or redirect the work. These features begin to describe how management is likely to happen rather than labeling the land as federally owned and considering the job finished.

As I work through the documents, I would keep track of what is known, what is estimated, and what might force a split. The planning requirements are written down. The frequency with which they lead to a particular treatment may need to be estimated from management records. The degree to which those treatments produce similar outcomes remains an empirical question.

## Why Green Mountain belongs in the first version

The next comparison would be with the Green Mountain National Forest in Vermont. Green Mountain and Finger Lakes have different names, occupy different states, and sit several hours apart. Their terrain and local ecological settings also differ. Green Mountain has more topography, while Finger Lakes sits within the mixed agricultural and forested setting of the Finger Lakes region.

Those differences would weigh heavily if I were building practice bundles for private landowners in New York and Vermont. State tax programs, regulations, extension systems, incentive structures, and the local culture surrounding private forests can change what a landowner is willing or able to do. In that case, the state line may reasonably become the bundle boundary.

The Forest Service crosses the same line under a different management context. Green Mountain and Finger Lakes are administered together and share a forest supervisor. That common administration connects the people and systems that turn plans into decisions, which makes the two forests a reasonable first candidate for lumping.

I would still put their forest plans beside each other. If the plans are markedly similar, their mandates and inventory protocols match, and their stewardship and multiple-use priorities are handled in a consistent manner, it makes sense to package all of these things up as one bundle. Shared administration gets the comparison started. Similar plans, practices, and reported outcomes would make the grouping defensible.

## Could White Mountain belong too?

White Mountain National Forest raises a harder version of the same question. It occupies New Hampshire and Maine and has a separate administration, so it cannot be added to the bundle simply through a shared forest supervisor. Including White Mountain would require evidence that its decision-making framework, management capacity, practices, and range of outcomes are similar enough to those of Green Mountain and Finger Lakes.

All three forests manage northern hardwood stands within the same broad region. I would expect to find many of the same Forest Service mandates, planning procedures, inventory systems, requirements for stewardship and multiple use, and technical approaches to timber management. Timber sales also move through a formal bidding process, although the bidders, local prices, operator availability, and particulars of a sale will differ among the forests.

Those differences can stay in the model without automatically creating another practice bundle. Local species composition, deer pressure, invasive species, stand history, winter conditions, and topography will affect what a treatment produces. The local market may affect whether a sale receives bids and what kind of work can pay for itself. These conditions can be represented as geographic, ecological, or market context surrounding the management bundle.

<figure class="nhr-figure full-width nhr-photo protected-image" oncontextmenu="return false;">
  <img
    src="{{ site.baseurl }}/assets/images/northern-hardwoods-megatrip/nhr-log-35-treated-stand-central-maine.jpg"
    alt="Recently treated hardwood stand in central Maine with retained trees, slash, and dense understory vegetation"
    loading="lazy"
    draggable="false"
  >
  <figcaption>A treated stand in central Maine. One local prescription can help define a practice bundle, but it cannot stand in for every forest, ownership, or implementation context in the Northeast.</figcaption>
</figure>

If White Mountain falls within the same expected range after those factors are considered, the eventual bundle could include Finger Lakes, Green Mountain, and White Mountain across New York, Vermont, New Hampshire, and Maine. The forests would remain distinct places, and the model would treat their managers as actors operating under sufficiently similar circumstances.

## Comparing plans with implemented management

The forest plans provide the first layer of evidence. Forest Service monitoring or evaluation reports provide another, since they establish benchmarks for assessing progress toward the objectives and goals in those plans. The reports should help show whether outcomes are meeting the priorities that each forest has written down, especially when the forest has the capital, staff, and funding to pursue them.

I would work from plans to evaluation reports, then into timber-sale records, inventories, monitoring documents, interviews, and field observations where those are available. The plans describe intentions. The other records show what was implemented, where management departed from the plan, and what happened afterward. When the same relationships among intentions, operations, and outcomes appear across several forests, the case for bundling becomes much stronger.

A departure from a plan still requires interpretation. One forest may share the same priorities as another while lacking the money, staff, operator access, or time to complete a treatment or conduct follow-up work. That would change some of the bundle parameters, although it might remain within an expected range. A repeated difference in priorities and implemented management would raise a different problem.

Evaluation reports give me a direct place to look for that distinction. If the forests are working toward similar benchmarks and producing outcomes within a common range, keeping them together makes sense. If one forest repeatedly reports different priorities, levels of implementation, or outcomes, it becomes a candidate for a split.

## How much difference earns a split?

One different outcome in one evaluation report would prompt another look. It would not immediately create another modeled actor. The whole point of practice bundles is to find enough commonality that I do not infinitely split managers until I am back to millions of separate agents.

I would look across the full set of evidence before drawing a new boundary. Are the stated priorities different? Do the forests enter stands at consistently different frequencies or intensities? Is one forest less able to complete regeneration work, monitoring, or follow-up treatments? Do implemented practices regularly depart from the plans for different reasons? Most important for the model, do those differences produce a separate distribution of behavior and outcomes?

A local timber sale that receives fewer bids may reflect the market at that place and time. Poor regeneration after one treatment may reflect deer browse, competing vegetation, the existing stand, or winter conditions. Those differences can remain inside the bundle if its parameter ranges and contextual variables can represent them without flattening the outcome.

A split becomes more defensible when the same differences persist across planning, capacity, implementation, and results. At that point, the original grouping may be carrying so much variation that the average or distribution stops telling us much about either forest.

Once the boundary is stable enough to use, I can begin filling the bundle with model parameters. For this Forest Service group, I would probably expect a comparatively high likelihood of active management and a narrower range than I would use for family forest landowners. The bundle could include ranges for entry frequency, harvest intensity, treatment selection, regeneration planning, monitoring, follow-up investment, staffing and technical capacity, and the frequency with which implemented management departs from the plan.

These parameters should remain ranges or distributions. Planning intensity and access to technical expertise may have fairly narrow distributions, while funding, timber-sale activity, treatment intensity, and realized outcomes may vary more. If the evidence shows two recurring patterns, then a bimodal distribution may describe a parameter better than a single bell curve. We will have to approach that as we go along rather than deciding ahead of time that every kind of behavior has the same statistical shape.

The bundle can then respond to changes in the larger model. Funding might increase or decline. Technical support, operator availability, invasive-species pressure, deer management, or the adoption of a silvicultural practice might change. The model could estimate how the likely range of management shifts and what that shift means for the acres represented by the bundle.

## What this bundle will miss

Even this comparatively orderly Forest Service bundle will miss decisions made at the most targeted levels. Individual districts have different managers, and those managers necessarily have their own priorities. One may focus more heavily on ecological objectives, while another is trying to address a local market for particular wood products. Staff experience, public pressure, recent disturbances, working relationships, and the history of an individual stand may also affect what is proposed and what eventually happens.

The bundle will not reproduce every district manager's reasoning or predict which company bids on one timber sale. It will lose some detail about disagreements among staff and instances where individual judgment redirects a treatment. Those are known limitations of the grouping, and they need to remain visible.

Expected thresholds of behavior should help carry the variation that affects landscape-level outcomes. The Forest Service bundle may have a narrower range than the future family forest landowner bundle, but it will still need upper and lower bounds, probability distributions, and an acknowledgment of error. The goal is to retain useful differences without giving every individual decision its own agent.

Eventually, I would want to ground-truth the modeled outcomes against real-world FIA data at the landscape level, or at least use FIA to test the forest conditions and trajectories it is equipped to measure. Administrative records, evaluation reports, timber-sale data, interviews, and field observations would have to carry more of the burden for testing the behavioral assumptions. No one dataset can tell us whether every part of the bundle is right.

There is no such thing as a perfect model, but there can be a good model that is explainable enough to create a useful discussion about what should be changed, what cannot be changed, and where an intervention might actually have an effect. Someone looking at the northeastern Forest Service bundle should be able to question why these forests were grouped, whether the ranges are wide enough, and what evidence would make us redraw the boundary.

Starting with the Forest Service makes those mechanics visible without forcing this post to solve every practice-bundle problem at once. It gives us a baseline built from formal plans, professional staff, evaluation reports, and comparatively bounded goals. A later post can ask the same questions of family forest landowners, where priorities, competency, resources, access to foresters, and willingness to conduct active management are much harder to observe. If the same general method can represent both groups without flattening one or infinitely splitting the other, then the practice-bundle idea may be usable in the larger model.
