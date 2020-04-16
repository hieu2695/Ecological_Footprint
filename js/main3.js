/*
This javascript features grouped bar chart with both positive and negative data
*/

// variable for tooltip 
var divTooltip = d3.select("div.tooltip")
// Margin
var margin = {left: 70, right: 70, top: 20, bottom: 100};

var width = 1100 - margin.left - margin.right,
    height = 350 - margin.top - margin.bottom;

// SVG
var svg = d3.select("#bar-chart")
    .append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', (height*2+100 + margin.top + margin.bottom))
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// because the plot is grouped by regions and then by information it has two scales for the x axis
// creating x0 scale which is grouped by regions
var x0 = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.1);

// creating x1 scale which is grouped by information
var x1 = d3.scaleBand()
    .padding(0.08);


// creating an ordinal scale for color that is going to represent different information
var z = d3.scaleOrdinal()
    .range(['#66c2a5','#ffd92f']);


// load data
d3.csv("../data/BarChart.csv", function(d, i, columns) {
    for (var i = 1, n = columns.length; i < n; ++i)
        d[columns[i]] = +d[columns[i]];
    //console.log(+d[columns[i]])
    return d;
}, function(error, data) {
    if (error) throw error;
    // creating var keys containing array of names of information
    var keys = data.columns.slice(1)
    // setting up domain for x0 as a list of all the names of regions
    x0.domain(data.map(function(d) {
        return d.Region;}));
    // setting up domain for x1 as a list of all the names of information
    x1.domain(keys).rangeRound([0, x0.bandwidth()]);
    
    minval = d3.min(data, function(d) {
        return d3.min(keys, function(key) {
            return d[key];
        });
    });
    
    maxval =d3.max(data, function(d) {
        return d3.max(keys, function(key) {
            return d[key];
        });
    });

    // creating a linear scale for y axis
    var y1 = d3.scaleLinear()  // domain for positive data
        .domain([0,maxval])
        .rangeRound([0, height]);
          
    var y2 = d3.scaleLinear() // additional domain to plot negative data
        .domain([minval,maxval])
        .rangeRound([height - y1(minval) ,0]);
    // svg group elements
    g.append("g")
        .selectAll("g")
        .data(data)
        .enter()
        .append("g")
        .attr("transform", function(d) {
            return "translate(" + x0(d.Region) + ",0)";
        })
        .attr("class", "info")
        // binding information to rectangles
        .selectAll("rect")
        .data(function(d) {
            return keys.map(function(key) {
                return {
                    key: key,
                    value: d[key]
                };
            });
        })
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {
                return x1(d.key);
        })
        .attr("width", x1.bandwidth())
        .attr("fill", function(d) {
            return z(d.key);
        })
        // setting for transition
        .attr("y", function(d) {
            return 0;
        })
        .attr("height", function(d) {
            return 0;
        })
       
           
        // tooltip 
        .on("mouseover", function(d) {
            divTooltip.style("left", d3.event.pageX + -300 + "px")
            divTooltip.style("top", d3.event.pageY - 260 + "px")
            divTooltip.style("display", "inline-block")
            divTooltip.style("opacity", "0.9");
            var elements = document.querySelectorAll(":hover");
            var l = elements.length - 1;
            var elementData = elements[l].__data__;
            divTooltip.html(elementData.key + ":"+ "<br>" + elementData.value +' '+"%");
            d3.select(this)
                .attr("fill", "#F8786B") // add color for bar when hover
                .style("stroke", "black") // stroke color
                .style("stroke-width", "1.8px")
                .style("stroke-opacity", "1");
    
        })
        .on("mouseout", function(d) {
            divTooltip.style("display", "none")
            d3.select(this).transition().duration(250)
                .attr("fill", z(d.key))
                .style("stroke-opacity", "0");
        })
        // transition, duration
        .transition()
        .delay(function(d) {
            return Math.random() * 250;
        })
        .duration(1000)
        .attr("y", function(d) {
    
             return height - Math.max(0,y1(d.value));
        
            })
        .attr("height", function(d) {
               
                return Math.abs(y1(d.value)) ;
        })
           ;
        
    
        // X Axis  
        g.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .style("opacity", "0")
            .call(d3.axisBottom(x0))
            .selectAll("text")	
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                //.attr("x","-200px")
                //.attr("y","200px")
                .attr("transform", "rotate(-45)");
        g.select(".x")
            .transition()
            .duration(500)
            .delay(800)
            .style("opacity", "1")
    
        // Y Axis   
        g.append("g")
            .attr("class", "y axis")
            .style("opacity", "0")
            .call(d3.axisLeft(y2).ticks(null, "s"))
            .append("text")
            .attr("x", 2)
            .attr("y", y2(y2.ticks().pop()) + 0.5)
           
            
        g.select(".y")
            .transition()
            .duration(500)
            .delay(1300)
            .style("opacity", "1")
    
        // Legend 
        var legend = g.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(keys.slice())
            .enter()
            .append("g")
            .attr("transform", function(d, i) {
                return "translate(0," + i * 13 + ")";
            })
            .style("opacity", "0");
    
       
        legend.append("rect")
            .attr("x", width - 19)
            .attr("y", -22)
            .attr("width", 12)
            .attr("height", 12)
            .attr("fill", z);
         
        legend.append("text")
            .attr("x", width - 24)
            .attr("y", -15)
            .attr("dy", "0.32em")
            .text(function(d) {
                return d
            });
       
        legend.transition()
            .duration(500)
            .delay(function(d, i) {
                return 1300 + 100 * i;
            })
            .style("opacity", "1");
    
    });
    


