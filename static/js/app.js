console.log("app.js loaded");

// Cache the data so we don't fetch it multiple times
var cachedData = null;

function getPlayerData(name) {
    return cachedData.filter(s => s.short_name === name)[0];
}

function DrawBargraph(name) {
    var playerData = getPlayerData(name);
    if (!playerData) return;

    var stats = [playerData.overall, playerData.pace, playerData.passing,
        playerData.physic, playerData.shooting, playerData.defending, playerData.dribbling];

    Plotly.newPlot("bar", [{
        theta: ["Overall", "Pace", "Passing", "Physic", "Shooting", "Defending", "Dribbling"],
        r: stats,
        type: "scatterpolar",
        fill: 'toself',
        marker: { color: 'rgba(31,119,180,0.8)' },
        line: { color: 'rgb(31,119,180)' }
    }], {
        polar: {
            radialaxis: { visible: true, range: [0, 100] }
        },
        title: `${playerData.short_name} — FIFA 22 Player Attributes`
    });
}

function showFifa(name) {
    var playerData = getPlayerData(name);
    if (!playerData) return;

    var attrs = [
        { label: "Overall", value: playerData.overall },
        { label: "Pace", value: playerData.pace },
        { label: "Passing", value: playerData.passing },
        { label: "Physic", value: playerData.physic },
        { label: "Shooting", value: playerData.shooting },
        { label: "Defending", value: playerData.defending },
        { label: "Dribbling", value: playerData.dribbling }
    ];

    var select = d3.select("#fifa-stats");
    select.html("");

    attrs.forEach(function(attr) {
        select.append('div')
            .style('padding', '4px 0')
            .html('<b>' + attr.label + ':</b> ' + (attr.value != null ? attr.value : 'N/A'));
        select.append('hr').style('margin', '4px 0');
    });
}

function optionChanged(newName) {
    DrawBargraph(newName);
    showFifa(newName);
}

function initDashboard() {
    console.log("initDashboard()");

    var selector = d3.select("#selDataset");
    if (selector.empty()) return;

    d3.json("/fifadata").then(data => {
        cachedData = data;

        data.forEach(function(d) {
            selector.append("option")
                .text(d.short_name)
                .property("value", d.short_name);
        });

        var firstName = data[0].short_name;
        DrawBargraph(firstName);
        showFifa(firstName);
    });
}

initDashboard();
