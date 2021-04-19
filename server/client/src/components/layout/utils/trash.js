import * as d3 from "d3";

function renderRadarChart() {
    /!* Radar chart design created by Nadieh Bremer - VisualCinnamon.com *!/

    //////////////////////////////////////////////////////////////
    //////////////////////// Set-Up //////////////////////////////
    //////////////////////////////////////////////////////////////

    var margin = {top: 100, right: 100, bottom: 100, left: 100},
        width = Math.min(700, window.innerWidth - 10) - margin.left - margin.right,
        height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);

    //////////////////////////////////////////////////////////////
    ////////////////////////// Data //////////////////////////////
    //////////////////////////////////////////////////////////////

    var data = [
        [//iPhone
            {axis: "Battery Life", value: 0.22},
            {axis: "Brand", value: 0.28},
            {axis: "Contract Cost", value: 0.29},
            {axis: "Design And Quality", value: 0.17},
            {axis: "Have Internet Connectivity", value: 0.22},
            {axis: "Large Screen", value: 0.02},
            {axis: "Price Of Device", value: 0.21},
            {axis: "To Be A Smartphone", value: 0.50}
        ], [//Samsung
            {axis: "Battery Life", value: 0.27},
            {axis: "Brand", value: 0.16},
            {axis: "Contract Cost", value: 0.35},
            {axis: "Design And Quality", value: 0.13},
            {axis: "Have Internet Connectivity", value: 0.20},
            {axis: "Large Screen", value: 0.13},
            {axis: "Price Of Device", value: 0.35},
            {axis: "To Be A Smartphone", value: 0.38}
        ], [//Nokia Smartphone
            {axis: "Battery Life", value: 0.26},
            {axis: "Brand", value: 0.10},
            {axis: "Contract Cost", value: 0.30},
            {axis: "Design And Quality", value: 0.14},
            {axis: "Have Internet Connectivity", value: 0.22},
            {axis: "Large Screen", value: 0.04},
            {axis: "Price Of Device", value: 0.41},
            {axis: "To Be A Smartphone", value: 0.30}
        ]
    ];
    //////////////////////////////////////////////////////////////
    //////////////////// Draw the Chart //////////////////////////
    //////////////////////////////////////////////////////////////

    var color = d3.scale.ordinal()
        .range(["#EDC951", "#CC333F", "#00A0B0"]);

    var radarChartOptions = {
        w: width,
        h: height,
        margin: margin,
        maxValue: 0.5,
        levels: 5,
        roundStrokes: true,
        color: color
    };
    //Call function to draw the Radar chart
    if (canvas3 && canvas3.current) {
        RadarChart(canvas3.current, data, radarChartOptions);
    }
    // RadarChart(".radarChart", data, radarChartOptions);


    /////////////////////////////////////////////////////////
/////////////// The Radar Chart Function ////////////////
/////////////// Written by Nadieh Bremer ////////////////
////////////////// VisualCinnamon.com ///////////////////
/////////// Inspired by the code of alangrafu ///////////
/////////////////////////////////////////////////////////

    function RadarChart(id, data, options) {
        var cfg = {
            w: 600,				//Width of the circle
            h: 600,				//Height of the circle
            margin: {top: 20, right: 20, bottom: 20, left: 20}, //The margins of the SVG
            levels: 3,				//How many levels or inner circles should there be drawn
            maxValue: 0, 			//What is the value that the biggest circle will represent
            labelFactor: 1.25, 	//How much farther than the radius of the outer circle should the labels be placed
            wrapWidth: 60, 		//The number of pixels after which a label needs to be given a new line
            opacityArea: 0.35, 	//The opacity of the area of the blob
            dotRadius: 4, 			//The size of the colored circles of each blog
            opacityCircles: 0.1, 	//The opacity of the circles of each blob
            strokeWidth: 2, 		//The width of the stroke around each blob
            roundStrokes: false,	//If true the area and stroke will follow a round path (cardinal-closed)
            color: d3.scale.category10()	//Color function
        };

        //Put all of the options into a variable called cfg
        if ('undefined' !== typeof options) {
            for (var i in options) {
                if ('undefined' !== typeof options[i]) {
                    cfg[i] = options[i];
                }
            }//for i
        }//if

        //If the supplied maxValue is smaller than the actual one, replace by the max in the data
        var maxValue = Math.max(cfg.maxValue, d3.max(data, function (i) {
            return d3.max(i.map(function (o) {
                return o.value;
            }))
        }));

        var allAxis = (data[0].map(function (i, j) {
                return i.axis
            })),	//Names of each axis
            total = allAxis.length,					//The number of different axes
            radius = Math.min(cfg.w / 2, cfg.h / 2), 	//Radius of the outermost circle
            Format = d3.format('%'),			 	//Percentage formatting
            angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"

        //Scale for the radius
        var rScale = d3.scale.linear()
            .range([0, radius])
            .domain([0, maxValue]);

        /////////////////////////////////////////////////////////
        //////////// Create the container SVG and g /////////////
        /////////////////////////////////////////////////////////

        //Remove whatever chart with the same id/class was present before
        d3.select(id).select("svg").remove();

        //Initiate the radar chart SVG
        var svg = d3.select(id).append("svg")
            .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
            .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
            .attr("class", "radar" + id);
        //Append a g element
        var g = svg.append("g")
            .attr("transform", "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + (cfg.h / 2 + cfg.margin.top) + ")");

        /////////////////////////////////////////////////////////
        ////////// Glow filter for some extra pizzazz ///////////
        /////////////////////////////////////////////////////////

        //Filter for the outside glow
        var filter = g.append('defs').append('filter').attr('id', 'glow'),
            feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur'),
            feMerge = filter.append('feMerge'),
            feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur'),
            feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        /////////////////////////////////////////////////////////
        /////////////// Draw the Circular grid //////////////////
        /////////////////////////////////////////////////////////

        //Wrapper for the grid & axes
        var axisGrid = g.append("g").attr("class", "axisWrapper");

        //Draw the background circles
        axisGrid.selectAll(".levels")
            .data(d3.range(1, (cfg.levels + 1)).reverse())
            .enter()
            .append("circle")
            .attr("class", "gridCircle")
            .attr("r", function (d, i) {
                return radius / cfg.levels * d;
            })
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", cfg.opacityCircles)
            .style("filter", "url(#glow)");

        //Text indicating at what % each level is
        axisGrid.selectAll(".axisLabel")
            .data(d3.range(1, (cfg.levels + 1)).reverse())
            .enter().append("text")
            .attr("class", "axisLabel")
            .attr("x", 4)
            .attr("y", function (d) {
                return -d * radius / cfg.levels;
            })
            .attr("dy", "0.4em")
            .style("font-size", "10px")
            .attr("fill", "#737373")
            .text(function (d, i) {
                return Format(maxValue * d / cfg.levels);
            });

        /////////////////////////////////////////////////////////
        //////////////////// Draw the axes //////////////////////
        /////////////////////////////////////////////////////////

        //Create the straight lines radiating outward from the center
        var axis = axisGrid.selectAll(".axis")
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis");
        //Append the lines
        axis.append("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", function (d, i) {
                return rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2);
            })
            .attr("y2", function (d, i) {
                return rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2);
            })
            .attr("class", "line")
            .style("stroke", "white")
            .style("stroke-width", "2px");

        //Append the labels at each axis
        axis.append("text")
            .attr("class", "legend")
            .style("font-size", "11px")
            .attr("text-anchor", "middle")
            .attr("dy", "0.35em")
            .attr("x", function (d, i) {
                return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2);
            })
            .attr("y", function (d, i) {
                return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2);
            })
            .text(function (d) {
                return d
            })
            .call(wrap, cfg.wrapWidth);

        /////////////////////////////////////////////////////////
        ///////////// Draw the radar chart blobs ////////////////
        /////////////////////////////////////////////////////////

        //The radial line function
        var radarLine = d3.svg.line.radial()
            .interpolate("linear-closed")
            .radius(function (d) {
                return rScale(d.value);
            })
            .angle(function (d, i) {
                return i * angleSlice;
            });

        if (cfg.roundStrokes) {
            radarLine.interpolate("cardinal-closed");
        }

        //Create a wrapper for the blobs
        var blobWrapper = g.selectAll(".radarWrapper")
            .data(data)
            .enter().append("g")
            .attr("class", "radarWrapper");

        //Append the backgrounds
        blobWrapper
            .append("path")
            .attr("class", "radarArea")
            .attr("d", function (d, i) {
                return radarLine(d);
            })
            .style("fill", function (d, i) {
                return cfg.color(i);
            })
            .style("fill-opacity", cfg.opacityArea)
            .on('mouseover', function (d, i) {
                //Dim all blobs
                d3.selectAll(".radarArea")
                    .transition().duration(200)
                    .style("fill-opacity", 0.1);
                //Bring back the hovered over blob
                d3.select(this)
                    .transition().duration(200)
                    .style("fill-opacity", 0.7);
            })
            .on('mouseout', function () {
                //Bring back all blobs
                d3.selectAll(".radarArea")
                    .transition().duration(200)
                    .style("fill-opacity", cfg.opacityArea);
            });

        //Create the outlines
        blobWrapper.append("path")
            .attr("class", "radarStroke")
            .attr("d", function (d, i) {
                return radarLine(d);
            })
            .style("stroke-width", cfg.strokeWidth + "px")
            .style("stroke", function (d, i) {
                return cfg.color(i);
            })
            .style("fill", "none")
            .style("filter", "url(#glow)");

        //Append the circles
        blobWrapper.selectAll(".radarCircle")
            .data(function (d, i) {
                return d;
            })
            .enter().append("circle")
            .attr("class", "radarCircle")
            .attr("r", cfg.dotRadius)
            .attr("cx", function (d, i) {
                return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
            })
            .attr("cy", function (d, i) {
                return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
            })
            .style("fill", function (d, i, j) {
                return cfg.color(j);
            })
            .style("fill-opacity", 0.8);

        /////////////////////////////////////////////////////////
        //////// Append invisible circles for tooltip ///////////
        /////////////////////////////////////////////////////////

        //Wrapper for the invisible circles on top
        var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
            .data(data)
            .enter().append("g")
            .attr("class", "radarCircleWrapper");

        //Append a set of invisible circles on top for the mouseover pop-up
        blobCircleWrapper.selectAll(".radarInvisibleCircle")
            .data(function (d, i) {
                return d;
            })
            .enter().append("circle")
            .attr("class", "radarInvisibleCircle")
            .attr("r", cfg.dotRadius * 1.5)
            .attr("cx", function (d, i) {
                return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
            })
            .attr("cy", function (d, i) {
                return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
            })
            .style("fill", "none")
            .style("pointer-events", "all")
            .on("mouseover", function (d, i) {
                newX = parseFloat(d3.select(this).attr('cx')) - 10;
                newY = parseFloat(d3.select(this).attr('cy')) - 10;

                tooltip
                    .attr('x', newX)
                    .attr('y', newY)
                    .text(Format(d.value))
                    .transition().duration(200)
                    .style('opacity', 1);
            })
            .on("mouseout", function () {
                tooltip.transition().duration(200)
                    .style("opacity", 0);
            });

        //Set up the small tooltip for when you hover over a circle
        var tooltip = g.append("text")
            .attr("class", "tooltip")
            .style("opacity", 0);

        /////////////////////////////////////////////////////////
        /////////////////// Helper Function /////////////////////
        /////////////////////////////////////////////////////////

        //Taken from http://bl.ocks.org/mbostock/7555321
        //Wraps SVG text
        function wrap(text, width) {
            text.each(function () {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.4, // ems
                    y = text.attr("y"),
                    x = text.attr("x"),
                    dy = parseFloat(text.attr("dy")),
                    tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
                    }
                }
            });
        }//wrap

    }//RadarChart

}

/* ================================================================================================ */
/*
* ++++++++++++++++++++++++++++++++ Full multi line chart --> with comparison +++++++++++++++++++++++++++++++++++
* */

function renderMultiLineChart(data) {
    function totalCallsGraph(data) {

        const margin = { top: 10, right: 30, bottom: 50, left: 50 };
        const width = 1150 - margin.left - margin.right;
        const height = 450 - margin.top - margin.bottom;

        const n = 32;

        const x = d3.scaleLinear()
            .domain([1, n - 1])
            .range([0, width]);
        const y = d3.scaleLinear().range([height, 0]);

        const xAxis = d3.axisBottom(x)
            .ticks(30);

        const yAxis = d3.axisLeft(y)
            .ticks(5)
            .tickSizeInner(-width)
            .tickSizeOuter(0)
            .tickPadding(10);

        // var	yAxis = d3.svg.axis().scale(y)
        //     .orient("left").ticks(5).outerTickSize(1);

        const valueline = d3.line()
            .curve(d3.curveMonotoneX)
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.incomingCalls); });

        // const valueline2 = d3.line()
        //     .curve(d3.curveMonotoneX)
        //     .x(function(d) { return x(d.date); })
        //     .y(function(d) { return y(d.outgoingCalls); });

        //Initiate the area line function
        const areaFunction1 = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function (d) {
                return x(d.date);
            })
            .y0(height)
            .y1(function (d) {
                return y(d.incomingCalls);
            });

        // const areaFunction2 = d3.area()
        //     .curve(d3.curveMonotoneX)
        //     .x(function (d) {
        //         return x(d.date);
        //     })
        //     .y0(height)
        //     .y1(function (d) {
        //         return y(d.outgoingCalls);
        //     });


        //Add the svg canvas for the line chart
        const svg = d3.select("#totalChart")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        //Define the gradient below the line chart
        const areaGradient1 = svg.append('defs')
            .append("linearGradient")
            .attr('id', 'areaGradient1')
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "0%").attr("y2", "100%");

        // const areaGradient2 = svg.append('defs')
        //     .append("linearGradient")
        //     .attr('id', 'areaGradient2')
        //     .attr("x1", "0%").attr("y1", "0%")
        //     .attr("x2", "0%").attr("y2", "100%");

        //Append the first stop - the color at the top
        areaGradient1.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "#52DFC0")
            .attr("stop-opacity", 0.4);

        //Append the second stop - white transparant almost at the end
        areaGradient1.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#52DFC0")
            .attr("stop-opacity", 0);

        //Append the first stop - the color at the top
        // areaGradient2.append("stop")
        //     .attr("offset", "0%")
        //     .attr("stop-color", "#F8E71C")
        //     .attr("stop-opacity", 0.4);

        //Append the second stop - white transparant almost at the end
        // areaGradient2.append("stop")
        //     .attr("offset", "100%")
        //     .attr("stop-color", "#F8E71C")
        //     .attr("stop-opacity", 0);

        // Get the data
        data.forEach(function(d) {
            d.date = +d.date;
            d.incomingCalls = +d.incomingCalls;
            d.outgoingCalls = +d.outgoingCalls;
        });

        // Scale the range of the data
        x.domain(d3.extent(data, function(d) { return d.date; }));
        y.domain([0, d3.max(data, function(d) { return Math.max(d.incomingCalls, d.outgoingCalls); })]);

        svg.append("path")		// Add the valueline path.
            .attr("class", "line")
            .attr("d", valueline(data));

        // svg.append("path")		// Add the valueline2 path.
        //     .attr("class", "line")
        //     .style("stroke", "#F8C91C")
        //     .attr("d", valueline2(data));

        //Draw the underlying area chart filled with the gradient
        svg.append("path")
            .attr("class", "area")
            .style("fill", "url(#areaGradient1)")
            .attr("d", areaFunction1(data));

        // svg.append("path")
        //     .attr("class", "area")
        //     .style("fill", "url(#areaGradient2)")
        //     .attr("d", areaFunction2(data));


        //Create the chart
        svg.append("g")			// Add the X Axis
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
            .append("text")
            .attr("transform", "translate(364,14)")
            .attr("y", "2em")
            .style("text-anchor", "middle")
            .text("Days");

        svg.append("g")			// Add the Y Axis
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", "-1.5em")
            .attr("y", "-3em")
            .style("text-anchor", "end")
            .text("Number of calls received");


        // gridlines in y axis function
        function make_y_gridlines() {
            return d3.axisLeft(y)
                .ticks(5)
        }

        // add the Y gridlines
        svg.append("g")
            .attr("class", "gridline")
            .call(make_y_gridlines()
                .tickSize(-width)
                .tickFormat("")
            )


        function tooltipCalls(dots,calls,linedots) {
            const tooltip = d3.select("#totalChart").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            svg.selectAll("." + dots)
                .data(data, function (d) {
                    return d.date;
                })
                .enter().append("circle")
                .attr("class", "lineDots " + linedots)
                .attr("r", 3)
                .attr("cx", function (d) {
                    return x(d.date);
                })
                .attr("cy", function (d) {
                    return y(d[calls]);
                })
                .on("mouseover", function (d, i) {
                    console.log(d);
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 1);
                    tooltip.html("<span>" + i[calls] + " calls" + "</span>")
                        .style("left", (d.clientX - 200) + "px")
                        .style("top", (d.clientY - 70) + "px");
                })
                .on("mouseout", function (d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

        }

        tooltipCalls("incominglineDots","incomingCalls","lineDotsIncoming");
        // tooltipCalls("outgoinglineDots","outgoingCalls","lineDotsOutgoing");
    }

    totalCallsGraph(data);
}

/* ================================================================================================ */
