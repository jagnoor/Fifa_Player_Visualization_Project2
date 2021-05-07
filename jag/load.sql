drop table if exists fifa_df1;

create table fifa_df1 (
    sofifa_id int primary key,
    player_url varchar(1000),
    short_name varchar(200),
    age int,
    nationality varchar(200),
    club varchar(200),
    overall int,
    wage_eur int,
    player_positions varchar(200),
    pace int,
    shooting int,
    passing int,
    dribbling int,
    defending int,
    physic int,
    Continent varchar(200)
    );
    
select * from fifa_df1;


drop table if exists fifa_dfD3;

create table fifa_dfD3 (
    sofifa_id int primary key,
    short_name varchar(200),
	age int,
	player_url varchar(1000),
    nationality varchar(200),
    overall int,
	potential int,
    club varchar(200),
	value_eur int,
    wage_eur int,
    player_positions varchar(200)

    );
    
select * from fifa_dfD3;


drop table if exists fifa_dfTop1000;

create table fifa_dfTop1000 (
    sofifa_id int primary key,
    short_name varchar(200),
    nationality varchar(200),
    Continent varchar(200),
    overall int,
    club varchar(200)

    );
    
select * from fifa_dfTop1000;


drop table if exists player_value;

create table player_value (
    sofifa_id int primary key,
    short_name varchar(200),
	overall int,
    PotentialPoints int,
	ValueNum int,
	age int
 
    );
    
select * from player_value;
