// ----------------------------------
// Define svg element
// ----------------------------------
var svg = d3.select('svg'),
    margin = {
        top: 20,
        right: 80,
        bottom: 30,
        left: 50
    },
    width = svg.attr('width') - margin.left - margin.right,
    height = svg.attr('height') - margin.top - margin.bottom,
    g = svg
        .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// ----------------------------------
// Change string to Date format
// ----------------------------------
var parseTime = d3.timeParse('%Y');

// ----------------------------------
// Scale function
// ----------------------------------
var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

// ----------------------------------
// Draw line
// ----------------------------------
var line = d3
    .line()
    .curve(d3.curveBasis)
    .x(function(d) {
        return x(d.date);
    })
    .y(function(d) {
        return y(d.temperature);
    });

// ----------------------------------
// Function of drawing gridlines
// ----------------------------------
function make_x_gridlines() {
    return d3.axisBottom(x).ticks(10);
}

function make_y_gridlines() {
    return d3.axisLeft(y).ticks(10);
}

// ----------------------------------
// Added dropdown selection
// ----------------------------------
// var dropDown = d3
//     .select('#filter')
//     .append('select')
//     .attr('name', 'country-list');

// ----------------------------------
// Pass data (update)
// ----------------------------------
d3.csv('MultiLineExtra.csv', type, function(error, data) {
    if (error) throw error;

    var cities = data.slice().map(function(e, i) {
        var values = {};
        var colsize = Object.keys(data[0]).length - 1; // 11
        for (var j = 0; j < colsize; j++) {
            values[j] = {
                date: parseTime(Object.keys(e)[j]),
                temperature: Object.values(e)[j]
            };
        }

        return {
            cid: e.Country,
            values: Object.values(values)
        };
    });

    // ----------------------------------
    // Set x, y, z domain
    // ----------------------------------
    x.domain(
        d3.extent(cities[0].values, function(d) {
            return d.date;
        })
    );

    y.domain([
        d3.min(cities, function(c) {
            return d3.min(c.values, function(d) {
                return d.temperature;
            });
        }),
        d3.max(cities, function(c) {
            return d3.max(c.values, function(d) {
                return d.temperature;
            });
        })
    ]);

    z.domain(
        cities.map(function(c) {
            // console.log(c);
            return c.cid;
        })
    );

    // ----------------------------------
    // Set x and y axis
    // ----------------------------------
    // text label for the x axis
    g
        .append('g')
        .attr('class', 'axis axis--x')
        .attr('transform', 'translate(0,' + height + ')')
        .call(d3.axisBottom(x));

    svg
        .append('text')
        .attr(
            'transform',
            'translate(' +
                (width + margin.left * 2) +
                ' ,' +
                (height + margin.top) +
                ')'
        )
        .style('text-anchor', 'middle')
        .style('font', '10px sans-serif')
        .text('Year');

    // text label for the y axis
    g
        .append('g')
        .attr('class', 'axis axis--y')
        .call(d3.axisLeft(y))
        .append('text')
        .attr(
            'transform',
            'translate(' +
                -margin.left +
                ',' +
                (height / 2 - margin.bottom) +
                ')rotate(-90)'
        )
        .attr('y', 6)
        .attr('dy', '0.71em')
        .attr('fill', '#000')
        .text('Million BTUs Per Person');

    // ----------------------------------
    // Draw line
    // ----------------------------------
    var city = g
        .selectAll('.city')
        .data(cities)
        .enter()
        .append('g')
        .attr('class', 'city');

    var path = city
        .append('path')
        .attr('class', 'line')
        .attr('d', function(d) {
            // console.log(d.values);
            return line(d.values);
        })
        .style('stroke', function(d) {
            return z(d.cid);
        });

    console.log(path);
    var totalLength = path.node().getTotalLength();

    path
        .attr('stroke-dasharray', totalLength + ' ' + totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);

    svg.on('click', function() {
        path
            .transition()
            .duration(2000)
            .ease(d3.easeLinear)
            .attr('stroke-dashoffset', totalLength);
    });

    // ----------------------------------
    // Add text label
    // ----------------------------------
    city
        .append('text')
        .datum(function(d) {
            return {
                id: d.cid,
                value: d.values[d.values.length - 1]
            };
        })
        .attr('transform', function(d) {
            return (
                'translate(' +
                x(d.value.date) +
                ',' +
                y(d.value.temperature) +
                ')'
            );
        })
        .attr('x', 3)
        .attr('dy', '0.35em')
        .style('font', '10px sans-serif')
        .text(function(d) {
            return d.id;
        });

    // ----------------------------------
    // Draw gridlines
    // ----------------------------------
    svg
        .append('g')
        .attr('class', 'grid--x')
        .attr(
            'transform',
            'translate(' + margin.left + ',' + (height + margin.top) + ')'
        )
        .call(
            make_x_gridlines()
                .tickSize(-height)
                .tickFormat('')
        );

    svg
        .append('g')
        .attr('class', 'grid--y')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
        .call(
            make_y_gridlines()
                .tickSize(-width)
                .tickFormat('')
        );

    // ----------------------------------
    // Add mouseover multi-line
    // Source: https://bl.ocks.org/larsenmtl/e3b8b7c2ca4787f77d78f58d41c3da91
    // ----------------------------------
    var mouseG = svg
        .append('g')
        .attr('class', 'mouse-over-effects')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    mouseG
        .append('path') // this is the black vertical line to follow mouse
        .attr('class', 'mouse-line')
        .style('stroke', 'black')
        .style('stroke-width', '1px')
        .style('opacity', '0');

    var lines = document.getElementsByClassName('line');

    var mousePerLine = mouseG
        .selectAll('.mouse-per-line')
        .data(cities)
        .enter()
        .append('g')
        .attr('class', 'mouse-per-line');

    mousePerLine
        .append('circle')
        .attr('r', 5)
        .style('stroke', function(d) {
            return z(d.cid);
        })
        .style('fill', 'none')
        .style('stroke-width', '1px')
        .style('opacity', '0');

    mousePerLine.append('text').attr('transform', 'translate(10,3)');

    mouseG
        .append('svg:rect') // append a rect to catch mouse movements on canvas
        .attr('width', width) // can't catch mouse events on a g element
        .attr('height', height)
        .attr('fill', 'none')
        .attr('pointer-events', 'all')
        .on('mouseout', function() {
            // on mouse out hide line, circles and text
            d3.select('.mouse-line').style('opacity', '0');
            d3.selectAll('.mouse-per-line circle').style('opacity', '0');
            d3.selectAll('.mouse-per-line text').style('opacity', '0');
        })
        .on('mouseover', function() {
            // on mouse in show line, circles and text
            d3.select('.mouse-line').style('opacity', '1');
            d3.selectAll('.mouse-per-line circle').style('opacity', '1');
            d3.selectAll('.mouse-per-line text').style('opacity', '1');
        })
        .on('mousemove', function() {
            // mouse moving over canvas
            var mouse = d3.mouse(this);
            d3.select('.mouse-line').attr('d', function() {
                var d = 'M' + mouse[0] + ',' + height;
                d += ' ' + mouse[0] + ',' + 0;
                return d;
            });

            d3.selectAll('.mouse-per-line').attr('transform', function(d, i) {
                // console.log(width / mouse[0]);
                var xDate = x.invert(mouse[0]),
                    bisect = d3.bisector(function(d) {
                        return d.date;
                    }).right;
                idx = bisect(d.values, xDate);

                var beginning = 0,
                    end = lines[i].getTotalLength(),
                    target = null;

                while (true) {
                    target = Math.floor((beginning + end) / 2);
                    pos = lines[i].getPointAtLength(target);
                    if (
                        (target === end || target === beginning) &&
                        pos.x !== mouse[0]
                    ) {
                        break;
                    }
                    if (pos.x > mouse[0]) end = target;
                    else if (pos.x < mouse[0]) beginning = target;
                    else break; //position found
                }

                d3
                    .select(this)
                    .select('text')
                    .text(y.invert(pos.y).toFixed(2))
                    .style('font', '12px sans-serif');

                return 'translate(' + mouse[0] + ',' + pos.y + ')';
            });
        });

    // ----------------------------------
    // Add select button to display selected countries
    // Source: http://plnkr.co/edit/3a9emCPAEcVlR1o7YMg3?p=preview
    // ----------------------------------
    var dropDown = d3
        .select('#filter')
        .append('select')
        .attr('name', 'country-list');

    var checkbox = d3.select('.checkbox');

    var options = dropDown
        .selectAll('option')
        .data(data)
        .enter()
        .append('option');

    options
        .text(function(d) {
            return d.Country;
        })
        .attr('value', function(d) {
            return d.Country;
        });

    dropDown.on('change', function() {
        var selected = this.value;
        svg
            .selectAll('.line')
            .filter(function(d) {
                return selected != d.cid;
            })
            .attr('display', 'none');

        svg
            .selectAll('.line')
            .filter(function(d) {
                return selected == d.cid;
            })
            .attr('display', 'inline');
    });

    // ----------------------------------
    // Add checkbox to display selected countries
    // Source: https://bl.ocks.org/johnnygizmo/531991a77047112b7ca89f78b840fba5
    // ----------------------------------
    var checkboxes = d3
        .select('.country-list')
        .selectAll('.country-checkbox')
        .data(data)
        .enter()
        .append('li')
        .attr('class', 'country-checkbox')
        .attr('id', function(d) {
            return d.Country;
        });

    checkboxes
        .append('input')
        .attr('type', 'checkbox')
        .attr('class', 'boxes')
        .attr('id', function(d) {
            return d.Country;
        })
        .attr('value', function(d) {
            return d.Country;
        });

    checkboxes
        .append('label')
        .attr('for', function(d) {
            return d.Country;
        })
        .text(function(d) {
            return d.Country;
        });

    var boxes = d3.selectAll('.boxes').on('change', updatebox);

    function updatebox(d) {
        var choices = [];
        d3.selectAll('.boxes').each(function(d) {
            cb = d3.select(this);
            if (cb.property('checked')) {
                choices.push(cb.property('value'));
            }
        });

        if (choices.length > 0) {
            newData = data.filter(function(d, i) {
                return choices.includes(d.Country);
            });
            svg
                .selectAll('.line')
                .filter(function(d) {
                    return !choices.includes(d.cid);
                })
                .attr('display', 'none');

            svg
                .selectAll('.line')
                .filter(function(d) {
                    return choices.includes(d.cid);
                })
                .attr('display', 'inline');
        } else {
            svg
                .selectAll('.line')
                .filter(function(d) {
                    return !choices.includes(d.cid);
                })
                .attr('display', 'none');
        }
    }
});

// ----------------------------------
// convert temperature to number type
// ----------------------------------
function type(d, _, columns) {
    for (var i = 1, n = columns.length, c; i < n; ++i)
        d[(c = columns[i])] = +d[c];
    return d;
}

// ----------------------------------
// Source: https://codeburst.io/javascript-finding-minimum-and-maximum-values-in-an-array-of-objects-329c5c7e22a2
// ----------------------------------
/*
let findMinMax = function (arr) {
    let min = arr[0].temperature,
        max = arr[0].temperature;

    for (let i = 1, len = arr.length; i < len; i++) {
        let v = arr[i].temperature;
        minObj = (v < min) ? v : min;
        maxObj = (v > max) ? v : max;
    }
    return [minObj, maxObj];
}
let tempArr = [];
cities.forEach(function (a, i) {
    tempArr.push(findMinMax(a.values))
})

let arr = []
tempArr.forEach(function (e, i) {
    arr.push(...e);
})

max = Math.max(...arr);
min = Math.min(...arr);
y.domain([min, max]);
z.domain(cities.map(function (c, i) {
    c.values.forEach(function (a, i) {
        return [a.country];
    })
}));
*/
