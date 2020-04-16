/* 
Geo Map for Ecological Footprint Consumption Per Capita
*/

// Margin
var margin = {left: 10, right: 10, top: 10, bottom: 10};

var width = 1200 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

// SVG
var svg = d3.select("#geo-map-EF")
    .append("svg")
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("text")
    .attr("x", 320)
    .attr("y", -10)
    .attr("dy", "0.71em")
    .attr("fill", "#000")
    .text("Ecological Footprint Consumption Per Capita")
    .style("font", "23px avenir")
    .style("font-weight","bold")
    .style("fill", "#797D7F");



// Tooltip


// Map and projection
var path = d3.geoPath();
var projection = d3.geoNaturalEarth()
    .scale(width / 2 / Math.PI)
    .translate([width / 2, height / 2])
var path = d3.geoPath()
    .projection(projection);

// Data and color scale
var data = d3.map();
var data = d3.map();


var color = d3.scaleThreshold()
    .domain([0,3,5,7,9,11,13])
    .range(["#FCF3CF","#F1C40F","#F39C12","#E67E22","#E74C3C"," #C0392B","#8E44AD","#5B2C6F"]);
   
//Legend
var keys = ["1","3","5","7","9","11",">13"]

// Usually you have a color scale in your chart already

// Add one dot in the legend for each name.
var size = 20
svg.selectAll("mydots")
  .data(keys)
  .enter()
  .append("rect")
    .attr("x", 10)
    .attr("y", function(d,i){ return 100 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d){ return color(d)});

// Add one dot in the legend for each name.
svg.selectAll("mylabels")
  .data(keys)
  .enter()
  .append("text")
    .attr("x", 10 + size*1.2)
    .attr("y", function(d,i){ return 100 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function(d){ return color(d)})
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle");
svg
    .append("text")
    .attr("x",-10)
    .attr("y",80)
    .text("Global Hectares")
    .style("fill", "#168E28")
    .attr("font-family","Georgia, serif")
    .style("font-weight","bold");

// Load external data and boot
d3.queue()
  .defer(d3.json, "data/world.geojson")
  .defer(d3.csv, "data/DeRedata.csv")
  .await(ready);

function ready(error, topo, data) {
    if (error) throw error;

    data.forEach(function(d) { 
        d.Year = +d.Year;
        d.id = d.id;
        d.EFConsPerCap = +d.EFConsPerCap;});

    var valueById = d3.nest()
        .key(function(d) { return d.id; })
        .key(function(d) { return d.Year})
        .object(data);

    topo.features.forEach(function(d) { d.prop = valueById[d.id] });
    var topodata = topo.features.filter(function(d) { return d.prop !== undefined})

    console.log(topodata)

    var GeoMap = svg.selectAll("path")
		.data(topodata)
		.enter()
		.append("path")
			.attr("class", "country")
            .attr("d", path)
            .style("opacity", 13);


            
    svg.append("path")
        .datum(topojson.mesh(topodata, function(a, b) { return a.id !== b.id; }))
        .attr("class", "names")
        .attr("d", path);
    
   
    
	function update(Year){
        var xyear = Year;
        var tip = d3.tip()
        .attr("class", "d3-tip")
        .html(function(d){
            var text = "<strong><span style='font-size:13px'>Country:</span></strong> <span style='font-size:13px;color:orange'>" + d.properties.name + "</span><br>";
            text += "<strong><span style='font-size:13px'>Region:</span></strong> <span style='font-size:13px;color:orange'>" + d.prop[xyear][0].Region + "</span><br>";
            text += "<strong><span style='font-size:13px'>Population:</span></strong> <span style='font-size:13px;color:orange'>" + d3.format(".2s")(d.prop[xyear][0].Population)+ "</span><br>";
            text += "<strong><span style='font-size:13px'>Income Group:</span></strong> <span style='font-size:13px;color:orange'>" + d.prop[xyear][0].Income + "</span><br>";
            text += "<strong><span style='font-size:13px'>Ecological Footprint Per Capita:</span> </strong><span style='font-size:13px;color:red'>" + d3.format(",.2f")(d.prop[Year][0].EFConsPerCap) + " GHA" + "</span><br>";
            return text;
        })
    
        svg.call(tip);
		slider.property("value", Year);
        d3.select(".year").text(Year);
        GeoMap
            .transition()
            .duration(400)
            .style("fill", function(d) { 
                if (d.prop[Year] !== undefined)
                    return color(d.prop[Year][0].EFConsPerCap);
                else 
                    return ("#767171")})
            .style("stroke","white")
            .style('stroke-width', 0.3)
            .on('mouseover',function(d){
                tip.show(d);
            
                d3.select(this)
                    .style("opacity",0.5)
                    .style("stroke","white")
                    .style("stroke-width",3);
            })
            .on('mouseout', function(d){
                tip.hide(d);

                d3.select(this)
                    .style("opacity", 13)
                    .style("stroke","white")
                    .style("stroke-width",0.3);
            });
    }
    


	var slider = d3.select(".slider")
        .append("input")
            .attr("type", "range")
            .style("width","182px")
			.attr("min", 1990)
			.attr("max", 2016)
            .attr("step", 1)
			.on("input", function() {
				var Year = this.value;
				update(Year);
			});

    update(2016);

    

}