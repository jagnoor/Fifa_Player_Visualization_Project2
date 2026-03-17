console.log("visualizations.js loaded");

// Shared tooltip
var tooltip = d3.select("#viz-tooltip");

function showTip(event, html) {
    tooltip.html(html)
        .style("opacity", 1)
        .style("left", (event.pageX + 14) + "px")
        .style("top", (event.pageY - 14) + "px");
}
function moveTip(event) {
    tooltip.style("left", (event.pageX + 14) + "px")
        .style("top", (event.pageY - 14) + "px");
}
function hideTip() {
    tooltip.style("opacity", 0);
}

// Color palette for continents
var continentColors = {
    "Europe": "#4fc3f7",
    "South America": "#66bb6a",
    "Asia": "#ffa726",
    "Africa": "#ef5350",
    "North America": "#ab47bc",
    "Oceania": "#26c6da"
};

function contColor(c) { return continentColors[c] || "#999"; }


// =============================================================================
// VIZ 1: Force-Directed Network Graph
// =============================================================================

var networkData = null;
var networkSim = null;
var networkLinkType = "all";

d3.json("data/top-players-network.json").then(function(data) {
    networkData = data;

    var width = 900, height = 650;
    var svg = d3.select("#network-chart").append("svg")
        .attr("width", width).attr("height", height)
        .attr("viewBox", [0, 0, width, height]);

    var link = svg.append("g").selectAll("line")
        .data(data.links)
        .join("line")
        .attr("class", d => "link-" + d.type)
        .attr("stroke-width", 1.5);

    var node = svg.append("g").selectAll("circle")
        .data(data.nodes)
        .join("circle")
        .attr("r", d => 4 + (d.overall - 80) * 1.5)
        .attr("fill", d => contColor(d.continent))
        .attr("stroke", "#fff")
        .attr("stroke-width", 1)
        .style("cursor", "grab")
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    var labels = svg.append("g").selectAll("text")
        .data(data.nodes)
        .join("text")
        .text(d => d.id)
        .attr("font-size", d => d.overall >= 88 ? 11 : 9)
        .attr("fill", "#ddd")
        .attr("text-anchor", "middle")
        .attr("dy", d => -(6 + (d.overall - 80) * 1.5))
        .style("pointer-events", "none");

    node.on("mouseover", function(event, d) {
        d3.select(this).attr("stroke-width", 3).attr("stroke", "#00d4ff");
        // Highlight connected links
        link.style("opacity", l => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.1);
        showTip(event, `<b>${d.id}</b><br>Overall: ${d.overall}<br>Club: ${d.club}<br>Nation: ${d.nationality}<br>Wage: €${d.wage.toLocaleString()}/wk<br>Age: ${d.age}`);
    }).on("mousemove", moveTip)
    .on("mouseout", function() {
        d3.select(this).attr("stroke-width", 1).attr("stroke", "#fff");
        link.style("opacity", 1);
        hideTip();
    });

    networkSim = d3.forceSimulation(data.nodes)
        .force("link", d3.forceLink(data.links).id(d => d.id).distance(60))
        .force("charge", d3.forceManyBody().strength(-120))
        .force("center", d3.forceCenter(width / 2, height / 2))
        .force("collision", d3.forceCollide().radius(d => 8 + (d.overall - 80) * 1.5))
        .on("tick", function() {
            link.attr("x1", d => d.source.x).attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
            node.attr("cx", d => d.x = Math.max(20, Math.min(width - 20, d.x)))
                .attr("cy", d => d.y = Math.max(20, Math.min(height - 20, d.y)));
            labels.attr("x", d => d.x).attr("y", d => d.y);
        });

    function dragstarted(event) {
        if (!event.active) networkSim.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    function dragended(event) {
        if (!event.active) networkSim.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }

    // Store references for filter
    window._networkLink = link;
});

function filterNetwork(type) {
    networkLinkType = type;
    document.querySelectorAll("#section-network .filter-controls button").forEach(b => b.classList.remove("active"));
    document.getElementById("net-" + (type === "nationality" ? "nat" : type)).classList.add("active");
    if (window._networkLink) {
        window._networkLink.style("display", function(d) {
            if (type === "all") return "block";
            return d.type === type ? "block" : "none";
        });
    }
}


// =============================================================================
// VIZ 2: Zoomable Treemap
// =============================================================================

d3.json("data/club-treemap.json").then(function(data) {
    var width = 900, height = 550;

    var svg = d3.select("#treemap-chart").append("svg")
        .attr("width", width).attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .style("font", "12px sans-serif");

    var colorScale = d3.scaleSequential(d3.interpolateYlGnBu).domain([60, 90]);

    var root = d3.hierarchy(data)
        .sum(d => d.value || 0)
        .sort((a, b) => b.value - a.value);

    var treemap = d3.treemap()
        .size([width, height])
        .paddingOuter(4)
        .paddingTop(22)
        .paddingInner(2)
        .round(true);

    treemap(root);

    var currentRoot = root;

    var cell = svg.selectAll("g")
        .data(root.descendants())
        .join("g")
        .attr("transform", d => `translate(${d.x0},${d.y0})`);

    cell.append("rect")
        .attr("width", d => Math.max(0, d.x1 - d.x0))
        .attr("height", d => Math.max(0, d.y1 - d.y0))
        .attr("fill", d => {
            if (d.depth === 0) return "#1a1a2e";
            if (d.depth === 1) return contColor(d.data.name);
            return colorScale(d.data.avg_overall || 70);
        })
        .attr("fill-opacity", d => d.depth === 1 ? 0.4 : 0.85)
        .attr("stroke", "rgba(255,255,255,0.2)")
        .attr("rx", 3)
        .style("cursor", d => d.children ? "pointer" : "default")
        .on("click", function(event, d) {
            if (d.children) zoomTreemap(d);
        })
        .on("mouseover", function(event, d) {
            if (d.depth >= 2) {
                d3.select(this).attr("stroke", "#00d4ff").attr("stroke-width", 2);
                showTip(event, `<b>${d.data.name}</b><br>Top Players: ${d.data.value}<br>Avg Overall: ${d.data.avg_overall}`);
            } else if (d.depth === 1) {
                showTip(event, `<b>${d.data.name}</b><br>Total Top Players: ${d.value}`);
            }
        })
        .on("mousemove", moveTip)
        .on("mouseout", function() {
            d3.select(this).attr("stroke", "rgba(255,255,255,0.2)").attr("stroke-width", 1);
            hideTip();
        });

    cell.append("text")
        .attr("x", 4).attr("y", 15)
        .text(d => {
            var w = d.x1 - d.x0;
            if (w < 40) return "";
            var name = d.data.name;
            if (name.length > w / 7) name = name.substring(0, Math.floor(w / 7)) + "…";
            return name;
        })
        .attr("fill", d => d.depth <= 1 ? "#fff" : "#111")
        .attr("font-weight", d => d.depth <= 1 ? "bold" : "normal")
        .attr("font-size", d => d.depth <= 1 ? "13px" : "11px")
        .style("pointer-events", "none");

    function zoomTreemap(d) {
        treemap(d);
        cell.data(d.descendants())
            .transition().duration(500)
            .attr("transform", dd => `translate(${dd.x0},${dd.y0})`)
            .select("rect")
            .attr("width", dd => Math.max(0, dd.x1 - dd.x0))
            .attr("height", dd => Math.max(0, dd.y1 - dd.y0));

        d3.select("#treemap-breadcrumb").html(
            d === root ? "" :
            '<span style="cursor:pointer;color:#00d4ff" onclick="document.querySelector(\'#treemap-chart svg\').dispatchEvent(new Event(\'reset\'))">← Back to All</span> &raquo; <b>' + d.data.name + '</b>'
        );
        currentRoot = d;
    }

    svg.on("reset", function() {
        treemap(root);
        cell.data(root.descendants())
            .transition().duration(500)
            .attr("transform", dd => `translate(${dd.x0},${dd.y0})`)
            .select("rect")
            .attr("width", dd => Math.max(0, dd.x1 - dd.x0))
            .attr("height", dd => Math.max(0, dd.y1 - dd.y0));
        d3.select("#treemap-breadcrumb").html("");
        currentRoot = root;
    });
});


// =============================================================================
// VIZ 3: Scatter Plot with Brush Selection
// =============================================================================

var scatterData = null;

d3.json("data/wage-overall.json").then(function(data) {
    scatterData = data;

    // Populate continent filter
    var continents = [...new Set(data.map(d => d.continent))].sort();
    var sel = d3.select("#scatter-continent");
    continents.forEach(c => sel.append("option").attr("value", c).text(c));

    // Stats cards
    updateScatterStats(data);
    drawScatter(data);
});

function updateScatterStats(data) {
    var avgOverall = d3.mean(data, d => d.overall).toFixed(1);
    var avgWage = d3.mean(data, d => d.wage_eur).toFixed(0);
    var maxWage = d3.max(data, d => d.wage_eur);
    var topPlayer = data.find(d => d.wage_eur === maxWage);

    d3.select("#scatter-stats").html(
        `<div class="col-3"><div class="stats-card"><div class="value">${data.length}</div><div class="label">Players</div></div></div>` +
        `<div class="col-3"><div class="stats-card"><div class="value">${avgOverall}</div><div class="label">Avg Overall</div></div></div>` +
        `<div class="col-3"><div class="stats-card"><div class="value">€${parseInt(avgWage).toLocaleString()}</div><div class="label">Avg Weekly Wage</div></div></div>` +
        `<div class="col-3"><div class="stats-card"><div class="value">${topPlayer ? topPlayer.short_name : 'N/A'}</div><div class="label">Highest Paid</div></div></div>`
    );
}

function drawScatter(data) {
    d3.select("#scatter-chart").select("svg").remove();

    var margin = {top: 20, right: 30, bottom: 50, left: 80};
    var width = 880 - margin.left - margin.right;
    var height = 480 - margin.top - margin.bottom;

    var svg = d3.select("#scatter-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom]);

    var g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    var x = d3.scaleLinear().domain([d3.min(data, d => d.overall) - 1, d3.max(data, d => d.overall) + 1]).range([0, width]);
    var y = d3.scaleLinear().domain([0, d3.max(data, d => d.wage_eur) * 1.1]).range([height, 0]);

    // Grid
    g.append("g").attr("class", "grid")
        .call(d3.axisLeft(y).tickSize(-width).tickFormat(""))
        .selectAll("line").attr("stroke", "rgba(255,255,255,0.08)");
    g.selectAll(".grid .domain").remove();

    // Axes
    g.append("g").attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")))
        .selectAll("text, line, path").attr("stroke", "#888").attr("fill", "#888");

    g.append("g")
        .call(d3.axisLeft(y).tickFormat(d => "€" + d3.format(",.0f")(d)))
        .selectAll("text, line, path").attr("stroke", "#888").attr("fill", "#888");

    // Axis labels
    g.append("text").attr("x", width / 2).attr("y", height + 42)
        .attr("text-anchor", "middle").attr("fill", "#aaa").attr("font-size", 13).text("Overall Rating");
    g.append("text").attr("transform", "rotate(-90)").attr("y", -65).attr("x", -height / 2)
        .attr("text-anchor", "middle").attr("fill", "#aaa").attr("font-size", 13).text("Weekly Wage (EUR)");

    // Dots
    var dots = g.selectAll("circle")
        .data(data)
        .join("circle")
        .attr("cx", d => x(d.overall))
        .attr("cy", d => y(d.wage_eur))
        .attr("r", 5)
        .attr("fill", d => contColor(d.continent))
        .attr("fill-opacity", 0.7)
        .attr("stroke", "rgba(255,255,255,0.3)")
        .attr("stroke-width", 0.5);

    dots.on("mouseover", function(event, d) {
        d3.select(this).attr("r", 9).attr("stroke", "#fff").attr("stroke-width", 2);
        showTip(event, `<b>${d.short_name}</b><br>Overall: ${d.overall}<br>Wage: €${d.wage_eur.toLocaleString()}/wk<br>Club: ${d.club}<br>Age: ${d.age}<br>Continent: ${d.continent}`);
    }).on("mousemove", moveTip)
    .on("mouseout", function() {
        d3.select(this).attr("r", 5).attr("stroke", "rgba(255,255,255,0.3)").attr("stroke-width", 0.5);
        hideTip();
    });

    // Brush
    var brush = d3.brush()
        .extent([[0, 0], [width, height]])
        .on("end", function(event) {
            if (!event.selection) {
                d3.select("#scatter-selection").html("");
                dots.attr("fill-opacity", 0.7).attr("r", 5);
                return;
            }
            var [[x0, y0], [x1, y1]] = event.selection;
            var selected = data.filter(d =>
                x(d.overall) >= x0 && x(d.overall) <= x1 &&
                y(d.wage_eur) >= y0 && y(d.wage_eur) <= y1
            );
            dots.attr("fill-opacity", d =>
                selected.includes(d) ? 1 : 0.1
            ).attr("r", d => selected.includes(d) ? 7 : 3);

            var html = `<b>${selected.length} players selected:</b> ` +
                selected.slice(0, 15).map(d => d.short_name).join(", ") +
                (selected.length > 15 ? ` ... and ${selected.length - 15} more` : "");
            d3.select("#scatter-selection").html(html);
        });

    g.append("g").attr("class", "brush").call(brush);

    // Legend
    var legend = svg.append("g").attr("transform", `translate(${margin.left + 10}, ${margin.top + 10})`);
    var continents = [...new Set(data.map(d => d.continent))].sort();
    continents.forEach((c, i) => {
        var lg = legend.append("g").attr("transform", `translate(${i * 130}, 0)`);
        lg.append("circle").attr("r", 5).attr("fill", contColor(c));
        lg.append("text").attr("x", 10).attr("y", 4).text(c).attr("fill", "#ccc").attr("font-size", 11);
    });
}

function updateScatter() {
    var continent = document.getElementById("scatter-continent").value;
    var filtered = continent === "all" ? scatterData : scatterData.filter(d => d.continent === continent);
    updateScatterStats(filtered);
    drawScatter(filtered);
}


// =============================================================================
// VIZ 4: Stacked Area Chart — Positions by Age
// =============================================================================

d3.json("data/position-age.json").then(function(data) {
    var margin = {top: 30, right: 100, bottom: 50, left: 60};
    var width = 880 - margin.left - margin.right;
    var height = 420 - margin.top - margin.bottom;

    var svg = d3.select("#area-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom]);

    var g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    var keys = ["GK", "DEF", "MID", "FWD"];
    var colorMap = { "GK": "#ffa726", "DEF": "#42a5f5", "MID": "#66bb6a", "FWD": "#ef5350" };

    var stack = d3.stack().keys(keys);
    var series = stack(data);

    var x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.age))
        .range([0, width]);

    var y = d3.scaleLinear()
        .domain([0, d3.max(series, s => d3.max(s, d => d[1]))])
        .range([height, 0]);

    var area = d3.area()
        .x(d => x(d.data.age))
        .y0(d => y(d[0]))
        .y1(d => y(d[1]))
        .curve(d3.curveBasis);

    // Areas
    g.selectAll(".area-layer")
        .data(series)
        .join("path")
        .attr("class", "area-layer")
        .attr("d", area)
        .attr("fill", d => colorMap[d.key])
        .attr("fill-opacity", 0.75)
        .attr("stroke", d => colorMap[d.key])
        .attr("stroke-width", 1)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill-opacity", 1);
        })
        .on("mouseout", function() {
            d3.select(this).attr("fill-opacity", 0.75);
            hideTip();
        });

    // Hover line
    var hoverLine = g.append("line")
        .attr("stroke", "#fff").attr("stroke-width", 1)
        .attr("stroke-dasharray", "4,4")
        .style("opacity", 0);

    var hoverRect = g.append("rect")
        .attr("width", width).attr("height", height)
        .attr("fill", "transparent")
        .on("mousemove", function(event) {
            var [mx] = d3.pointer(event);
            var ageVal = Math.round(x.invert(mx));
            var row = data.find(d => d.age === ageVal);
            if (!row) return;
            hoverLine.attr("x1", x(ageVal)).attr("x2", x(ageVal))
                .attr("y1", 0).attr("y2", height).style("opacity", 1);
            var total = keys.reduce((s, k) => s + row[k], 0);
            showTip(event, `<b>Age ${ageVal}</b><br>FWD: ${row.FWD}<br>MID: ${row.MID}<br>DEF: ${row.DEF}<br>GK: ${row.GK}<br><b>Total: ${total}</b>`);
        })
        .on("mouseout", function() { hoverLine.style("opacity", 0); hideTip(); });

    // Axes
    g.append("g").attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")))
        .selectAll("text, line, path").attr("stroke", "#888").attr("fill", "#888");
    g.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text, line, path").attr("stroke", "#888").attr("fill", "#888");

    g.append("text").attr("x", width / 2).attr("y", height + 42)
        .attr("text-anchor", "middle").attr("fill", "#aaa").attr("font-size", 13).text("Age");
    g.append("text").attr("transform", "rotate(-90)").attr("y", -45).attr("x", -height / 2)
        .attr("text-anchor", "middle").attr("fill", "#aaa").attr("font-size", 13).text("Number of Players");

    // Legend
    var legend = g.append("g").attr("transform", `translate(${width + 10}, 20)`);
    keys.slice().reverse().forEach((k, i) => {
        var lg = legend.append("g").attr("transform", `translate(0, ${i * 24})`);
        lg.append("rect").attr("width", 16).attr("height", 16).attr("fill", colorMap[k]).attr("rx", 3);
        lg.append("text").attr("x", 22).attr("y", 13).text(k).attr("fill", "#ccc").attr("font-size", 13);
    });
});


// =============================================================================
// VIZ 5: Chord Diagram — Position Co-occurrence
// =============================================================================

d3.json("data/position-chord.json").then(function(data) {
    var width = 700, height = 700;
    var outerRadius = Math.min(width, height) * 0.5 - 60;
    var innerRadius = outerRadius - 25;

    var svg = d3.select("#chord-chart").append("svg")
        .attr("width", width).attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

    var posColors = d3.scaleOrdinal()
        .domain(data.labels)
        .range(["#ffa726", "#5c6bc0", "#42a5f5", "#29b6f6", "#26a69a", "#66bb6a", "#9ccc65",
                 "#d4e157", "#ffca28", "#ef5350", "#ec407a", "#ff7043", "#8d6e63"]);

    var chord = d3.chord()
        .padAngle(0.04)
        .sortSubgroups(d3.descending);

    var chords = chord(data.matrix);

    var arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
    var ribbon = d3.ribbon().radius(innerRadius);

    // Arcs
    var group = svg.append("g")
        .selectAll("g")
        .data(chords.groups)
        .join("g");

    group.append("path")
        .attr("d", arc)
        .attr("fill", d => posColors(data.labels[d.index]))
        .attr("stroke", "rgba(255,255,255,0.2)")
        .on("mouseover", function(event, d) {
            // Fade non-connected ribbons
            svg.selectAll(".chord-ribbon")
                .attr("fill-opacity", r => (r.source.index === d.index || r.target.index === d.index) ? 0.85 : 0.05);
            var total = d3.sum(data.matrix[d.index]);
            showTip(event, `<b>${data.labels[d.index]}</b><br>Total co-occurrences: ${total}`);
        })
        .on("mousemove", moveTip)
        .on("mouseout", function() {
            svg.selectAll(".chord-ribbon").attr("fill-opacity", 0.65);
            hideTip();
        });

    group.append("text")
        .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
        .attr("dy", "0.35em")
        .attr("class", "chord-group")
        .attr("transform", d => `rotate(${(d.angle * 180 / Math.PI - 90)}) translate(${outerRadius + 14})${d.angle > Math.PI ? " rotate(180)" : ""}`)
        .attr("text-anchor", d => d.angle > Math.PI ? "end" : null)
        .text(d => data.labels[d.index]);

    // Ribbons
    svg.append("g")
        .selectAll("path")
        .data(chords)
        .join("path")
        .attr("class", "chord-ribbon")
        .attr("d", ribbon)
        .attr("fill", d => posColors(data.labels[d.source.index]))
        .attr("fill-opacity", 0.65)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("fill-opacity", 0.95);
            showTip(event, `<b>${data.labels[d.source.index]} ↔ ${data.labels[d.target.index]}</b><br>Players with both: ${d.source.value}`);
        })
        .on("mousemove", moveTip)
        .on("mouseout", function() {
            d3.select(this).attr("fill-opacity", 0.65);
            hideTip();
        });
});


// =============================================================================
// VIZ 6: Radial/Radar Comparison by Continent
// =============================================================================

d3.json("data/continent-summary.json").then(function(data) {
    var width = 600, height = 600;
    var radius = 220;

    var svg = d3.select("#radial-chart").append("svg")
        .attr("width", width).attr("height", height)
        .attr("viewBox", [-width / 2, -height / 2, width, height]);

    var attrs = ["avg_pace", "avg_shooting", "avg_passing", "avg_dribbling", "avg_defending", "avg_physic"];
    var attrLabels = ["Pace", "Shooting", "Passing", "Dribbling", "Defending", "Physic"];
    var angleSlice = Math.PI * 2 / attrs.length;

    // Scale: all attributes are out of 100
    var rScale = d3.scaleLinear().domain([0, 80]).range([0, radius]);

    // Grid circles
    var levels = [20, 40, 60, 80];
    levels.forEach(l => {
        svg.append("circle")
            .attr("r", rScale(l))
            .attr("fill", "none")
            .attr("stroke", "rgba(255,255,255,0.1)")
            .attr("stroke-dasharray", "3,3");
        svg.append("text")
            .attr("x", 4).attr("y", -rScale(l))
            .attr("fill", "rgba(255,255,255,0.3)").attr("font-size", 10)
            .text(l);
    });

    // Axis lines + labels
    attrs.forEach((_, i) => {
        var angle = angleSlice * i - Math.PI / 2;
        svg.append("line")
            .attr("x1", 0).attr("y1", 0)
            .attr("x2", radius * Math.cos(angle))
            .attr("y2", radius * Math.sin(angle))
            .attr("stroke", "rgba(255,255,255,0.15)");
        svg.append("text")
            .attr("x", (radius + 24) * Math.cos(angle))
            .attr("y", (radius + 24) * Math.sin(angle))
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "middle")
            .attr("fill", "#ccc").attr("font-size", 13)
            .text(attrLabels[i]);
    });

    var line = d3.lineRadial()
        .radius(d => rScale(d.value))
        .angle((d, i) => i * angleSlice)
        .curve(d3.curveLinearClosed);

    var activeSet = new Set(data.map(d => d.continent));

    // Draw one polygon per continent
    var polygons = {};
    var dots = {};
    data.forEach(continent => {
        var values = attrs.map(a => ({ value: continent[a] }));
        var c = contColor(continent.continent);

        polygons[continent.continent] = svg.append("path")
            .datum(values)
            .attr("d", line)
            .attr("fill", c)
            .attr("fill-opacity", 0.12)
            .attr("stroke", c)
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.8);

        // Dots at each vertex
        dots[continent.continent] = svg.selectAll(null)
            .data(values)
            .join("circle")
            .attr("cx", (d, i) => rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2))
            .attr("cy", (d, i) => rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2))
            .attr("r", 4)
            .attr("fill", c)
            .attr("stroke", "#fff")
            .attr("stroke-width", 1)
            .on("mouseover", function(event, d) {
                showTip(event, `<b>${continent.continent}</b><br>${attrLabels[values.indexOf(d)]}: ${d.value.toFixed(1)}`);
            })
            .on("mousemove", moveTip)
            .on("mouseout", hideTip);
    });

    // Legend with toggle
    var legendDiv = d3.select("#radial-legend");
    data.forEach(continent => {
        var item = legendDiv.append("span").attr("class", "legend-item").style("cursor", "pointer");
        item.append("span").attr("class", "legend-dot").style("background", contColor(continent.continent));
        item.append("span").text(`${continent.continent} (${continent.count})`);

        item.on("click", function() {
            var c = continent.continent;
            if (activeSet.has(c)) {
                activeSet.delete(c);
                polygons[c].style("display", "none");
                dots[c].style("display", "none");
                d3.select(this).style("opacity", 0.3);
            } else {
                activeSet.add(c);
                polygons[c].style("display", null);
                dots[c].style("display", null);
                d3.select(this).style("opacity", 1);
            }
        });
    });
});


// =============================================================================
// VIZ 7: Bee Swarm / Strip Plot — Attribute Distribution
// =============================================================================

var swarmRawData = null;
var currentSwarmAttr = "pace";

d3.json("data/attribute-distribution.json").then(function(data) {
    swarmRawData = data;

    // Buttons for attribute selection
    var attrs = ["pace", "shooting", "passing", "dribbling", "defending", "physic"];
    var btnContainer = d3.select("#swarm-buttons");
    attrs.forEach(a => {
        btnContainer.append("button")
            .attr("id", "swarm-btn-" + a)
            .attr("class", a === currentSwarmAttr ? "active" : "")
            .text(a.charAt(0).toUpperCase() + a.slice(1))
            .on("click", function() {
                currentSwarmAttr = a;
                btnContainer.selectAll("button").classed("active", false);
                d3.select(this).classed("active", true);
                drawSwarm(a);
            });
    });

    drawSwarm(currentSwarmAttr);
});

function drawSwarm(attr) {
    d3.select("#swarm-chart").select("svg").remove();

    var filtered = swarmRawData.filter(d => d.attribute === attr);

    var margin = {top: 30, right: 30, bottom: 50, left: 120};
    var width = 880 - margin.left - margin.right;
    var height = 400 - margin.top - margin.bottom;

    var svg = d3.select("#swarm-chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .attr("viewBox", [0, 0, width + margin.left + margin.right, height + margin.top + margin.bottom]);

    var g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    var continents = [...new Set(filtered.map(d => d.continent))].sort();

    var x = d3.scaleLinear().domain([20, 100]).range([0, width]);
    var y = d3.scaleBand().domain(continents).range([0, height]).padding(0.3);

    // Grid
    g.append("g").attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
        .selectAll("text, line, path").attr("stroke", "#888").attr("fill", "#888");
    g.append("g")
        .call(d3.axisLeft(y))
        .selectAll("text").attr("fill", d => contColor(d)).attr("font-size", 13).attr("font-weight", "bold");
    g.selectAll(".domain, .tick line").attr("stroke", "#444");

    g.append("text").attr("x", width / 2).attr("y", height + 42)
        .attr("text-anchor", "middle").attr("fill", "#aaa").attr("font-size", 13)
        .text(attr.charAt(0).toUpperCase() + attr.slice(1) + " Rating");

    // Jittered dots
    g.selectAll("circle")
        .data(filtered)
        .join("circle")
        .attr("cx", d => x(d.value))
        .attr("cy", d => y(d.continent) + y.bandwidth() / 2 + (Math.random() - 0.5) * y.bandwidth() * 0.8)
        .attr("r", 2.5)
        .attr("fill", d => contColor(d.continent))
        .attr("fill-opacity", 0.5)
        .on("mouseover", function(event, d) {
            d3.select(this).attr("r", 6).attr("fill-opacity", 1).attr("stroke", "#fff").attr("stroke-width", 2);
            showTip(event, `<b>${d.continent}</b><br>${attr}: ${d.value}`);
        })
        .on("mousemove", moveTip)
        .on("mouseout", function() {
            d3.select(this).attr("r", 2.5).attr("fill-opacity", 0.5).attr("stroke", "none");
            hideTip();
        });

    // Median lines
    continents.forEach(c => {
        var vals = filtered.filter(d => d.continent === c).map(d => d.value);
        var median = d3.median(vals);
        var q1 = d3.quantile(vals.sort(d3.ascending), 0.25);
        var q3 = d3.quantile(vals.sort(d3.ascending), 0.75);

        // IQR box
        g.append("rect")
            .attr("x", x(q1)).attr("y", y(c) + y.bandwidth() * 0.15)
            .attr("width", x(q3) - x(q1))
            .attr("height", y.bandwidth() * 0.7)
            .attr("fill", "none")
            .attr("stroke", contColor(c))
            .attr("stroke-width", 1.5)
            .attr("stroke-opacity", 0.6)
            .attr("rx", 3);

        // Median line
        g.append("line")
            .attr("x1", x(median)).attr("x2", x(median))
            .attr("y1", y(c) + y.bandwidth() * 0.1)
            .attr("y2", y(c) + y.bandwidth() * 0.9)
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .attr("stroke-opacity", 0.8);
    });
}
