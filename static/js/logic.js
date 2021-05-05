console.log("logic.js loaded");

// index.html graph ///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////

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
    