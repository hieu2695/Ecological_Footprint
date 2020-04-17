/* 
GeoMap for Deficit/Reserve Rate
*/



// Margin
var margin = {left: 10, right: 10, top: 10, bottom: 10};

var width = 1200 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

// SVG
var canvas2 = d3.select("#geo-map-percentage").append("svg")
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .attr("class", "svg-background")
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

canvas2.append("text")
    .attr("x", 460)
    .attr("y", -10)
    .attr("dy", "0.71em")
    .attr("fill", "#000")
    .text("Deficit/Reserve Rate")
    .style("font", "23px avenir")
    .style("font-weight","bold")
    .style("fill", "#797D7F");

// legend
canvas2.append("circle").attr("cx",20).attr("cy",30).attr("r", 6).style("fill", "#F58D08")
canvas2.append("circle").attr("cx",20).attr("cy",60).attr("r", 6).style("fill", "#49EC19")
canvas2.append("text").attr("x", 40).attr("y", 31).text("Deficit").style("font-size", "15px").attr("alignment-baseline","middle")
canvas2.append("text").attr("x", 40).attr("y", 61).text("Reserve").style("font-size", "15px").attr("alignment-baseline","middle")


// Map and projection
var path2 = d3.geoPath();
var projection2 = d3.geoNaturalEarth()
    .scale(width / 2 / Math.PI)
    .translate([width / 2, height / 2])
var path2 = d3.geoPath()
    .projection(projection2);

// Data and color scale

var colorScheme2 = ["#641E16 ","#922B21 ","#943126 ","#B03A2E","#CB4335","#E74C3C","#F39C12","#F1C40F","#F7DC6F"
,"#F9E79F","#FEF9E7","#ABEBC6","#2ECC71","#28B463","#1D8348","#145A32"];

var color2 = d3.scaleThreshold()
    .domain([-26, -20, -15, -10, -7, -5, -2,-1,-0.5, -0.2, 0, 0.2, 0.4, 0.6, 0.8,0.9])
    .range(colorScheme2);
   

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
        d.Percentage = +d.Percentage;});

    var valueById = d3.nest()
        .key(function(d) { return d.id; })
        .key(function(d) { return d.Year})
        .object(data);

    topo.features.forEach(function(d) { d.prop = valueById[d.id] });
    var topodata = topo.features.filter(function(d) { return d.prop !== undefined})



    var GeoMap2 = canvas2.selectAll("path")
		.data(topodata)
		.enter()
		.append("path")
			.attr("class", "country")
            .attr("d", path2)
            .style("opacity", 13);


            
    canvas2.append("path")
        .datum(topojson.mesh(topodata, function(a, b) { return a.id !== b.id; }))
        .attr("class", "names")
        .attr("d", path2);
    
   
    
	function update(Year){
        var xyear = Year;
        var tip2 = d3.tip()
        .attr("class", "d3-tip")
        .html(function(d){
            var text = "<strong><span style='font-size:13px'>Country:</span> </strong><span style='font-size:13px;color:orange'>" + d.properties.name + "</span><br>";
            text += "<strong><span style='font-size:13px'>Region:</span> </strong><span style='font-size:13px;color:orange'>" + d.prop[xyear][0].Region + "</span><br>";
            text += "<strong><span style='font-size:13px'>Population:</span> </strong><span style='font-size:13px;color:orange'>" + d3.format(".2s")(d.prop[xyear][0].Population)+ "</span><br>";
            text += "<strong><span style='font-size:13px'>Income Group:</span> </strong><span style='font-size:13px;color:orange'>" + d.prop[xyear][0].Income + "</span><br>";
            text += "<strong><span style='font-size:13px'>Deficit/Reserve:</span> </strong><span style='font-size:13px;color:red'>" + d3.format(",.2f")(d.prop[xyear][0].DeRe) + " GHA" + "</span><br>";
            text += "<strong><span style='font-size:13px'>Deficit/Reserve Rate:</span> </strong><span style='font-size:13px;color:red'>" + d3.format(",.0%")(d.prop[xyear][0].Percentage) + "</span><br>";
            return text;
        })
    
        canvas2.call(tip2);
	
        d3.select(".year2").text(Year);
        slider2.property("value", Year);
        GeoMap2
            .style("fill", function(d) { 
                if (d.prop[Year] !== undefined)
                    return color2(d.prop[Year][0].Percentage);
                else 
                    return ("#767171")})
            .style("stroke","white")
            .style('stroke-width', 0.3)
            .on('mouseover',function(d){
                tip2.show(d);
            
                d3.select(this)
                    .style("opacity",0.5)
                    .style("stroke","white")
                    .style("stroke-width",3);
            })
            .on('mouseout', function(d){
                tip2.hide(d);

                d3.select(this)
                    .style("opacity", 13)
                    .style("stroke","white")
                    .style("stroke-width",0.3);
            });
    }
    


    var slider2 = d3.select("#slider2")
        .append("class","slider")
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
