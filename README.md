# Fifa_Player_Visualization_Project2
Using the Fifa 20 complete player dataset, our purose was to create a user driven, interactive dashboard which showcases various player information from both their real lives and the Fifa 20 videogame.

## Getting Started 

1. Create a new repository and title it as you please. Our repository is titled "Fifa_Player_Visualization_Project2".

1. Clone the new repository to your computer.

1. This project utilizes Python, SQL, html, Javascript and CSS. Therefore you will need Pandas, .JS and .HTML files to run the analysis.

1. Push the above changes to GitHub or GitLab.

## Creating the Database
For this project we utilized PgAdmin to store our database and generate our table. To create this database we had to utilize our ETL skills. These are the steps for creating the database, creating the table and loading it with our Fifa 20 data set:

1. Create a Jupyter notebook file which will be used to extract the data that we would like to use to load our data into ourdatabase. Below is an image of the columns that we extracted from our dataset and in turn used to create a table in our database:

    ![Screenshot 2021-05-07 164932](https://user-images.githubusercontent.com/75814760/117511962-484c3680-af54-11eb-8d5f-1974534997bc.jpg)

1. We also included a column "Continent" that was not in the original Fifa20 dataset.

1. Once the dataframe has been scrubbed to show only the columns above and we have removed all NaN values, we will begin the load process. This is done by creating a connection to the database. We labeled our database fifa_df1.

1. After the connection is made a file named "fifa_storage.py" for storing the database username and database password will need to be created. This file will be located at the same level as the jupyter notebook file. It should resemble this:

    ![Screenshot 2021-05-07 170744](https://user-images.githubusercontent.com/75814760/117513167-cad5f580-af56-11eb-957e-98346eb19f2b.jpg)

1. Open PgAdmin and create a database titled "fifa_df1". Leave the Jupyter Notebook open as we will use this to push the data into our table and then read the database to verify that the data was loaded correctly.

1. Open a Query Tool and create  a table titled "fifa_df1" and create column labels of the variables shown above. Use the "sofifa_id" column for our primary key. Create the table and then as an option you can run "select * from fifa_df1;" to verify that the table was created correctly.

1. Navigate back to your Jupyter Notebook and with the connection established run a "dataframe.to_sql" to push the dataframe to our database.

1. Run a "pd.read_sql_query" to verify that the dataframe was successfully pushed to the database.

1. If no errors return you can navigate back to PgAdmin and in your Query Tool run "select * from fifa_df1" and your Data Output will resemble this:

    ![Screenshot 2021-05-07 172131](https://user-images.githubusercontent.com/75814760/117514105-b98de880-af58-11eb-910f-485fc844120f.jpg)


## Dataset

* [Fifa 20 Dataset](https://github.com/jagnoor/Fifa_Player_Visualization_Project2/blob/main/rachel/players_20.csv)

## Built With

* Pandas
* PgAdmin
* Visual Studio Code

## Languages

* Python
* Sql
* Javascript
* Javascript (D3)
* HTML
* CSS

## Author(s)

* Rachel Kerr
* Jagnoor Singh
* Chris Pope

## Contact:

__Email:__ popex107@umn.edu

