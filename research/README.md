# Technology guide research

`technology-guides.json` is the canonical research supplement for the ten existing-capability records. It contains technology explanations, process routes, organisations and projects, mineral-specific mechanisms, proposed Indian expansion paths, constraints, terminology and source references.

The research was checked on 19 October 2026. Sources are operator disclosures, company filings, government and research-institution publications, and original research papers. Dated evidence takes precedence over undated marketing pages when describing the same project's status. Historical publications establish historical capability; they do not establish present output. Undated sources are identified as such.

## Relationship to the workbook

The original workbook continues to supply the map's mineral descriptions and original chemistry records. The importer does not overwrite this separate research supplement. Newer technology evidence can refine or differ from the workbook snapshot: the guides retain the evidence date and separate commissioning, trial production, customer qualification, announced capacity and actual output. The workbook itself has not been rewritten as part of this expansion.

The original `fit` tags remain visible for continuity. The guide's mineral explanations specify the narrower demonstrated or proposed connection. For example, a copper link may concern tellurium recovered from copper processing; it does not mean the technology creates a copper mine. Shared operating skills do not establish that a separate product or application has been commercially qualified.

## Evidence and proposed expansion

Factual blocks reference source IDs. The build resolves them into a deduplicated bibliography, adds reverse links to the technology guides, and generates each guide's local citation numbers. Citations next to the text open the supporting source directly.

Expansion sections are editorial analysis, labelled **Proposed pathway** on the site. Their references support the premises and industrial examples, rather than implying that an operator has announced the proposed Indian project. Published investment figures retain their original project scope; the guides do not infer generic Indian capital costs or guaranteed completion dates.

Some value chains branch or offer alternative feed routes. The process descriptions identify these distinctions; their panels are not a progress score or a requirement that every stage be domestic.

## Updating

Edit the relevant entry in `technology-guides.json`. Keep stable capability IDs, preserve original mineral IDs, and give every factual block supporting `refs`. Each referenced ID must appear in that guide's `sources` array. Source IDs should be unique; URLs should point to the document or page used, not a search result. Add a publication date, or state that the page is undated. Preserve an actor's evidence date when making status claims.

Run the normal build. It checks that every capability has a guide, required sections have references, all original mineral connections are explained, and linked strategies and source IDs resolve. The built JSON combines the research with the workbook without changing the source workbook or its original JSON export.
