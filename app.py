# Import the functions we need from flask
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


if __name__ == '__main__':
    app.run(debug=True)