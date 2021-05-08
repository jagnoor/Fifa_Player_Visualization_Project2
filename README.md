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

## Summary
There are three tabs that we created for this project. There is a Home page, a Comparison page and an About page. Here is a brief summary about each page.

### Home
We created this page to show a few visuals of Fifa players that played during the 2019 season. Those visuals include:

1. A d3 circle graph which shows the top 2,000 Fifa players. We visualized this by creating one large circle graph which has 7 interior graphs for each continent. Inside of each continent are the countries that each player in the top 2,000 was born in and within each country are those players.

1. A horizontal bar graph of the count of the top 5 countries that have produced the most Fifa players.

1. A bar graph of the top 11 highest Fifa earns by wage in Euros.

1. A bar graph of Fifa Athletes by Age by Count

1. A pie chart of the clubs with the most players in the top 30.

![Screenshot 2021-05-08 153006](https://user-images.githubusercontent.com/75814760/117552657-5f515e00-b012-11eb-8fd4-2bc9a299b9d2.jpg)

### Comparison
This page was created to show the comparison of each Fifa players Fifa 20 attributes. There is a drop down cell that allows you to select each individual player and once selected a spider chart populates showing these attributes. There is also a table which populates showing the actual value of each individual attribute. Below these visuals is a summary of what each attribute means.

![Screenshot 2021-05-08 153453](https://user-images.githubusercontent.com/75814760/117552754-fae2ce80-b012-11eb-94e9-033f585cba95.jpg)

### About
Lastly this page was used to convey our purpose of the project and provide a brief summary of each page. Similarly to what was done above.

![Screenshot 2021-05-08 154006](https://user-images.githubusercontent.com/75814760/117552883-b441a400-b013-11eb-9773-d166dc277c22.jpg)

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

