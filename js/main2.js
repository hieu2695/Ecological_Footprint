/* 
This javascript features the Line Chart to compare Biocapacity Per Capita
 and Ecological Footprint Per Capita
*/

// set the dimensions and margins of the graph
var margin = {top: 30, right: 60, bottom: 50, left: 60},
    width1 = 900 - margin.left - margin.right,
    height1 = 500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg1 = d3.select("#line-chart")
  .append("svg")
    .attr("width", width1 + margin.left + margin.right)
    .attr("height", height1 + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");
svg1.append("text")
    .attr("x", 210)
    .attr("y", -10)
    .attr("dy", "0.71em")
    .attr("fill", "#000")
    .text("Ecological Footprint vs Biocapacity")
    .style("font", "22px avenir")
    .style("font-weight","bold")
    .style("fill", "#797D7F");

  var color = d3.scaleOrdinal()
    .domain(["BiocapPerCap","EFConsPerCap"])
    .range(["#3498DB ","#E74C3C"])

//Read the data
d3.csv("data/LineChart.csv", function(data) {

    // List of groups (here I have one group per column)
    var allGroup = d3.map(data, function(d){return(d.Country)}).keys()
    var allPara = d3.map(data, function(d){return(d.Parameter)}).keys()

    // add the options to the button
    var selection = d3.select("#selectButton")
        .selectAll('myOptions')
     	  .data(allGroup)
        .enter()
    	  .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }); // corresponding value returned by the button
    
    selection.property("selected", function(d){ return d === 'World'; })
  

    // Add X axis --> it is a date format
    var x = d3.scaleLinear()
        .domain([1961,2016])
        .range([ 0, width1 ]);
    svg1.append("g")
        .attr("transform", "translate(0," + height1 + ")")
        .call(d3.axisBottom(x).ticks(14).tickFormat(d3.format("d")))
        .selectAll("text")	
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)");

    // Add Y axis
    var y = d3.scaleLinear()
      .domain([0, d3.max(data, function(d) { return +d.Total + 0.5; })])
      .range([ height1, 0 ]);
    svg1.append("g")
      .call(d3.axisLeft(y))
      .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -150)
            .attr("y", -50)
            .attr("dy", "0.3408em")
            .attr("fill", "#000")
            .text("Global Hectares")
            .style("font", "23px avenir")
            .style("font-size","18px");
    

    // Add Legend
    var svgLegend = svg1.append('g')
        .attr('class', 'gLegend')
        .attr("transform", "translate(" + (width1 + 20) + "," + 70 + ")")
      

    var R = 10;
    var legend = svgLegend.selectAll('.legend')
        .data(allPara)
        .enter().append('g')
          .attr("class", "legend")
          .attr("transform", function (d, i) {return "translate(-150," + i * 30 + ")"})

    legend.append("circle")
        .attr("class", "legend-node")
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("r", R)
        .style("fill", d=>color(d))

    legend.append("text")
          .attr("class", "legend-text")
          .attr("x", R*2)
          .attr("y", R/2)
          .style("fill", "#030303")
          .style("font-size", 12)
          .style("text-anchor", "right")
          .text(function(d) {if (d == allPara[0]) return "Biocapacity"
                            else return "Ecological Footprint"} );
      
    // Initialize line with first group of the list
    var line1 = svg1
      .append('g')
      .append("path")
        .datum(data.filter(function(d){return (d.Country==allGroup[23]) & (d.Parameter == allPara[0])}))
        .attr("d", d3.line()
          .x(function(d) { return x(d.Year) })
          .y(function(d) { return y(+d.Total) })
        )
        .attr("stroke", color(allPara[0]))
        .style("stroke-width", 4)
        .style("fill", "none")

    var line2 = svg1.append('g')
        .append("path")
          .datum(data.filter(function(d){return (d.Country==allGroup[23]) & (d.Parameter == allPara[1])}))
          .attr("d", d3.line()
            .x(function(d) { return x(d.Year) })
            .y(function(d) { return y(+d.Total) })
          )
          .attr("stroke", color(allPara[1]))
          .style("stroke-width", 4)
          .style("fill", "none")

    // A function that update the chart
    function update(selectedGroup) {

      // Give these new data to update line


    line1
        .datum(data.filter(function(d){return (d.Country==selectedGroup) & (d.Parameter == allPara[0])}))
        .transition()
        .duration(1000)
        .attr("d", d3.line()
          .x(function(d) { return x(d.Year) })
          .y(function(d) { return y(+d.Total) })
        )
        .attr("stroke", color(allPara[0]))
        .style("stroke-width", 4)
        .style("fill", "none")

    line2 
        .datum(data.filter(function(d){return (d.Country==selectedGroup) & (d.Parameter == allPara[1])}))
        .transition()
        .duration(1000)
        .attr("d", d3.line()
            .x(function(d) { return x(d.Year) })
            .y(function(d) { return y(+d.Total) })
          )
        .attr("stroke", color(allPara[1]))
        .style("stroke-width", 4)
        .style("fill", "none")

    }


    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function(d) {
      // recover the option that has been chosen
      var selectedOption = d3.select(this).property("value")
      // run the updateChart function with this selected option
      update(selectedOption)
    })

})

