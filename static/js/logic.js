console.log("logic.js loaded");

// Fetch data once and build all charts
d3.json("/fifadata").then(data => {

    // =========================================================================
    // 1. Top Earners Bar Chart (dynamic)
    // =========================================================================
    var sortedByWage = data.slice().sort((a, b) => b.wage_eur - a.wage_eur);
    var topEarners = sortedByWage.slice(0, 15);

    Plotly.newPlot("high-earn", [{
        x: topEarners.map(d => d.short_name),
        y: topEarners.map(d => d.wage_eur),
        type: "bar",
        marker: { color: topEarners.map((_, i) => `hsl(${200 + i * 8}, 70%, ${45 + i * 2}%)`) },
        hovertemplate: '<b>%{x}</b><br>Wage: €%{y:,.0f}<extra></extra>'
    }], {
        title: { text: "Top 15 Highest Paid Players", font: { size: 18 } },
        xaxis: { title: "Player Name", tickangle: -35 },
        yaxis: { title: "Weekly Wage (EUR)", tickformat: ",d" },
        margin: { b: 120 },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)'
    }, { responsive: true });

    // =========================================================================
    // 2. Top Producing Countries (dynamic)
    // =========================================================================
    var countryCounts = {};
    data.forEach(d => {
        countryCounts[d.nationality] = (countryCounts[d.nationality] || 0) + 1;
    });
    var sortedCountries = Object.entries(countryCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10);

    Plotly.newPlot("country", [{
        y: sortedCountries.map(d => d[0]).reverse(),
        x: sortedCountries.map(d => d[1]).reverse(),
        type: "bar",
        orientation: "h",
        marker: { color: sortedCountries.map((_, i) => `hsl(${120 + i * 15}, 60%, 50%)`).reverse() },
        hovertemplate: '<b>%{y}</b><br>Players: %{x}<extra></extra>'
    }], {
        title: { text: "Top 10 Player-Producing Countries", font: { size: 18 } },
        xaxis: { title: "Number of Players" },
        yaxis: { title: "" },
        margin: { l: 120 },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)'
    }, { responsive: true });

    // =========================================================================
    // 3. Age Distribution (dynamic)
    // =========================================================================
    var ageCounts = {};
    data.forEach(d => {
        ageCounts[d.age] = (ageCounts[d.age] || 0) + 1;
    });
    var ages = Object.keys(ageCounts).map(Number).sort((a, b) => a - b);

    Plotly.newPlot("age", [{
        x: ages,
        y: ages.map(a => ageCounts[a]),
        type: "bar",
        marker: {
            color: ages.map(a => {
                if (a < 21) return '#4CAF50';
                if (a < 28) return '#2196F3';
                if (a < 33) return '#FF9800';
                return '#F44336';
            })
        },
        hovertemplate: 'Age %{x}<br>Count: %{y}<extra></extra>'
    }], {
        title: { text: "Player Count by Age", font: { size: 18 } },
        xaxis: { title: "Age", dtick: 2 },
        yaxis: { title: "Number of Players" },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)'
    }, { responsive: true });

    // =========================================================================
    // 4. Top Clubs Pie Chart (dynamic - top 30 players)
    // =========================================================================
    var top30 = data.slice().sort((a, b) => b.overall - a.overall).slice(0, 30);
    var clubCounts = {};
    top30.forEach(d => {
        clubCounts[d.club] = (clubCounts[d.club] || 0) + 1;
    });
    var clubEntries = Object.entries(clubCounts).sort((a, b) => b[1] - a[1]);

    Plotly.newPlot("club", [{
        labels: clubEntries.map(d => d[0]),
        values: clubEntries.map(d => d[1]),
        type: "pie",
        textinfo: "label+percent",
        hovertemplate: '<b>%{label}</b><br>Players: %{value}<br>%{percent}<extra></extra>',
        marker: {
            colors: clubEntries.map((_, i) =>
                `hsl(${(i * 360 / clubEntries.length) % 360}, 65%, 55%)`)
        }
    }], {
        title: { text: "Clubs with Most Players in Top 30", font: { size: 18 } },
        plot_bgcolor: 'rgba(0,0,0,0)',
        paper_bgcolor: 'rgba(0,0,0,0)'
    }, { responsive: true });

});

// =============================================================================
// D3 Circle Packing Visualization (Enhanced & Interactive)
// =============================================================================

(function() {
    var svgEl = document.querySelector("svg");
    if (!svgEl) return;

    // Size the chart to fit its container, keeping it square
    var container = svgEl.parentNode;
    var containerWidth = container.getBoundingClientRect().width;
    var size = Math.min(containerWidth, 800);
    var width = size;
    var height = size;

    // Clear and reconfigure SVG
    svgEl.innerHTML = '';
    svgEl.setAttribute("width", width);
    svgEl.setAttribute("height", height);
    svgEl.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svgEl.setAttribute("preserveAspectRatio", "xMidYMid meet");
    svgEl.style.display = "block";
    svgEl.style.margin = "0 auto";

    var svg = d3.select(svgEl);
    var margin = 20;

    // Tooltip
    var tooltip = d3.select("body").append("div")
        .attr("id", "d3-tooltip")
        .style("position", "absolute")
        .style("padding", "8px 12px")
        .style("background", "rgba(0,0,0,0.85)")
        .style("color", "#fff")
        .style("border-radius", "6px")
        .style("font-size", "13px")
        .style("pointer-events", "none")
        .style("opacity", 0)
        .style("z-index", 1000)
        .style("box-shadow", "0 2px 8px rgba(0,0,0,0.3)");

    // Breadcrumb
    var breadcrumb = d3.select(svgEl.parentNode).insert("div", ":first-child")
        .attr("id", "d3-breadcrumb")
        .style("padding", "8px 12px")
        .style("font-size", "14px")
        .style("color", "#fff")
        .style("background", "rgba(0,0,0,0.3)")
        .style("border-radius", "6px")
        .style("margin-bottom", "8px")
        .style("min-height", "30px")
        .html('<b>Click circles to zoom in. Click background to zoom out.</b>');

    var color = d3.scaleSequential(d3.interpolateViridis).domain([-1, 5]);

    var pack = d3.pack()
        .size([width, height])
        .padding(3);

    d3.json("/d3data").then(function(rootData) {

        var root = d3.hierarchy(rootData)
            .sum(function(d) { return d.size; })
            .sort(function(a, b) { return b.value - a.value; });

        pack(root);

        var focus = root;
        var view;

        var g = svg.append("g");

        var circle = g.selectAll("circle")
            .data(root.descendants())
            .enter().append("circle")
            .attr("class", function(d) {
                return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root";
            })
            .style("fill", function(d) {
                if (!d.parent) return color(-1);
                if (d.children) return color(d.depth);
                return "rgba(255,255,255,0.85)";
            })
            .style("stroke", function(d) {
                return d.children ? "rgba(255,255,255,0.3)" : "none";
            })
            .style("stroke-width", 1)
            .style("cursor", function(d) { return d.children ? "pointer" : "default"; })
            .on("click", function(event, d) {
                if (d.children && focus !== d) {
                    zoom(d);
                    event.stopPropagation();
                }
            })
            .on("mouseover", function(event, d) {
                d3.select(this).style("stroke", "#fff").style("stroke-width", 2);
                var info = '<b>' + d.data.name + '</b>';
                if (d.children) {
                    info += '<br>Contains ' + d.leaves().length + ' players';
                    info += '<br>Avg Rating: ' + Math.round(d.value / d.leaves().length);
                } else {
                    info += '<br>Rating: ' + d.data.size;
                }
                tooltip.html(info)
                    .style("opacity", 1)
                    .style("left", (event.pageX + 12) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mousemove", function(event) {
                tooltip.style("left", (event.pageX + 12) + "px")
                    .style("top", (event.pageY - 10) + "px");
            })
            .on("mouseout", function() {
                d3.select(this).style("stroke", function(d) {
                    return d.children ? "rgba(255,255,255,0.3)" : "none";
                }).style("stroke-width", 1);
                tooltip.style("opacity", 0);
            });

        var text = g.selectAll("text")
            .data(root.descendants())
            .enter().append("text")
            .attr("class", "label")
            .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
            .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
            .style("font-size", function(d) {
                if (!d.children) return "6px";
                if (d.depth === 1) return "12px";
                return "9px";
            })
            .style("font-weight", function(d) { return d.children ? "bold" : "normal"; })
            .text(function(d) { return d.data.name; });

        var node = g.selectAll("circle,text");

        svg.style("background", color(-1))
            .on("click", function() { zoom(root); });

        zoomTo([root.x, root.y, root.r * 2]);
        updateBreadcrumb(root);

        function zoom(d) {
            focus = d;
            updateBreadcrumb(d);

            var transition = svg.transition()
                .duration(750)
                .tween("zoom", function() {
                    var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2]);
                    return function(t) { zoomTo(i(t)); };
                });

            transition.selectAll("text")
                .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
                .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
                .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
                .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
        }

        function zoomTo(v) {
            var k = width / v[2];
            view = v;
            node.attr("transform", function(d) {
                return "translate(" + ((d.x - v[0]) * k + width / 2) + "," + ((d.y - v[1]) * k + height / 2) + ")";
            });
            circle.attr("r", function(d) { return d.r * k; });
        }

        function updateBreadcrumb(d) {
            var path = [];
            var current = d;
            while (current) {
                path.unshift(current.data.name);
                current = current.parent;
            }
            var html = path.map(function(name, i) {
                if (i === path.length - 1) return '<b>' + name + '</b>';
                return '<span style="cursor:pointer;text-decoration:underline">' + name + '</span>';
            }).join(' &raquo; ');

            if (d !== root) {
                html += ' <span style="margin-left:10px;cursor:pointer;background:rgba(255,255,255,0.2);padding:2px 8px;border-radius:4px" id="zoom-out-btn">&larr; Zoom Out</span>';
            }
            breadcrumb.html(html);

            var btn = document.getElementById("zoom-out-btn");
            if (btn) {
                btn.addEventListener("click", function(e) {
                    e.stopPropagation();
                    if (d.parent) zoom(d.parent);
                });
            }
        }

    }).catch(function(error) {
        console.error("D3 data load error:", error);
    });
})();
