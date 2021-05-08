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