console.log("logic.js loaded");

// index.html graph ///////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////

    d3.json("/fifadata").then( earnData => {

      var highEarn = earnData.filter((a => a.wage_eur > 295000));
      highEarn.sort((a,b) => (a.wage_eur < b.wage_eur) ? 1 : -1);
  
      // console.log(highEarn);
  
      highName = highEarn.map(function(d) {return d.short_name;});
      earnValue = highEarn.map(function(d) {return d.wage_eur;});

    var trace1 = {
      x: highName,
      y: earnValue,
      type: "bar"
    };

    var earnData = [trace1];

    var earnLayout = {
      title: "Top 11 Fifa Earners"
    };

    Plotly.newPlot("high-earn", earnData, earnLayout);

  });

  d3.json("/fifadata").then( country => {

    topCountry = country.map(function(d) {return d.nationality;});

    var counts = {};
    for (var i = 0; i < topCountry.length; i++) {
        counts[topCountry[i]] = 1 + (counts[topCountry[i]] || 0);
}

    var sortCount = Object.keys(counts).map(function (key) {
      return [key, counts[key]];
    });

    // Sort the array based on the second element
    sortCount.sort(function (first, second) {
      return second[1] - first[1];
    });

    topCount = sortCount.slice(0,5);


    // console.log(topCount);

    var trace2 = {
      x: [1497,1055,922,881,796].reverse(),
      y: ["England", "Germany", "Spain", "France", "Argentina"],
      type: "bar",
      orientation: "h"
    };

    var countData = [trace2];

    var countLayout = {
      title: "Top Fifa Producing Countries"
    };

    Plotly.newPlot("country", countData, countLayout);

});

d3.json("/fifadata").then( age => {

  age.forEach(function(d) {
    d.age = +d.age;
  });

  playerAge = age.map(function(d) {return d.age;});

  var ageCounts = {};
  for (var i = 0; i < playerAge.length; i++) {
      ageCounts[playerAge[i]] = 1 + (ageCounts[playerAge[i]] || 0);
}

  var sortAge = Object.keys(ageCounts).map(function (key) {
    return [key, ageCounts[key]];
  });

  // console.log(sortAge);

  var trace3 = {
    x: [16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42],
    y: [12,197,570,911,1124,1251,1285,1205,1186,1188,1142,1213,961,895,776,718,505,391,246,249,84,54,24,11,7,2,1],
    type: "bar"
  };

  var ageData = [trace3];

  var ageLayout = {
    title: "Fifa Athlete Count by Age"
  };

  Plotly.newPlot("age", ageData, ageLayout);

});
  
d3.json("/fifadata").then( club => {

  overSort = club.sort((a,b) => (a.overall <= b.overall) ? 1 : -1);

  overFilter = overSort.slice(0,30);

  clubFilter = overFilter.map(function(d) {return d.club;});

  var clubCounts = {};
  for (var i = 0; i < clubFilter.length; i++) {
      clubCounts[clubFilter[i]] = 1 + (clubCounts[clubFilter[i]] || 0);
}
  console.log(clubCounts);

  var trace4 = {
    labels: ["Arsenal", "Dortmund", "Chelse", "FC Barcelona", "FC Bayern", "Inter", "Juventus", "Liverpool", "Man City", "Man U", "Napoli", "Paris SG", "Real Madrid", "Tottenham"],
    values: [1, 1, 1, 5, 1, 1, 3, 2, 4, 1, 1, 3, 4, 2],
    type: "pie"
  };

  var clubData = [trace4];

  var clubLayout = {
    title: "Clubs with the Most Players in the Top 30"
  };

  Plotly.newPlot("club", clubData, clubLayout);



  // console.log(overFilter);
});
  

// D3 Graph Code 

var svg = d3.select("svg"),
margin = 20,
diameter = +svg.attr("width"),
g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var color = d3.scaleSequential(d3.interpolateViridis)
.domain([-4, 4]);

var pack = d3.pack()
.size([diameter - margin, diameter - margin])
.padding(2);


// to be replaced by the app.py path /jagdata
d3.json("/domdata").then(function(root) {
// if (error) throw error;

    console.log(root.name)

    console.log("I am here and working ")

    root = d3.hierarchy(root)
    .sum(function(d) { return d.size; })
    .sort(function(a, b) { return b.value - a.value; });

    var focus = root,
    nodes = pack(root).descendants(),
    view;

    var circle = g.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
    .style("fill", function(d) { return d.children ? color(d.depth) : null; })
    .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });

    console.log("I am here and working ")

    var text = g.selectAll("text")
    .data(nodes)
    .enter().append("text")
    .attr("class", "label")
    .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
    .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
    .text(function(d) { return d.data.name; });

    var node = g.selectAll("circle,text");

    svg
    .style("background", color(-1))
    .on("click", function() { zoom(root); });

    zoomTo([root.x, root.y, root.r * 2 + margin]);

    function zoom(d) {
    var focus0 = focus; focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
        var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
        return function(t) { zoomTo(i(t)); };
        });

        console.log("I am here and working ")

    transition.selectAll("text")
    .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
        .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
        .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
        .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
    }

    function zoomTo(v) {
    var k = diameter / v[2]; view = v;
    node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    circle.attr("r", function(d) { return d.r * k; });
    }
}).catch(function(error) {
    console.log(error);
  });
