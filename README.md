# Project Intersect — City Map

An interactive map dashboard for **Project Intersect**, a road safety initiative by the **Greater Bengaluru Authority (GBA)** and **Compartment S4**.

**[View the live site →](https://projectintersect.framer.website)**

---

## About the Initiative

Bengaluru recorded 4,893 road accidents in 2025, according to Bengaluru Traffic Police (BTP) data. Project Intersect is part of GBA's city-wide road safety initiative — it identifies high-risk locations across Bengaluru using verified traffic police data. These sites include high-fatality locations, school zone junctions, junctions lacking pedestrian infrastructure, and locations with potential for public space interventions.

A key outcome is a **Countermeasure Matrix** — a framework to arrive at engineering and infrastructure solutions based on the causes of each crash. Project Intersect is designed to make road safety interventions scientific, replicable, and accessible for decision-makers, urban designers, road safety consultants, think tanks, and government authorities.

**Partners:** GBA · Compartment S4 · Raahgiri Foundation · Sustainable Mobility Network · NHAI · BIGRS · WRI India · RCVA  
**Data:** Bengaluru Traffic Police (BTP)

---

## What the dashboard shows

- **Priority locations** across the Greater Bangalore Area, identified for road safety improvements
- **Blackspots** from BTP crash data (2023–2025)
- **Junctions developed or under development** through the Suraksha 75 and 15th Finance Commission programmes
- Crash pattern analysis and countermeasures per junction
- Vote counts for junctions, powered by Supabase

## Filters

Filter by Corporation zone, Junction ID, Road Hierarchy, and Theme (e.g. Commercial, School, Crash).

## Junction detail page

Clicking a junction opens a side panel with audit data, street view imagery, crash patterns, and countermeasures. A "View Details" button opens a full-page breakdown.

---

## Stack

- [MapLibre GL JS](https://maplibre.org/) — map rendering
- [MapTiler](https://www.maptiler.com/) — basemap tiles and geocoding search
- [Shoelace](https://shoelace.style/) — UI components
- [Supabase](https://supabase.com/) — vote persistence
- Vanilla JS, HTML, CSS — no build step

## Structure

```
index.html          — Hub / landing page
dashboard/          — Main map dashboard
  index.html
  map.js
  junction.html     — Per-junction detail page
  datasets/         — GeoJSON and CSV data files
hero/               — Hero / record pages
chapters/           — Chapter pages (South NH44 corridor study)
libs/               — Local copies of third-party libraries
```
