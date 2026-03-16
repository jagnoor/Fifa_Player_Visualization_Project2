import os
import json
import numpy as np
import pandas as pd
from flask import Flask, render_template, jsonify
import warnings
warnings.filterwarnings("ignore")

# Load data from CSV file (no external database required)
csv_path = os.path.join(os.path.dirname(__file__), "clean.csv")
df = pd.read_csv(csv_path)

# Instantiate the Flask application
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0  # Effectively disables page caching


@app.route("/")
def IndexRoute():
    ''' Render the home page. '''
    return render_template("index.html")


@app.route("/fifadata")
def QueryFifadata():
    ''' Return all FIFA player data as JSON. '''
    columns = ["sofifa_id", "player_url", "short_name", "age", "nationality",
                "club", "overall", "wage_eur", "player_positions",
                "pace", "shooting", "passing", "dribbling", "defending",
                "physic", "continent"]
    result = df[columns].copy()
    result = result.rename(columns={"sofifa_id": "fifa_id"})
    return jsonify(result.to_dict(orient="records"))


@app.route("/jagdata")
def QueryJagData():
    ''' Return limited FIFA player data as JSON. '''
    columns = ["short_name", "nationality", "club", "overall", "continent"]
    result = df[columns].head(1000)
    return jsonify(result.to_dict(orient="records"))


@app.route("/d3data")
def GetParentChildData():
    ''' Return hierarchical data for D3 circle packing visualization. '''
    subset = df.head(2000)

    data = {"name": "DISTRIBUTION OF TOP 2000 PLAYERS BY NATIONALITY", "children": []}

    for continent in subset['continent'].unique():
        continent_set = subset[subset["continent"] == continent]
        continent_dict = {"name": continent, "children": []}
        data["children"].append(continent_dict)

        for country in continent_set['nationality'].unique():
            countries_set = continent_set[continent_set['nationality'] == country][['short_name', 'overall']]
            country_dict = {"name": country, "children": []}
            continent_dict['children'].append(country_dict)

            for player in countries_set.values:
                country_dict["children"].append({
                    'name': player[0],
                    'size': int(player[1])
                })

    return jsonify(data)


@app.route("/compare")
def QueryCompare():
    ''' Render the comparison page. '''
    return render_template("compare.html")


@app.route("/about")
def QueryAbout():
    ''' Render the about page. '''
    return render_template("about.html")


@app.route("/visualizations")
def QueryVisualizations():
    ''' Render the advanced visualizations page. '''
    return render_template("visualizations.html")


# =========================================================================
# New API endpoints for advanced visualizations
# =========================================================================

@app.route("/api/continent-summary")
def ApiContinentSummary():
    ''' Aggregated stats per continent for radial bar chart. '''
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
    return jsonify(stats.to_dict(orient="records"))


@app.route("/api/position-age")
def ApiPositionAge():
    ''' Position distribution by age for stacked area chart. '''
    # Map each player to their primary position category
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
    result = []
    for _, row in pivot.iterrows():
        entry = {'age': int(row['age'])}
        for col in ['GK', 'DEF', 'MID', 'FWD']:
            entry[col] = int(row.get(col, 0))
        result.append(entry)
    return jsonify(result)


@app.route("/api/wage-overall")
def ApiWageOverall():
    ''' Top 500 players for scatter plot (wage vs overall). '''
    top = df.nlargest(500, 'overall')[
        ['short_name', 'overall', 'wage_eur', 'age', 'continent', 'club',
         'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic']
    ].copy()
    top = top.round(1)
    return jsonify(top.to_dict(orient="records"))


@app.route("/api/club-treemap")
def ApiClubTreemap():
    ''' Hierarchical data for treemap: continent > country > club. '''
    # Use top 3000 players for a rich treemap
    top = df.nlargest(3000, 'overall')

    data = {"name": "FIFA Clubs", "children": []}

    for continent in top['continent'].unique():
        cont_set = top[top['continent'] == continent]
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
            data["children"].append(cont_node)

    return jsonify(data)


@app.route("/api/position-chord")
def ApiPositionChord():
    ''' Co-occurrence matrix for chord diagram of positions. '''
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

    return jsonify({"labels": position_list, "matrix": matrix})


@app.route("/api/top-players-network")
def ApiTopPlayersNetwork():
    ''' Network graph: top players connected by shared clubs/nationalities. '''
    top = df.nlargest(80, 'overall')[
        ['short_name', 'overall', 'club', 'nationality', 'continent', 'wage_eur', 'age']
    ].copy()

    nodes = []
    for _, row in top.iterrows():
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
    players = top.to_dict('records')
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

    return jsonify({"nodes": nodes, "links": links})


@app.route("/api/attribute-distribution")
def ApiAttributeDistribution():
    ''' Violin/bee-swarm data: attribute distributions by continent. '''
    attrs = ['pace', 'shooting', 'passing', 'dribbling', 'defending', 'physic']
    # Sample for performance
    sample = df.dropna(subset=attrs).sample(n=min(3000, len(df)), random_state=42)

    result = []
    for _, row in sample.iterrows():
        for attr in attrs:
            result.append({
                'continent': row['continent'],
                'attribute': attr,
                'value': round(float(row[attr]), 1)
            })
    return jsonify(result)


@app.route("/api/hexbin")
def ApiHexbin():
    ''' Pace vs Shooting data for hexbin plot of all outfield players. '''
    outfield = df.dropna(subset=['pace', 'shooting'])
    result = outfield[['pace', 'shooting', 'overall', 'short_name', 'continent']].copy()
    result = result.round(1)
    return jsonify(result.to_dict(orient="records"))


if __name__ == '__main__':
    app.run(debug=True)
