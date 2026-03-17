#!/usr/bin/env python3
"""
Build a fully static version of the FIFA Player Visualization site into docs/.
Pre-generates all API JSON data so the site can be hosted on GitHub Pages.
"""

import os
import json
import shutil
import re
import numpy as np
import pandas as pd

ROOT = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.join(ROOT, "docs")

# ---------- helpers ----------

def write_json(filename, data):
    path = os.path.join(DOCS, "data", filename)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, separators=(",", ":"))
    print(f"  wrote {path}  ({os.path.getsize(path):,} bytes)")


# ---------- load dataset ----------

csv_path = os.path.join(ROOT, "clean.csv")
df = pd.read_csv(csv_path)
print(f"Loaded {len(df)} players from {csv_path}")

# ---------- generate JSON data files ----------

print("\nGenerating JSON data files...")

# 1. /fifadata
columns = ["sofifa_id", "player_url", "short_name", "age", "nationality",
           "club", "overall", "wage_eur", "player_positions",
           "pace", "shooting", "passing", "dribbling", "defending",
           "physic", "continent"]
result = df[columns].copy()
result = result.rename(columns={"sofifa_id": "fifa_id"})
# Replace NaN with None for valid JSON
write_json("fifadata.json", json.loads(result.to_json(orient="records")))

# 2. /jagdata
columns2 = ["short_name", "nationality", "club", "overall", "continent"]
result2 = df[columns2].head(1000)
write_json("jagdata.json", json.loads(result2.to_json(orient="records")))

# 3. /d3data
subset = df.head(2000)
d3data = {"name": "DISTRIBUTION OF TOP 2000 PLAYERS BY NATIONALITY", "children": []}
for continent in subset['continent'].unique():
    continent_set = subset[subset["continent"] == continent]
    continent_dict = {"name": continent, "children": []}
    d3data["children"].append(continent_dict)
    for country in continent_set['nationality'].unique():
        countries_set = continent_set[continent_set['nationality'] == country][['short_name', 'overall']]
        country_dict = {"name": country, "children": []}
        continent_dict['children'].append(country_dict)
        for player in countries_set.values:
            country_dict["children"].append({
                'name': player[0],
                'size': int(player[1])
            })
write_json("d3data.json", d3data)

# 4. /api/continent-summary
stats = df.groupby('continent').agg(
    count=('overall', 'size'),
    avg_overall=('overall', 'mean'),
    avg_pace=('pace', 'mean'),
    avg_shooting=('shooting', 'mean'),
    avg_passing=('passing', 'mean'),
    avg_dribbling=('dribbling', 'mean'),
    avg_defending=('defending', 'mean'),
    avg_physic=('physic', 'mean'),
    avg_wage=('wage_eur', 'mean'),
    max_overall=('overall', 'max'),
    avg_age=('age', 'mean')
).reset_index()
stats = stats.round(2)
write_json("continent-summary.json", json.loads(stats.to_json(orient="records")))

# 5. /api/position-age
position_map = {
    'GK': 'GK',
    'CB': 'DEF', 'RB': 'DEF', 'LB': 'DEF', 'RWB': 'DEF', 'LWB': 'DEF',
    'CDM': 'MID', 'CM': 'MID', 'CAM': 'MID', 'RM': 'MID', 'LM': 'MID',
    'RW': 'FWD', 'LW': 'FWD', 'CF': 'FWD', 'ST': 'FWD', 'RF': 'FWD', 'LF': 'FWD'
}
def get_position_group(positions_str):
    primary = str(positions_str).split(',')[0].strip()
    return position_map.get(primary, 'OTHER')

temp = df.copy()
temp['pos_group'] = temp['player_positions'].apply(get_position_group)
temp = temp[temp['pos_group'] != 'OTHER']
pivot = temp.groupby(['age', 'pos_group']).size().unstack(fill_value=0).reset_index()
pos_result = []
for _, row in pivot.iterrows():
    entry = {'age': int(row['age'])}
    for col in ['GK', 'DEF', 'MID', 'FWD']:
        entry[col] = int(row.get(col, 0))
    pos_result.append(entry)
write_json("position-age.json", pos_result)

# 6. /api/wage-overall
top = df.nlargest(500, 'overall')[
    ['short_name', 'overall', 'wage_eur', 'age', 'continent', 'club',
     'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic']
].copy()
top = top.round(1)
write_json("wage-overall.json", json.loads(top.to_json(orient="records")))

# 7. /api/club-treemap
top3k = df.nlargest(3000, 'overall')
treemap = {"name": "FIFA Clubs", "children": []}
for continent in top3k['continent'].unique():
    cont_set = top3k[top3k['continent'] == continent]
    cont_node = {"name": continent, "children": []}
    club_stats = cont_set.groupby('club').agg(
        count=('overall', 'size'),
        avg_overall=('overall', 'mean')
    ).reset_index()
    club_stats = club_stats[club_stats['count'] >= 2]
    club_stats = club_stats.nlargest(20, 'avg_overall')
    for _, row in club_stats.iterrows():
        cont_node["children"].append({
            "name": row['club'],
            "value": int(row['count']),
            "avg_overall": round(row['avg_overall'], 1)
        })
    if cont_node["children"]:
        treemap["children"].append(cont_node)
write_json("club-treemap.json", treemap)

# 8. /api/position-chord
position_list = ['GK', 'CB', 'RB', 'LB', 'CDM', 'CM', 'CAM', 'RM', 'LM', 'RW', 'LW', 'ST', 'CF']
matrix = [[0] * len(position_list) for _ in range(len(position_list))]
pos_index = {p: i for i, p in enumerate(position_list)}
for positions_str in df['player_positions'].dropna():
    positions = [p.strip() for p in str(positions_str).split(',')]
    valid = [p for p in positions if p in pos_index]
    for i in range(len(valid)):
        for j in range(i + 1, len(valid)):
            a, b = pos_index[valid[i]], pos_index[valid[j]]
            matrix[a][b] += 1
            matrix[b][a] += 1
write_json("position-chord.json", {"labels": position_list, "matrix": matrix})

# 9. /api/top-players-network
top80 = df.nlargest(80, 'overall')[
    ['short_name', 'overall', 'club', 'nationality', 'continent', 'wage_eur', 'age']
].copy()
nodes = []
for _, row in top80.iterrows():
    nodes.append({
        "id": row['short_name'],
        "overall": int(row['overall']),
        "club": row['club'],
        "nationality": row['nationality'],
        "continent": row['continent'],
        "wage": float(row['wage_eur']),
        "age": int(row['age'])
    })
links = []
players = top80.to_dict('records')
for i in range(len(players)):
    for j in range(i + 1, len(players)):
        if players[i]['club'] == players[j]['club']:
            links.append({
                "source": players[i]['short_name'],
                "target": players[j]['short_name'],
                "type": "club",
                "label": players[i]['club']
            })
        elif players[i]['nationality'] == players[j]['nationality']:
            links.append({
                "source": players[i]['short_name'],
                "target": players[j]['short_name'],
                "type": "nationality",
                "label": players[i]['nationality']
            })
write_json("top-players-network.json", {"nodes": nodes, "links": links})

# 10. /api/attribute-distribution
attrs = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic']
sample = df.dropna(subset=attrs).sample(n=min(3000, len(df)), random_state=42)
attr_result = []
for _, row in sample.iterrows():
    for attr in attrs:
        attr_result.append({
            'continent': row['continent'],
            'attribute': attr,
            'value': round(float(row[attr]), 1)
        })
write_json("attribute-distribution.json", attr_result)

# 11. /api/hexbin
outfield = df.dropna(subset=['pace', 'shooting'])
hexbin = outfield[['pace', 'shooting', 'overall', 'short_name', 'continent']].copy()
hexbin = hexbin.round(1)
write_json("hexbin.json", json.loads(hexbin.to_json(orient="records")))

# ---------- copy static assets ----------

print("\nCopying static assets...")
static_src = os.path.join(ROOT, "static")
static_dst = os.path.join(DOCS, "static")
if os.path.exists(static_dst):
    shutil.rmtree(static_dst)
shutil.copytree(static_src, static_dst)
print(f"  copied {static_src} -> {static_dst}")

# ---------- build HTML pages ----------

print("\nBuilding HTML pages...")

# Mapping of Flask API routes to static JSON paths
API_MAP = {
    '"/fifadata"': '"data/fifadata.json"',
    '"/jagdata"': '"data/jagdata.json"',
    '"/d3data"': '"data/d3data.json"',
    '"/api/continent-summary"': '"data/continent-summary.json"',
    '"/api/position-age"': '"data/position-age.json"',
    '"/api/wage-overall"': '"data/wage-overall.json"',
    '"/api/club-treemap"': '"data/club-treemap.json"',
    '"/api/position-chord"': '"data/position-chord.json"',
    '"/api/top-players-network"': '"data/top-players-network.json"',
    '"/api/attribute-distribution"': '"data/attribute-distribution.json"',
    '"/api/hexbin"': '"data/hexbin.json"',
}

# Navigation link mapping for static pages
NAV_MAP = {
    'href="/"': 'href="index.html"',
    'href="compare"': 'href="compare.html"',
    'href="visualizations"': 'href="visualizations.html"',
    'href="about"': 'href="about.html"',
}

# Static asset path mapping (remove /static/ prefix since files are co-located)
ASSET_MAP = {
    'src="/static/': 'src="static/',
    'href="/static/': 'href="static/',
}

templates_dir = os.path.join(ROOT, "templates")
pages = {
    "index.html": os.path.join(templates_dir, "index.html"),
    "compare.html": os.path.join(templates_dir, "compare.html"),
    "about.html": os.path.join(templates_dir, "about.html"),
    "visualizations.html": os.path.join(templates_dir, "visualizations.html"),
}

for out_name, src_path in pages.items():
    with open(src_path, "r") as f:
        html = f.read()

    # Fix navigation links
    for old, new in NAV_MAP.items():
        html = html.replace(old, new)

    # Fix static asset paths
    for old, new in ASSET_MAP.items():
        html = html.replace(old, new)

    out_path = os.path.join(DOCS, out_name)
    with open(out_path, "w") as f:
        f.write(html)
    print(f"  wrote {out_path}")

# ---------- build JS files with updated API paths ----------

print("\nUpdating JS files with static data paths...")

js_files = ["logic.js", "app.js", "visualizations.js"]
for js_file in js_files:
    src = os.path.join(static_src, "js", js_file)
    dst = os.path.join(static_dst, "js", js_file)
    if not os.path.exists(src):
        continue
    with open(src, "r") as f:
        content = f.read()

    # Replace API fetch paths with static JSON paths.
    # d3.json() resolves relative to the HTML page URL, not the JS file,
    # so paths are relative to docs/ (where the HTML pages live).
    for old, new in API_MAP.items():
        content = content.replace(old, new)

    with open(dst, "w") as f:
        f.write(content)
    print(f"  updated {dst}")

# ---------- done ----------

print(f"\nBuild complete! Static site is in {DOCS}/")
print(f"To test locally: cd {DOCS} && python3 -m http.server 8000")
