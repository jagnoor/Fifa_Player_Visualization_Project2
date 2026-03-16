import os
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
    ''' This function runs when the browser loads the index route.
        Note that the html file must be located in a folder called templates. '''
    webpage = render_template("index.html")
    return webpage


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

    data = {}
    data["name"] = "DISTRIBUTION OF TOP 1000 PLAYERS DUE TO NATIONALITY"
    data["children"] = []

    for continent in subset['continent'].unique():
        continent_set = subset[subset["continent"] == continent]
        continent_dict = {"name": continent, "children": []}
        data["children"].append(continent_dict)

        for country in continent_set['nationality'].unique():
            countries_set = continent_set[continent_set['nationality'] == country][['short_name', 'overall']]
            country_dict = {"name": country, "children": []}
            continent_dict['children'].append(country_dict)

            for player in countries_set.values:
                player_dict = {
                    'name': player[0],
                    'size': int(player[1])
                }
                country_dict["children"].append(player_dict)

    return jsonify(data)


@app.route("/compare")
def QueryCompare():
    ''' Render the comparison page. '''
    webpage = render_template("compare.html")
    return webpage


@app.route("/about")
def QueryAbout():
    ''' Render the about page. '''
    webpage = render_template("about.html")
    return webpage


if __name__ == '__main__':
    app.run(debug=True)
