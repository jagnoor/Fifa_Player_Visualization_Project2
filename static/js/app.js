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

        var playerName = playerData.short_name;

        var playerStats = [playerOverall, playerPace, playerPassing, playerPhysic,
            playerShooting];


        console.log(playerOverall, playerPace, playerPassing, playerPhysic,
            playerShooting);

        var barData = {
            x: ["Player Overall", "Player Pace", "Player Passing", "Player Physic",
        "Player Shooting"],
            y: playerStats,
            type: "bar",
        }

        var barArray = [barData];

        var barLayout = {
            title: `${playerName} Fifa 20' Player Attributes`
        };

        Plotly.newPlot("bar", barArray, barLayout);

    });
}

function optionChanged(newName) {
    console.log(`User Selected ${newName}`);

    DrawBargraph(newName);

}

// function initDashboard() {
//     console.log("initDashboard()");

//     //populate the dropdown
//     var selector = d3.select("#selDataset");

//     // comes from office hours with Dom
//     d3.csv("/rachel/clean.csv").then(data => {
//         // console.log(data);

//         var playerName = data.map(function(d) {return d.short_name;});



//         for (var i = 0; i < data.length; i++){

//             var name = data[i].short_name;

//             selector.append("option")
//             .text(name)
//             .property("value", name);

//         };

//         var id = playerName[0];

//         console.log(id);

//         // // Draw the graphs and the metadata
//         DrawBargraph(id);
//         // DrawBubblechart(id);
//         // ShowMetadata(id);
//         // washData(id);


//     });

//     //updated the bargraph
//     //update the bubblechart
//     //updated the demographic information
// };

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


    });
};

initDashboard();