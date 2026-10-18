# India Capability Map

A static field guide to India's position across 26 critical-mineral value chains, with 18 shared capabilities, 10 chemistry foundations and 105 sources. The overview pairs existing capabilities with proposed actions. Mineral detail pages show the four-stage World/India value chain. The map links to the related dashboard at [indiacriticalminerals.com](https://indiacriticalminerals.com).

## Content

`source-data/India_Capability_Map.xlsx` is the source of truth for research content. During each build, the workbook importer refreshes the value chains, capability descriptions, chemistry, notes and source URLs in `capability_map.json`. The JSON also holds presentation mappings supplied in the original site kit: stable IDs, element symbols, group labels, presence levels, next-move stages, and relationships between records. Update those mappings when a workbook change requires it. There is no automatic live sync with the main dashboard.

Costs, timelines, confidence labels and estimates retain the workbook's meaning. The site does not independently revalidate the research. The supplied JSON retains its original presence ratings and next-move stage mappings for provenance; these are not displayed or used to rank minerals.

## Run locally

Requires Node.js 18+ and Python 3. No packages need installing.

```sh
npm run build
npm start
```

Open `http://localhost:8768`. The generated `dist/index.html` also works when opened directly from a folder, using the generated data fallback.

## Publish

GitHub Actions builds the workbook-backed static site and deploys `dist/` to GitHub Pages on every push to `main`. Publishing source must be set to **GitHub Actions** in repository Settings → Pages. All assets and data paths are relative, including when hosted under a repository subpath.

The workbook labels this an internal resource. Standard GitHub Pages hosting is publicly accessible. The HTML retains `noindex,nofollow`; these directives are not access control. No analytics or third-party scripts are included; Google Fonts are optional, with system font fallbacks.

## Use

Select a mineral name or its details link for the full two-lane chain and proposed action. The overview shows full workbook descriptions; filters hide unmatched minerals. The strategies page includes a capability matrix and time horizons. Existing capabilities is a separate section containing all 10 chemistry foundations, their mineral links and sources. Press `/` to search all content, `Esc` to close search, and left/right arrows to move between minerals. Each mineral page has an A4 landscape print stylesheet.
