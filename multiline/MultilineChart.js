// Source:
// https://bl.ocks.org/d3noob/c506ac45617cf9ed39337f99f8511218
// https://bl.ocks.org/mbostock/3884955

var svg = d3.select("svg"),
    margin = {
        top: 20,
        right: 80,
        bottom: 30,
        left: 50
    },
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var parseTime = d3.timeParse("%Y");

var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

var line = d3.line()
    .curve(d3.curveBasis)
    .x(function (d) {
        return x(d.date);
    })
    .y(function (d) {
        return y(d.temperature);
    });

// gridlines in x axis function
function make_x_gridlines() {
    return d3.axisBottom(x)
        .ticks(10)
}

// gridlines in y axis function
function make_y_gridlines() {
    return d3.axisLeft(y)
        .ticks(10)
}

d3.csv("BRICSdata.csv", type, function (error, data) {
    if (error) throw error;

    var cities = data.columns.slice(1).map(function (id) {
        return {
            id: id,
            values: data.map(function (d) {
                return {
                    date: d.date,
                    temperature: d[id],
                };
            })
        };
    });

    // add the X gridlines
    svg.append("g")
        .attr("class", "grid")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")")
        .call(make_x_gridlines()
            .tickSize(-height)
            .tickFormat("")
        )

    // add the Y gridlines
    svg.append("g")
        .attr("class", "grid")

        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

        .call(make_y_gridlines()
            .tickSize(-width)
            .tickFormat("")
        )

    x.domain(d3.extent(data, function (d) {
        return d.date;
    }));

    y.domain([
    d3.min(cities, function (c) {
            return d3.min(c.values, function (d) {
                return d.temperature;
            });
        }),
    d3.max(cities, function (c) {
            return d3.max(c.values, function (d) {
                return d.temperature;
            });
        })
  ]);

    z.domain(cities.map(function (c) {
        return c.id;
    }));

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
    // text label for the x axis
    svg.append("text")
        .attr("transform",
            "translate(" + (width + margin.left * 2) + " ," +
            (height + margin.top) + ")")
        .style("text-anchor", "middle")
        .style("font", "10px sans-serif")
        .text("Year");


    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("transform", "translate(" + (-margin.left) + "," + (height / 2 - margin.bottom) + ")rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("Million BTUs Per Person");

    var city = g.selectAll(".city")
        .data(cities)
        .enter().append("g")
        .attr("class", "city");

    var path = city.append("path")
        .attr("class", "line")
        .attr("d", function (d) {
            return line(d.values);
        })
        .style("stroke", function (d) {
            return z(d.id);
        });

    var totalLength = path.node().getTotalLength();

    path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);

    svg.on("click", function () {
        path
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr("stroke-dashoffset", totalLength);
    })

    city.append("text")
        .datum(function (d) {
            return {
                id: d.id,
                value: d.values[d.values.length - 1]
            };
        })
        .attr("transform", function (d) {
            return "translate(" + x(d.value.date) + "," + y(d.value.temperature) + ")";
        })
        .attr("x", 3)
        .attr("dy", "0.35em")
        .style("font", "10px sans-serif")
        .text(function (d) {
            return d.id;
        });
});

function type(d, _, columns) {
    d.date = parseTime(d.date);
    for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
    return d;
}
