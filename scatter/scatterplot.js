//Define Margin
var margin = { left: 80, right: 80, top: 50, bottom: 50 },
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

//Define Color
// var colors = d3.scale.category20();
var colors = d3.scaleOrdinal(d3.schemeCategory10);

//Define SVG
var svg = d3
    .select('body')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom);

var g = svg
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

//Define Scales
var xScale = d3.scaleLinear().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);

//Get Data
d3.csv('scatterdata.csv', function(error, data) {
    data.forEach(function(d) {
        d.country = d.country;
        d.gdp = +d.gdp;
        d.population = +d.population;
        d.ecc = +d.ecc;
        d.ec = +d.ec;
    });

    xScale.domain([
        0,
        d3.max(data, function(d) {
            return d.gdp;
        })
    ]);

    yScale.domain([
        0,
        d3.max(data, function(d) {
            return d.ecc;
        })
    ]);

    //Define axis
    var xAxis = d3.axisBottom(xScale);
    var yAxis = d3.axisLeft(yScale);

    //Draw Scatterplot
    var circles = g
        .selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('r', function(d) {
            return Math.sqrt(d.ec) / 0.2;
        })
        .attr('cx', function(d) {
            return xScale(d.gdp);
        })
        .attr('cy', function(d) {
            return yScale(d.ecc);
        })
        .style('fill', function(d) {
            return colors(d.country);
        })
        //Add Tooltip.html with transition and style
        .on('mouseover', function(d) {
            //Get this bar's x/y values, then augment for the tooltip
            var xPosition = parseFloat(d3.select(this).attr('cx'));
            var yPosition = parseFloat(d3.select(this).attr('cy'));

            //Update the tooltip position and value
            var tooltip = d3
                .select('#tooltip')
                .style('left', xPosition + 'px')
                .style('top', yPosition + 'px');

            //Display tooltip text
            tooltip.select('#country').text(d.country);
            tooltip.select('#population').text(d.population);
            tooltip.select('#gdp').text(d.gdp);
            tooltip.select('#epc').text(d.ecc);
            tooltip.select('#total').text(d.ec);

            //Show the tooltip
            d3.select('#tooltip').classed('hidden', false);
        })
        .on('mouseout', function() {
            //Hide the tooltip
            d3.select('#tooltip').classed('hidden', true);
        });

    //Draw Country Names
    var namelabel = g
        .selectAll('.text')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'text')
        .style('text-anchor', 'start')
        .attr('x', function(d) {
            return xScale(d.gdp);
        })
        .attr('y', function(d) {
            return yScale(d.ecc);
        })
        .style('text-anchor', 'middle')
        .attr('font-size', '10px')
        .style('fill', 'black')
        .text(function(d) {
            return d.country;
        });

    //Hidden layer
    var layerLeft = g
        .append('g')
        .attr('class', 'bar')
        .append('rect')
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', margin.left)
        .attr('height', height + margin.top + margin.bottom)
        .attr('fill', '#fff')
        .attr(
            'transform',
            'translate(' + -margin.left + ',' + -margin.top + ')'
        );
    var layerBottom = g
        .append('g')
        .attr('class', 'bar')
        .append('rect')
        .attr('x', 0)
        .attr('y', height + margin.bottom)
        .attr('width', width + margin.left + margin.right)
        .attr('height', margin.bottom)
        .attr('fill', '#fff')
        .attr(
            'transform',
            'translate(' + -margin.left + ',' + -margin.top + ')'
        );

    //append x-axis
    var axisx = g
        .append('g')
        .attr('class', 'x-axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis)
        .append('text')
        .attr('class', 'label')
        .attr('y', 50)
        .attr('x', width / 2)
        .style('text-anchor', 'middle')
        .attr('font-size', '12px')
        .text('GDP (in Trillion US Dollars) in 2010');

    //append y-axis
    var axisy = g
        .append('g')
        .attr('class', 'y-axis')
        .call(yAxis)
        .append('text')
        .attr('class', 'label')
        .attr('transform', 'rotate(-90)')
        .attr('y', -50)
        .attr('x', -50)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .attr('font-size', '12px')
        .text('Energy Consumption per Capita (in Million BTUs per person)');

    //create zoom handler
    var zoom_handler = d3
        .zoom()
        .scaleExtent([0.5, 3.0]) //zoom scale range min is 0.5, max is 3.0
        .translateExtent([[0, 0], [width, height]]) //constraint top left, bottom right
        .on('zoom', zoom_actions);

    //add zoom behaviour to the svg element
    //same as svg.call(zoom_handler);
    zoom_handler(svg);

    //specify what to do when zoom event listener is triggered
    function zoom_actions() {
        //zoom circles
        circles.attr('transform', d3.event.transform);

        //zoom textlabel
        namelabel.attr('transform', d3.event.transform);

        //zoom axis
        var t = d3.event.transform,
            xt = t.rescaleX(xScale),
            yt = t.rescaleY(yScale);
        g.select('.x-axis').call(xAxis.scale(xt));
        g.select('.y-axis').call(yAxis.scale(yt));
    }

    // draw legend colored rectangles
    svg
        .append('rect')
        .attr('x', width - 250)
        .attr('y', height - 190)
        .attr('width', 220)
        .attr('height', 180)
        .attr('fill', 'lightgrey')
        .style('stroke-size', '1px');

    svg
        .append('circle')
        .attr('r', 5)
        .attr('cx', width - 100)
        .attr('cy', height - 175)
        .style('fill', 'white');

    svg
        .append('circle')
        .attr('r', 15.8)
        .attr('cx', width - 100)
        .attr('cy', height - 150)
        .style('fill', 'white');

    svg
        .append('circle')
        .attr('r', 50)
        .attr('cx', width - 100)
        .attr('cy', height - 80)
        .style('fill', 'white');

    svg
        .append('text')
        .attr('class', 'label')
        .attr('x', width - 150)
        .attr('y', height - 172)
        .style('text-anchor', 'end')
        .text(' 1 Trillion BTUs');

    svg
        .append('text')
        .attr('class', 'label')
        .attr('x', width - 150)
        .attr('y', height - 147)
        .style('text-anchor', 'end')
        .text(' 10 Trillion BTUs');

    svg
        .append('text')
        .attr('class', 'label')
        .attr('x', width - 150)
        .attr('y', height - 77)
        .style('text-anchor', 'end')
        .text(' 100 Trillion BTUs');

    svg
        .append('text')
        .attr('class', 'label')
        .attr('x', width - 150)
        .attr('y', height - 15)
        .style('text-anchor', 'middle')
        .style('fill', 'Green')
        .attr('font-size', '16px')
        .text('Total Energy Consumption');
});
