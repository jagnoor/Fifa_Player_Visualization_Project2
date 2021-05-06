console.log("logic.js loaded");

// index.html graph ///////////////////////////////////////////////////////////////
// /////////////////////////////////////////////////////////////////////////////////

function reactGraphs() {

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
    
    }
    
    reactGraphs ();

  //   require.config({
  //     paths: {
  //         d3: "https://d3js.org/d3.v4.min"
  //      }
  //  });
  
    // require(["d3"], function(d3) {
  
    //  console.log(d3);
  

  var svg = d3.select("svg"),
      margin = 20,
      diameter = +svg.attr("width"),
      g = svg.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");
  
  var color = d3.scaleSequential(d3.interpolateViridis)
      .domain([-4, 4]);
  
  var pack = d3.pack()
      .size([diameter - margin, diameter - margin])
      .padding(2);


  d3.json("/fifadata").then(root => {  


    var argentina_filter = root.filter( a => a.nationality  == "Argentina").filter(a => a.overall > 80);
    var brazil_filter = root.filter( a => a.nationality  == "Brazil").filter(a => a.overall > 80);
    var colombia_filter = root.filter( a => a.nationality  == "Colombia").filter(a => a.overall > 80);
    var chile_filter = root.filter( a => a.nationality  == "Chile").filter(a => a.overall > 80);
    var ecuador_filter = root.filter( a => a.nationality  == "Ecuador").filter(a => a.overall > 80);

    var argentina = []
    for (var i = 0; i < argentina_filter.length; i++) {
      argentina["name"] = argentina_filter.map(function(d) {return d.short_name;});
      argentina["overall"] = argentina_filter.map(function(d) {return d.overall;});
    }

    var brazil = {}
    for (var i = 0; i < brazil_filter.length; i++) {
      brazil["name"] = brazil_filter.map(function(d) {return d.short_name;});
      brazil["overall"] = brazil_filter.map(function(d) {return d.overall;});
    }

    var colombia = []
    for (var i = 0; i < colombia_filter.length; i++) {
      colombia["name"] = colombia_filter.map(function(d) {return d.short_name;});
      colombia["overall"] = colombia_filter.map(function(d) {return d.overall;});
    }

    var chile = []
    for (var i = 0; i < chile_filter.length; i++) {
      chile["name"] = chile_filter.map(function(d) {return d.short_name;});
      chile["overall"] = chile_filter.map(function(d) {return d.overall;});
    }

    var ecuador = []
    for (var i = 0; i < ecuador_filter.length; i++) {
      ecuador["name"] = ecuador_filter.map(function(d) {return d.short_name;});
      ecuador["overall"] = ecuador_filter.map(function(d) {return d.overall;});
    }




    console.log(argentina);



  
    // root = d3.hierarchy(root)
    //     .sum(function(d) { return d.size; })
    //     .sort(function(a, b) { return b.value - a.value; });
  
    // var focus = root,
    //     nodes = pack(root).descendants(),
    //     view;
  
    // var circle = g.selectAll("circle")
    //   .data(nodes)
    //   .enter().append("circle")
    //     .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
    //     .style("fill", function(d) { return d.children ? color(d.depth) : null; })
    //     .on("click", function(d) { if (focus !== d) zoom(d), d3.event.stopPropagation(); });
  
    // var text = g.selectAll("text")
    //   .data(nodes)
    //   .enter().append("text")
    //     .attr("class", "label")
    //     .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; })
    //     .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
    //     .text(function(d) { return d.data.name; });

    // // console.log(root);
  
    // var node = g.selectAll("circle,text");
  
    // svg
    //     .style("background", color(-1))
    //     .on("click", function() { zoom(root); });
  
    // zoomTo([root.x, root.y, root.r * 2 + margin]);
  
    // function zoom(d) {
    //   var focus0 = focus; focus = d;
  
    //   var transition = d3.transition()
    //       .duration(d3.event.altKey ? 7500 : 750)
    //       .tween("zoom", function(d) {
    //         var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
    //         return function(t) { zoomTo(i(t)); };
    //       });
  
    //   transition.selectAll("text")
    //     .filter(function(d) { return d.parent === focus || this.style.display === "inline"; })
    //       .style("fill-opacity", function(d) { return d.parent === focus ? 1 : 0; })
    //       .on("start", function(d) { if (d.parent === focus) this.style.display = "inline"; })
    //       .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; });
    // }
  
    // function zoomTo(v) {
    //   var k = diameter / v[2]; view = v;
    //   node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    //   circle.attr("r", function(d) { return d.r * k; });
    // }
  });
    // });  
    