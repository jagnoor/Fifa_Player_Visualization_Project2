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

var trace1 = {
    x: ["beer", "wine", "martini", "margarita",
      "ice tea", "rum & coke", "mai tai", "gin & tonic"],
    y: [22.7, 17.1, 9.9, 8.7, 7.2, 6.1, 6.0, 4.6],
    type: "bar"
  };

  var trace2 = {
    x: ["beer", "wine", "martini", "margarita",
      "ice tea", "rum & coke", "mai tai", "gin & tonic"],
    y: [2.7, 7.1, 99.9, 108.7, 7.2, 6.1, 56.0, 44.6],
    type: "new bar"
  };
  
  var trace3 = {
    x: ["beer", "wine", "martini", "margarita",
      "ice tea", "rum & coke", "mai tai", "gin & tonic"],
    y: [122.7, 0.1, 9.9, 58.7, 55.2, 6.1, 56.0, 44.6],
    type: "bar"
  };
  

  var data = [trace1];

  var dataNew = [trace2];

  var dataNewNew = [trace3];
  
  var layout = {
    title: "'Bar' Chart"
  };
  
  var layoutNew = {
    title: "Scatter Chart"
  };

  Plotly.newPlot("new-plot", data, layout);

  Plotly.newPlot("plot-bar", dataNew, layoutNew);

  Plotly.newPlot("plot-b", dataNewNew, layout);

  Plotly.newPlot("plot-c", dataNewNew, layout);

