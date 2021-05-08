# Import the functions we need from flask
import pandas as pd
from flask import Flask
from flask import render_template 
from flask import jsonify
from fifa_storage import fifa_pw, fifa_username
import warnings
warnings.filterwarnings("ignore")

# Import the functions we need from SQL Alchemy
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine

# Define the database connection parameters
rds_connection_string = f"{fifa_username}:{fifa_pw}@localhost:5432/fifa_df1"
engine = create_engine(f'postgresql://{rds_connection_string}')

# Connect to the database
base = automap_base()
base.prepare(engine, reflect=True)

# Choose the table we wish to use
table = base.classes.fifa_df1

# Instantiate the Flask application. (Chocolate cake recipe.)
# This statement is required for Flask to do its job. 
app = Flask(__name__)
app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0 # Effectively disables page caching

# Here's where we define the various application routes ...
@app.route("/")
def IndexRoute():
    ''' This function runs when the browser loads the index route. 
        Note that the html file must be located in a folder called templates. '''

    webpage = render_template("index.html")
    return webpage

@app.route("/fifadata")
def QueryFifadata():
    ''' Query the database for population numbers and return the results as a JSON. '''

    # Open a session, run the query, and then close the session again
    session = Session(engine)
    results = session.query(table.sofifa_id, table.player_url, table.short_name,
     table.age, table.nationality, table.club, table.overall, table.wage_eur, table.player_positions,
     table.pace, table.shooting, table.passing, table.dribbling, table.defending, table.physic, table.continent).all()
    session.close()

    # Create a list of dictionaries, with each dictionary containing one row from the query. 
    all_fifa = []
    for sofifa_id, player_url, short_name, age, nationality, club, overall, wage_eur, player_positions, pace, shooting, passing, dribbling, defending, physic, continent in results:
        dict = {}
        dict["fifa_id"] = sofifa_id
        dict["player_url"] = player_url
        dict["short_name"] = short_name
        dict["age"] = age
        dict['nationality'] = nationality
        dict["club"] = club
        dict["overall"] = overall
        dict["wage_eur"] = wage_eur
        dict["player_positions"] = player_positions
        dict["pace"] = pace
        dict["shooting"] = shooting
        dict["passing"] = passing
        dict["dribbling"] = dribbling
        dict["defending"] = defending
        dict["physic"] = physic
        dict["continent"] = continent
        all_fifa.append(dict)

    # Return the jsonified result. 
    return jsonify(all_fifa)


@app.route("/jagdata")
def QueryJagData():
    ''' Query the database for population numbers and return the results as a JSON. '''

    # Open a session, run the query, and then close the session again
    session = Session(engine)
    jagResults = session.query(table.short_name, table.nationality, table.club, table.overall, table.continent).all()
    session.close()

    # Create a list of dictionaries, with each dictionary containing one row from the query. 
    jag_fifa = []
    for short_name, nationality, club, overall, continent in jagResults:
        dict = {}
        dict["short_name"] = short_name
        dict['nationality'] = nationality
        dict["club"] = club
        dict["overall"] = overall
        dict["continent"] = continent
        jag_fifa.append(dict)

    # Return the jsonified result. 
    return jsonify(jag_fifa)



@app.route("/d3data")
def GetParentChildData():

    # Query the database and store the result in a dataframe
    df = pd.read_sql_query('select * from fifa_df1', con=engine)

    data = {}
    data["name"] = "DISTRIBUTION OF TOP 1000 PLAERS DUE TO NATIONALITY"
    data["children"] = []
    # Split dataset into Continents: thank you Dom and TA's 

    for continent in df['continent'].unique():
        
        continent_set = df[df["continent"]==continent]
        continent_dict = {}
        continent_dict["name"] = continent
        continent_dict["children"] = []
        data["children"].append(continent_dict)
        
        for country in continent_set['nationality'].unique():
            
            countries_set = continent_set[continent_set['nationality']==country][['short_name', 'overall']]
            country_dict = {}
            country_dict["name"] = country
            country_dict["children"] = []
            continent_dict['children'].append(country_dict)

            
            for player in countries_set.values:
                
                player_dict = {}
                player_dict['name'] = player[0]
                player_dict['size'] = player[1]
                country_dict["children"].append(player_dict)
    
    return jsonify(data)

# @app.route("/domdata")
# def GetParentChildData():
# # @app.route("/domdata")
# # def GetParentChildData(): 

#   # Query the database and store the result in a dataframe
#     df=pd.read_sql_query('select * from fifa_df1', con=engine)

#     data = {}
#     data["name"] = "DISTRIBUTION OF TOP 1000 PLAYERS DUE TO NATIONALITY"
#     data["children"] = []
#   # Split dataset into Continents: thank you Dom and TA's 

#     for continent in df['continent'].unique():
#         
#         continent_set = df[df["continent"]==continent]
#         continent_dict = {}
#         continent_dict["name"] = continent
#         continent_dict["children"] = []
#         data["children"].append(continent_dict)
#         
#         for country in continent_set['nationality'].unique():
#                     
#             countries_set = continent_set[continent_set['nationality']==country][['short_name', 'overall']]
#             country_dict = {}
#             country_dict["name"] = country
#             country_dict["children"] = []
#             continent_dict['children'].append(country_dict)

#             for player in countries_set.values:
#                            
#                 player_dict = {}
#                 player_dict['name'] = player[0]
#                 player_dict['size'] = player[1]
#                 country_dict["children"].append(player_dict)
#     
#     return jsonify(data)

@app.route("/compare")
def QueryCompare():
    ''' This function runs when the browser loads the index route. 
        Note that the html file must be located in a folder called templates. '''

    webpage = render_template("compare.html")
    return webpage


if __name__ == '__main__':
    app.run(debug=True)