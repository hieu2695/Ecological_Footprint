/* 
This javascript features the scatter plot using gampminder
Tooltip and Legend are included
*/

// setting for margin
var margin = {left:80, right:20, top:50, bottom:100};

var height = 600 - margin.top - margin.bottom,
    width = 1100 - margin.left - margin.right;
// svg
var svg = d3.select("#gapmider-chart")
    .append('svg')
        .attr('width', width + margin.left + margin.top)
        .attr('height', height + margin.top + margin.bottom)
    .append('g')
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");
      
svg.append("text")
    .attr("x", 300)
    .attr("y", -40)
    .attr("dy", "0.71em")
    .text("Sustainable Human Development")
    .style("font", "23px avenir")
    .style("fill", "#797D7F")
    .style("font-weight","bold");

var time = 0; //represents 1990; 26 represents 2016
var interval; //for handling animation
var formattedData; //global

//tooltip
var tip = d3.tip()
    .attr("class", "d3-tip")
    .html(function(d){
        var text = "<strong><style='font-size:13px'>Country:</span> </strong><span style='font-size:13px;color:orange'>" + d.Country + "</span><br>";
        text += "<strong><style='font-size:13px'>Region:</span> </strong><span style='font-size:13px;color:orange'>" + d.Region + "</span><br>";
        text += "<strong><style='font-size:13px'>Income Group:</span> </strong><span style='font-size:13px;color:orange'>" + d.Income + "</span><br>";
        text += "<strong><style='font-size:13px'>Population:</span> </strong><span style='font-size:13px;color:orange'>" + d3.format(",.0f")(d.Population) + "</span><br>";
        text += "<strong><style='font-size:13px'>Biocapacity:</span> </strong><span style='font-size:13px;color:orange'>" + d3.format(".2f")(d.BiocapPerCap) + "GHA" + "</span><br>";
        text += "<strong><style='font-size:13px'>Ecological Footprint:</span> </strong><span style='font-size:13px;color:red'>" + d3.format(".2f")(d.EFConsPerCap) + "GHA" + "</span><br>";
        text += "<strong><style='font-size:13px'>HDI:</span> </strong><span style='font-size:13px;color:red'>" + d3.format(".2f")(d.HDI) + "</span><br>";
        return text;
    })

svg.call(tip);

//scales
var x = d3.scaleLinear()
    .range([0, width])
    .domain([0, 1.0]); //HDI


var y = d3.scaleLinear()
    .range([height, 0])
    .domain([0, 10]); // ecological footprint

var area = d3.scaleLinear()
    .range([25*Math.PI, 500*Math.PI])
    .domain([4000, 1500000000]); //population

var continentColor = d3.scaleOrdinal(d3.schemeSet1);

//labels

var xLabel = svg.append("text")
    .attr("x", width/2)
    .attr("y", height+50)
    .attr("font-size", "15px")
    .attr("text-anchor", "middle")
    .text("Human Development Index")
    .style("font", "22px avenir")
    .style("font-size","18px");
;

var yLabel = svg.append("text")
    .attr("y", -50)
    .attr("x", -230)
    .attr("transform", "rotate(-90)")
    .attr("font-size", "15px")
    .attr("text-anchor", "middle")
    .text("Number of Earths")
    .style("font", "22px avenir")
    .style("font-size","18px");
;

var timeLabel = svg.append("text")
    .attr('y', height - 10)
    .attr('x', width - 40)
    .attr('font-size', "30px")
    .attr('opacity', '0.4')
    .attr('text-anchor', 'middle')
    .text('1900');


//x axis
var xAxis = d3.axisBottom(x)
    .tickValues([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0])
svg.append("g")
    .attr("transform", "translate(0, " + height + ")")
    .call(xAxis);

//y axis
var yAxis = d3.axisLeft(y)
    .tickFormat(function(d){ return +d; });
svg.append("g")
    .call(yAxis);

//adding a legend
var continents = ["Africa", "Asia-Pacific", "Central America/Caribbean", "EU-28",
"Middle East/Central Asia", "North America","Non-EU Europe","South America"]; // regions

var legend = svg.append("g")
    .attr("transform", "translate(" + (width-750) + ", " + (height-450) + ")");

continents.forEach(function(continent, i){
    var legendRow = legend.append("g")
        .attr("transform", "translate(0, " + (i*20) + ")");

    legendRow.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("fill", continentColor(continent));

    legendRow.append("text")
        .attr("x", -10)
        .attr("y", 10)
        .attr("text-anchor", "end")
        .text(continent);
});

d3.csv('data/DeRedata.csv').then(function(data){
    data = d3.nest()
    .key(function(d) { return d.Year; })
    .entries(data)
    //var data = data.map(function(d){
        //return {year : d.Year,
                //countries : data.filter(function(i){i.Year == d.Year}) }
    //});
    console.log(data);

    //clean the data; remove the var from here since it is now declared as global
    formattedData = data.map(function(year){
        return year['values'].filter(function(Country){
            var dataExists = (Country.Earths && Country.HDI);
            return dataExists;
        }).map(function(Country){
            Country.Earths = +Country.Earths;
            Country.HDI= +Country.HDI;
            return Country;
        })
    });
    console.log(formattedData);


    update(formattedData[0]);

}) //d3.csv

//handling the buttons
$("#play-button")
    .on("click", function(){
        var button = $(this);
        if (button.text() == "Play") {
            button.text("Pause");
            interval = setInterval(step, 1000);
        }
        else {
            button.text("Play");
            clearInterval(interval);
        } 
    });

$("#reset-button")
    .on("click", function(){
        time = 0;
        update(formattedData[time]);
    });

//handling the dropdown menu
$("#continent-select")
    .on("change", function(){
        update(formattedData[time]);
    }); //we need this when the animation is paused

//handling the slider
$("#date-slider").slider({
    max: 2016,
    min: 1990,
    step: 1,
    value: 1990,
    slide: function(event, ui){
        time = ui.value - 1990;
        update(formattedData[time]);
    }
});


function step() {
    //at the end of our data, loop back
    time = (time < 26) ? time+1 : 0;
    update(formattedData[time]);    
} //step

function update(data) {
    
    var t = d3.transition()
        .duration(500); // transition time in milliseconds

    //handling the dropdown selection
    var continent = $("#continent-select").val();

    var data = data.filter(function(d){
        if (continent == "all") { return true; }
        else {
            return d.Region == continent;
        }
    });

    //JOIN new data with old elements
    var circles = svg.selectAll("circle")
        .data(data, function(d){
            return d.Country;
        });

    //EXIT old elements not present in new data
    circles.exit().remove();

    //ENTER new elements present in new data
    circles.enter()
        .append('circle')
            .attr('fill', function(d,i){ return continentColor(d.Region) })
            .on("mouseover", tip.show)
            .on("mouseout", tip.hide)
            .merge(circles)
            .transition(t)
                .attr('cy', function(d,i){ return y(d.Earths) })
                .attr("cx", function(d,i){ return x(d.HDI) })
                .attr("r", function(d,i){ return Math.sqrt(area(d.Population) / Math.PI) })

    timeLabel.text(+(time+1990));

    //update the slider
    $("#year")[0].innerHTML = +(time+1990);
    $("#date-slider").slider("value", +(time+1990));

} //data