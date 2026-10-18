"""Refresh research fields from the authoritative workbook; preserve supplied UI mappings."""
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
data = json.loads((ROOT / "capability_map.json").read_text())
with zipfile.ZipFile(ROOT / "source-data/India_Capability_Map.xlsx") as archive:
    shared = ["".join(e.itertext()) for e in ET.fromstring(archive.read("xl/sharedStrings.xml"))] if "xl/sharedStrings.xml" in archive.namelist() else []

    def rows(number):
        result = []
        for row in ET.fromstring(archive.read(f"xl/worksheets/sheet{number}.xml")).findall(".//s:row", NS):
            values = {}
            for cell in row:
                value, inline = cell.find("s:v", NS), cell.find("s:is", NS)
                letters = re.match(r"[A-Z]+", cell.attrib["r"])[0]
                index = 0
                for letter in letters:
                    index = index * 26 + ord(letter) - 64
                values[index-1] = shared[int(value.text)] if cell.attrib.get("t") == "s" else value.text if value is not None else "".join(inline.itertext()) if inline is not None else ""
            result.append([values.get(i, "") for i in range(max(values, default=-1)+1)])
        return result

    mineral_by_name = {m["name"]: m for m in data["minerals"]}
    chain_rows, india_rows = rows(1)[1:], rows(2)[1:]
    if set(r[0] for r in chain_rows) != set(mineral_by_name) or set(r[0] for r in india_rows) != set(mineral_by_name):
        raise ValueError("Workbook mineral set changed. Update JSON IDs and relationships before building.")
    for row in chain_rows:
        mineral = mineral_by_name[row[0]]
        mineral["group"] = int(row[1].removeprefix("G"))
        for cell, stage in zip(row[2:6], mineral["stages"]):
            world, india = cell.removeprefix("World: ").split("\nIndia: ", 1)
            stage.update(world=world, india=india)
    for row in india_rows:
        mineral = mineral_by_name[row[0]]
        if mineral["group"] != int(row[1].removeprefix("G")):
            raise ValueError(f"Workbook tabs disagree on group: {row[0]}")
        for value, key in zip(row[2:], ["what_india_has", "kinds", "next_move", "value_chain_step", "complexity", "ease", "cost", "time_to_output", "confidence"]):
            mineral[key] = [v.strip() for v in value.split(";")] if key == "kinds" else int(value) if key == "complexity" else value
    for group in data["groups"]:
        group["minerals"] = [m["id"] for m in data["minerals"] if m["group"] == group["id"]]
    if any(m["group"] not in [g["id"] for g in data["groups"]] for m in data["minerals"]):
        raise ValueError("Workbook has a new group; define its name and colour in JSON.")
    strategy_rows = rows(3)[1:]
    if len(strategy_rows) != len(data["strategies"]):
        raise ValueError("Workbook capability set changed; update presentation mappings.")
    for row in strategy_rows:
        strategy = next(s for s in data["strategies"] if s["number"] == int(row[0]))
        for value, key in zip(row[1:], ["name", "what", "minerals_text", "outside_china", "complexity", "cost", "india_base", "gap"]):
            strategy[key] = value
    chemistry_rows = rows(4)[1:]
    if set(r[0] for r in chemistry_rows) != {k["name"] for k in data["chemistry"]}:
        raise ValueError("Workbook chemistry set changed; update presentation mappings.")
    for row in chemistry_rows:
        chemical = next(k for k in data["chemistry"] if k["name"] == row[0])
        for value, key in zip(row, ["name", "who", "carries_over_to", "minerals_text", "fit"]):
            chemical[key] = value
    data["meta"]["notes"] = [{"title": row[0], "text": row[1]} for row in rows(5)]
    source_rows = rows(6)[1:]
    if set(r[0] for r in source_rows) != {s["title"] for s in data["sources"]}:
        raise ValueError("Workbook source set changed; update source IDs and usage mappings.")
    for row in source_rows:
        source = next(s for s in data["sources"] if s["title"] == row[0])
        source["url"] = row[1] if row[1].startswith(("https://", "http://")) else None

(ROOT / "capability_map.json").write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
print("Imported authoritative workbook content; retained presentation mappings.")
