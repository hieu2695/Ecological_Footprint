/* This javascript features GeoMap
*/

/* GeoMap for Deficit/Reserve
*/



// Margin
var margin = {left: 10, right: 10, top: 10, bottom: 10};

var width = 1200 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

// SVG
var canvas1 = d3.select("#geo-map-deficit").append("svg")
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr("class", "svg-background")
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
canvas1.append("text")
        .attr("x", 400)
        .attr("y", -10)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("Deficit/Reserve in Global Hectares")
        .style("font", "23px avenir")
        .style("font-weight","bold")
        .style("fill", "#797D7F");
    


// Map and projection
var path1 = d3.geoPath();
var projection1 = d3.geoNaturalEarth()
    .scale(width / 2 / Math.PI)
    .translate([width / 2, height / 2])
var path1 = d3.geoPath()
    .projection(projection1);

// Data and color scale

var colorScheme1 = ["#641E16 ","#BA1813","#CB130E","#EF635F","#75F188","#6AEE7E","#5CE471","#48D85E","#31C447","#22A535","#1B8E2D","#177725","#0C5E07"];

var color1 = d3.scaleThreshold()
    .domain([-7, -4, -2, 0, 2, 5, 8, 10, 25, 50, 65, 80, 90])
    .range(colorScheme1);

// Legend
canvas1.append("circle").attr("cx",20).attr("cy",30).attr("r", 6).style("fill", "#E74C3C")
canvas1.append("circle").attr("cx",20).attr("cy",60).attr("r", 6).style("fill", "#49EC19")
canvas1.append("text").attr("x", 40).attr("y", 31).text("Deficit").style("font-size", "15px").attr("alignment-baseline","middle")
canvas1.append("text").attr("x", 40).attr("y", 61).text("Reserve").style("font-size", "15px").attr("alignment-baseline","middle")



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
        d.DeRe = +d.DeRe;});

    var valueById = d3.nest()
        .key(function(d) { return d.id; })
        .key(function(d) { return d.Year})
        .object(data);

    topo.features.forEach(function(d) { d.prop = valueById[d.id] });
    var topodata = topo.features.filter(function(d) { return d.prop !== undefined})

    console.log(topodata)

    var GeoMap1 = canvas1.selectAll("path")
		.data(topodata)
		.enter()
		.append("path")
			.attr("class", "country")
            .attr("d", path1)
            .style("opacity", 13);


            
    canvas1.append("path")
        .datum(topojson.mesh(topodata, function(a, b) { return a.id !== b.id; }))
        .attr("class", "names")
        .attr("d", path1);
    
   
    
	function update(Year){
        var xyear = Year;
        var tip1 = d3.tip()
        .attr("class", "d3-tip")
        .html(function(d){
            var text = "<strong><span style='font-size:13px'>Country:</span> </strong><span style='font-size:13px;color:orange'>" + d.properties.name + "</span><br>";
            text += "<strong><span style='font-size:13px'>Region:</span> </strong><span style='font-size:13px;color:orange'>" + d.prop[xyear][0].Region + "</span><br>";
            text += "<strong><span style='font-size:13px'>Population:</span> </strong><span style='font-size:13px;color:orange'>" + d3.format(".1s")(d.prop[xyear][0].Population)+ "</span><br>";
            text += "<strong><span style='font-size:13px'>Income Group:</span> </strong><span style='font-size:13px;color:orange'>" + d.prop[xyear][0].Income + "</span><br>";
            text += "<strong><span style='font-size:13px'>Biocapacity:</span> </strong><span style='font-size:13px;color:orange'>" + d3.format(".2s")(d.prop[xyear][0].BiocapTotGHA) + " GHA" + "</span><br>";
            text += "<strong><span style='font-size:13px'>Ecological Footprint Consumption:</span> </strong><span style='font-size:13px;color:orange'>" + d3.format(".2s")(d.prop[Year][0].EFConsTotGHA) + " GHA" + "</span><br>";
            text += "<strong><span style='font-size:13px'>Deficit/Reserve:</span> </strong><span style='font-size:13px;color:red'>" + d3.format(",.2f")(d.prop[xyear][0].DeRe) + " GHA" + "</span><br>";
            return text;
        })
    
        canvas1.call(tip1);
	
        d3.select(".year1").text(Year);
        slider1.property("value", Year);
        GeoMap1
            .style("fill", function(d) { 
                if (d.prop[Year] !== undefined)
                    return color1(d.prop[Year][0].DeRe);
                else 
                    return ("#767171")})
            .style("stroke","white")
            .style('stroke-width', 0.3)
            .on('mouseover',function(d){
                tip1.show(d);
            
                d3.select(this)
                    .style("opacity",0.5)
                    .style("stroke","white")
                    .style("stroke-width",3);
            })
            .on('mouseout', function(d){
                tip1.hide(d);

                d3.select(this)
                    .style("opacity", 13)
                    .style("stroke","white")
                    .style("stroke-width",0.3);
            });
    }
    


    var slider1 = d3.select("#slider1")
        .append("slider")
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
