/* 
This javascript features stacked area charts to visualize the ecological footprint 
by different land types
*/

// setting for color
function get_colors(n) {
    var colors = ["#E74C3C","#C39BD3","#CCED10","#0AD7F3","#F39C12 ","#3498DB"];
    
    return colors[ n % colors.length];
}

// Margin
var margin = {top: 100, right: 100, bottom: 100, left: 100},
    width = 1000 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

// X scale
var x = d3.scaleLinear()
    .range([0, width]);
// Y scale
var y = d3.scaleLinear()
    .range([height, 0]);
    
var color = d3.scaleOrdinal(d3.schemeCategory10) // domain for color to map with categories
    
// x axis
var xAxis = d3.axisBottom(x)
            .ticks(28)
            .tickFormat(d3.format("d"));


// y axis
var yAxis = d3.axisLeft(y)

// setting for area chart
var area = d3.svg.area()
    .x(function(d) { return x(d.Year); })
    .y0(function(d) { return y(d.y0); })
    .y1(function(d) { return y(d.y0 + d.y); });
      
// stack data     
var stack = d3.layout.stack()
    .values(function(d) { return d.values; });

// svg
var svg = d3.select("#stack-chart").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    ;
 
svg.append("text")
        .attr("x", 190)
        .attr("y", -70)
        .attr("dy", "0.71em")
        .text("Ecological Footprint by Land Types")
        .style("font", "23px avenir")
        .style("fill", "#797D7F")
        .style("font-weight","bold");

// load data and plot chart
d3.csv("data/StackAreaChart_Earths.csv", function(error, data) {

    var allGroup = d3.map(data, function(d){return(d.Country)}).keys()
    color.domain(d3.keys(data[0]).filter(function(key) {return (key !== "Year")&(key !== "Country"); }));
     
    data.forEach(function(d) {  
        d.Country = d.Country;
        d.Year = +d.Year;
        d.Cropland = +d.Cropland;
        d.Grazing = +d.Grazing;
        d.Forest =+d.Forest;
        d.Fishing =+d.Fishing;
        d.Builtup =+d.Builtup;
        d.Carbon =+d.Carbon;
    }); 


    // Select options
    d3.select("#selectButton")
      .selectAll('myOptions')
     	.data(allGroup)
      .enter()
    	.append('option')
      .text(function (d) { return d; }) // text showed in the menu
      .attr("value", function (d) { return d; }) // corresponding value returned by the button
    
    // Add legend     
    var legend = svg.selectAll(".legend")
        .data(color.domain()).enter()
        .append("g")
        .attr("class","legend")
        .attr("transform", "translate(" + (width +10) + "," + 0+ ")");
    
    legend.append("rect")
        .attr("x", 0) 
        .attr("y", function(d, i) { return 20 * i; })
        .attr("width", 10)
        .attr("height", 10)
        .style("fill", function(d, i) {
            return get_colors(i);}); 
       
    legend.append("text")
        .attr("x", 20) 
        .attr("dy", "0.75em")
        .attr("y", function(d, i) { return 20 * i; })
        .text(function(d) {return d})
        .style("fill", function(d, i) {
            return get_colors(i);}); 
          
    legend.append("text")
        .attr("x",10) 
        .attr("y",-10)
        .text("Land")
        .style("fill","#797D7F");

    // setting for select Button        
    var selection = d3.select("#selectButton")
        .on("change", function(d) {
            // recover the option that has been chosen
            var region = d3.select(this).property("value");
            // run the updateChart function with this selected option
            update(region);
        })
    var options = selection.selectAll('option')
    options.property("selected", function(d){ return d === 'World'; })
    
    // update function when select a different region
    function update(region) {
        var t = d3.transition().duration(500); // transition and duration

        newdata = stack(color.domain().map(function(name) {
            return {
                name: name,
                values: data.filter(function (d) {return d.Country == region}).map(function(d) {
                return { Year: d.Year, y: d[name] * 1};
              })
            };
        }));
        svg.selectAll("path").remove(); // remove old graphs
        svg.select(".x.axis").remove(); // remove old axes
        svg.select(".y.axis").remove(); // remove old axes


        // Find the highest total value
        var maxVal = d3.max(data.filter(function (d) {return d.Country == region}), function(d){
            var vals = d3.keys(d).map(
                function(key){ 
                return key !== "Year" ? d[key] : 0 });
            return d3.sum(vals);
        });

        // Set domains for axes
        x.domain(d3.extent(data, function(d) { return d.Year; }));
        y.domain([0, maxVal])

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .attr("fill", "#000")
            .call(xAxis)
            .selectAll("text")	
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-45)")
            ;
    
        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", -170)
            .attr("y", -50)
            .attr("dy", "0.3408em")
            .attr("fill", "#000")
            .text("Number of Earths")
            .style("font", "22px avenir")
            .style("font-size","18px");
    
        svg.style("fill","#ffffff");
        var browser = svg.selectAll(".browser").data(newdata); // browser 
        var t = d3.transition().duration(500);
        browser.transition(t);

        // svg elements for browser
        browser.enter()
            .append("g")
            .append("path")
            .attr("class", "area")
            .transition(t)
            .attr("d", function(d) { return area(d.values); })
            .style("fill", function(d,i) { 
                return get_colors(i); });
        browser.exit().remove()
        
    };

    update('World')



    
    

    
    
});



        



