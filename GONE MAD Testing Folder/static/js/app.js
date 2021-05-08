console.log("app.js loaded");

function DrawBargraph(name) {
    console.log(`DrawBargraph(${name})`);

    d3.json("/fifadata").then(data => {
        // console.log(data);

        var filteredData = data.filter( s => s.short_name == name);
        var playerData = filteredData[0];


        var playerOverall = playerData.overall;
        var playerPace = playerData.pace;
        var playerPassing = playerData.passing;
        var playerPhysic = playerData.physic;
        var playerShooting = playerData.shooting;
        var playerDefending = playerData.defending;
        var playerDribbling = playerData.dribbling;

        var playerName = playerData.short_name;

        var playerStats = [playerOverall, playerPace, playerPassing, playerPhysic,
            playerShooting, playerDefending, playerDribbling];


        console.log(playerOverall, playerPace, playerPassing, playerPhysic,
            playerShooting);

        var barData = {
            theta: ["Player Overall", "Player Pace", "Player Passing", "Player Physic",
        "Player Shooting", "Player Defending", "Player Dribbling"],
            r : playerStats,
            type: "scatterpolar",
            fill: 'toself'
        }

        var barArray = [barData];

        var barLayout = {
            polar: {
                radialaxis: {
                    visible: true,
                    range: [0,100]
                }
            },
            title: `${playerName} Fifa 20' Player Attributes`
        };

        Plotly.newPlot("bar", barArray, barLayout);

    });
}

function showFifa(name) {
    // console.log(`DrawBargraph(${name})`);

    d3.json("/fifadata").then(data => {
        // console.log(data);

        var filteredData = data.filter( s => s.short_name == name);
        var playerData = filteredData[0];


        var playerOverall = playerData.overall;
        var playerPace = playerData.pace;
        var playerPassing = playerData.passing;
        var playerPhysic = playerData.physic;
        var playerShooting = playerData.shooting;
        var playerDefending = playerData.defending;
        var playerDribbling = playerData.dribbling;

        var playerName = playerData.short_name;

        var playerStats = [playerOverall, playerPace, playerPassing, playerPhysic,
            playerShooting, playerDefending, playerDribbling];


        console.log(playerOverall, playerPace, playerPassing, playerPhysic,
            playerShooting);

        var select = d3.select("#fifa-stats");

        select.html("");

        select.append('ul').text(`Player Overall: ${playerOverall}`);
        select.append('hr');
        select.append('ul').text(`Player Pace: ${playerPace}`);
        select.append('hr');
        select.append('ul').text(`Player Passing: ${playerPassing}`);
        select.append('hr');
        select.append('ul').text(`Player Physic: ${playerPhysic}`);
        select.append('hr');
        select.append('ul').text(`Player Shooting: ${playerShooting}`);
        select.append('hr');
        select.append('ul').text(`Player Defending: ${playerDefending}`);
        select.append('hr');
        select.append('ul').text(`Player Dribbling: ${playerDribbling}`);
        select.append('hr');

    });
}



function optionChanged(newName) {
    console.log(`User Selected ${newName}`);

    DrawBargraph(newName);
    showFifa(newName);

}

function initDashboard() {
    console.log("initDashboard()");

    //populate the dropdown
    var selector = d3.select("#selDataset");

    // comes from office hours with Dom
    d3.json("/fifadata").then(data => {
        // console.log(data);

        var playerName = data.map(function(d) {return d.short_name;});


        for (var i = 0; i < data.length; i++){

            var name = data[i].short_name;

            selector.append("option")
            .text(name)
            .property("value", name);

        };

        var id = playerName[0];

        console.log(id);

        // // // Draw the graphs and the metadata
        DrawBargraph(id);
        showFifa(id);


    });
};

initDashboard();

