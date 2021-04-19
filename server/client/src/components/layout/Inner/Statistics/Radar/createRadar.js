import React from 'react';
import * as d3 from "d3";

const createRadar = (element, data, size, animation = false, changeBackground = false) => {
    // set-up
    let margin;
    let width;
    let height;

    if (size === 'small') {
        margin = {top: 70, right: 70, bottom: 70, left: 70};
        width = Math.min(400, window.innerWidth - 10) - margin.left - margin.right;
        height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);
    }

    if (size === 'small-medium') {
        margin = {top: 70, right: 70, bottom: 70, left: 70};
        width = Math.min(440, window.innerWidth - 10) - margin.left - margin.right;
        height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);
    }

    if (size === 'medium') {
        margin = {top: 90, right: 85, bottom: 70, left: 70};
        width = Math.min(540, window.innerWidth - 10) - margin.left - margin.right;
        height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);
    }

    if (size === 'big') {
        margin = {top: 80, right: 80, bottom: 80, left: 80};
        width = Math.min(600, element.current.offsetWidth - 10) - margin.left - margin.right;
        if (element.current.offsetWidth <= 371) width = Math.min(500 - 10) - margin.left - margin.right;
        height = Math.min(width, window.innerHeight - margin.top - margin.bottom - 20);
    }

    // Draw the Chart
    let color = d3.scaleOrdinal()
        .range(["#00A0B0", "#EDC951", "#01fcb5"]);


    const radarChartOptions = {
        w: width,
        h: height,
        margin: margin,
        maxValue: 0.5,
        levels: 5,
        roundStrokes: true,
        color: color
    };

    //Call function to draw the Radar chart
    if (element && element.current) RadarChart(element.current, data, radarChartOptions);

//+++++++++++++++++ The Radar Chart Function ++++++++++++++++++++++
    function RadarChart(id, data, options) {
        const cfg = {
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
            color: d3.scaleOrdinal(d3.schemeCategory10)	//Color function
        };

        //Put all of the options into a variable called cfg
        if ('undefined' !== typeof options) {
            for (var i in options) {
                if ('undefined' !== typeof options[i]) {
                    cfg[i] = options[i];
                }
            }
        }

        // if the supplied maxValue is smaller than the actual one, replace by the max in the data
        // let maxValue = Math.max(cfg.maxValue, d3.max(data, function (i) {
        //     return d3.max(i.map(function (o) {
        //         return o.value;
        //     }))
        // }));


        // we want to scale from 0 to 100% no matter what the real maxValue is
        const maxValue = 1;

        const allAxis = (data[0].map(function (i, j) {
            return i.axis
        }));	// Names of each axis
        const total = allAxis.length;		//The number of different axes
        const radius = Math.min(cfg.w / 2, cfg.h / 2); 	//Radius of the outermost circle
        const Format = d3.format('.0%');	 	//Percentage formatting
        const angleSlice = Math.PI * 2 / total;		//The width in radians of each "slice"

        // Scale for the radius
        const rScale = d3.scaleLinear()
            .range([0, radius])
            .domain([0, maxValue]);


        //++++++++++++++++++ Create the container SVG and g ++++++++++++++++++
        //Remove whatever chart with the same id/class was present before
        d3.select(id).select("svg").remove();

        //Initiate the radar chart SVG
        const svg = d3.select(id).append("svg")
            .attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
            .attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
            .attr("class", "radar" + id);

        //Append a g element
        const g = svg.append("g")
            .attr("transform", "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + (cfg.h / 2 + cfg.margin.top) + ")");

        //++++++++++++++++++++ Glow filter for some extra pizzazz ++++++++++++++++++++
        // Filter for the outside glow
        const filter = g.append('defs').append('filter').attr('id', 'glow')
        const feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'coloredBlur');
        const feMerge = filter.append('feMerge');
        const feMergeNode_1 = feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        const feMergeNode_2 = feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        //++++++++++++++++++++ Draw the Circular grid ++++++++++++++++++++
        // Wrapper for the grid & axes
        const axisGrid = g.append("g").attr("class", "axisWrapper" + id.className);

        // Draw the background circles
        axisGrid.selectAll(".levels" + id.className)
            .data(d3.range(1, (cfg.levels + 1)).reverse())
            .enter()
            .append("circle")
            .attr("class", "gridCircle" + id.className)
            .attr("r", function (d, i) {
                return radius / cfg.levels * d;
            })
            .style("fill", "#CDCDCD")
            .style("stroke", "#CDCDCD")
            .style("fill-opacity", cfg.opacityCircles)
            .style("filter", "url(#glow)");

        //Text indicating at what % each level is
        axisGrid.selectAll(".axisLabel" + id.className)
            .data(d3.range(1, (cfg.levels + 1)).reverse())
            .enter().append("text")
            .attr("class", "axisLabel" + id.className)
            .attr("x", 4)
            .attr("y", function (d) {
                return -d * radius / cfg.levels;
            })
            .attr("dy", "0.4em")
            .style("font-size", "10px")
            .attr("fill", "white")
            .text(function (d, i) {
                return Format(maxValue * d / cfg.levels);
            });

        //++++++++++++++++++++ Draw the axes ++++++++++++++++++++
        // Create the straight lines radiating outward from the center
        const axis = axisGrid.selectAll(".axis" + id.className)
            .data(allAxis)
            .enter()
            .append("g")
            .attr("class", "axis" + id.className);

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
            .attr("class", "line" + id.className)
            .style("stroke", "white")
            .style("stroke-width", "2px");

        //Append the labels at each axis
        axis.append("text")
            .attr("class", "legend" + id.className)
            .style("font-size", size === 'big' ? "13px" : '11px')
            .style('fill', 'white')
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

        //++++++++++++++++++++ Draw the radar chart blobs ++++++++++++++++++++
        //The radial line function
        const radarLine = d3.lineRadial()
            .curve(d3.curveCardinalClosed)
            .radius(function (d) {
                return rScale(d.value);
            })
            .angle(function (d, i) {
                return i * angleSlice;
            });

        if (cfg.roundStrokes) radarLine.curve(d3.curveCardinalClosed);

        // Create a wrapper for the blobs
        const blobWrapper = g.selectAll(".radarWrapper" + id.className)
            .data(data)
            .enter().append("g")
            .attr("class", "radarWrapper" + id.className);

        if (animation) {
            // append the backgrounds
            blobWrapper
                .append("path")
                .attr("class", "radarArea" + id.className)
                .style('transform', 'scale(0)')
                .transition().duration(1000)
                .style('transform', 'scale(1)')
                .attr("d", function (d, i) {
                    return radarLine(d);
                })
                .style("fill", function (d, i) {
                    return cfg.color(i);
                })
                .style("fill-opacity", cfg.opacityArea);

            setTimeout(() => {
                blobWrapper.on('mouseover', function (d, i) {
                    // Dim all blobs
                    d3.selectAll(".radarArea" + id.className)
                        .transition().duration(200)
                        .style("fill-opacity", 0.1);

                    // Bring back the hovered over blob
                    d3.select(this)
                        .transition().duration(200)
                        .style("fill-opacity", 0.7);
                })
                    .on('mouseout', function () {
                        // Bring back all blobs
                        d3.selectAll(".radarArea" + id.className)
                            .transition().duration(200)
                            .style("fill-opacity", cfg.opacityArea);
                    })
            }, 900);
        } else {
            // append the backgrounds
            blobWrapper
                .append("path")
                .attr("class", "radarArea" + id.className)
                .attr("d", function (d, i) {
                    return radarLine(d);
                })
                .style("fill", function (d, i) {
                    return cfg.color(i);
                })
                .style("fill-opacity", cfg.opacityArea)
                .on('mouseover', function (d, i) {
                    // Dim all blobs
                    d3.selectAll(".radarArea" + id.className)
                        .transition().duration(200)
                        .style("fill-opacity", 0.1);

                    // Bring back the hovered over blob
                    d3.select(this)
                        .transition().duration(200)
                        .style("fill-opacity", 0.7);
                })
                .on('mouseout', function () {
                    // Bring back all blobs
                    d3.selectAll(".radarArea" + id.className)
                        .transition().duration(200)
                        .style("fill-opacity", cfg.opacityArea);
                });
        }

        if (animation) {
            // create the outlines
            blobWrapper.append("path")
                .attr("class", "radarStroke" + id.className)
                .style('transform', 'scale(0)')
                .transition().duration(1000)
                .style('transform', 'scale(1)')
                .attr("d", function (d, i) {
                    return radarLine(d);
                })
                .style("stroke-width", cfg.strokeWidth + "px")
                .style("stroke", function (d, i) {
                    return cfg.color(i);
                })
                .style("fill", "none")
                .style("filter", "url(#glow)");
        } else {
            // create the outlines
            blobWrapper.append("path")
                .attr("class", "radarStroke" + id.className)
                .attr("d", function (d, i) {
                    return radarLine(d);
                })
                .style("stroke-width", cfg.strokeWidth + "px")
                .style("stroke", function (d, i) {
                    return cfg.color(i);
                })
                .style("fill", "none")
                .style("filter", "url(#glow)");
        }

        // append the circles
        if (animation) {
            blobWrapper.selectAll(".radarCircle" + id.className)
                .data(function (d, i) {
                    return d;
                })
                .enter().append("circle")
                .attr("class", "radarCircle" + id.className)
                .attr("r", cfg.dotRadius)
                .transition().duration(1000)
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
        } else {
            blobWrapper.selectAll(".radarCircle" + id.className)
                .data(function (d, i) {
                    return d;
                })
                .enter().append("circle")
                .attr("class", "radarCircle" + id.className)
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
        }

        //++++++++++++++++++++ Append invisible circles for tooltip ++++++++++++++++++++
        // Wrapper for the invisible circles on top
        const blobCircleWrapper = g.selectAll(".radarCircleWrapper" + id.className)
            .data(data)
            .enter().append("g")
            .attr("class", "radarCircleWrapper" + id.className);

        //Set up the small tooltip for when you hover over a circle
        const tooltip = g.append("text")
            .attr("class", "tooltip" + id.className)
            .style("opacity", 0);

        //Append a set of invisible circles on top for the mouseover pop-up
        blobCircleWrapper.selectAll(".radarInvisibleCircle" + id.className)
            .data(function (d, i) {
                return d;
            })
            .enter().append("circle")
            .attr("class", "radarInvisibleCircle" + id.className)
            .attr("r", cfg.dotRadius * 1.5)
            .attr("cx", function (d, i) {
                return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
            })
            .attr("cy", function (d, i) {
                return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
            })
            .style("fill", "none")
            .style("pointer-events", "all")
            .style('cursor', 'pointer')
            .on("mouseover", function (d, i) {
                const newX = parseFloat(d3.select(this).attr('cx')) - 10;
                const newY = parseFloat(d3.select(this).attr('cy')) - 10;

                tooltip
                    .attr('x', newX)
                    .attr('y', newY)
                    .text(Format(i.value))
                    .style('fill', '#007000')
                    .style('stroke', 'white')
                    .transition().duration(200)
                    .style('opacity', 1);
            })
            .on("mouseout", function () {
                tooltip.transition().duration(200)
                    .style("opacity", 0);
            });

        //++++++++++++++++++++ Helper Function ++++++++++++++++++++
        // Wraps SVG text
        function wrap(text, width) {
            text.each(function () {
                const text = d3.select(this);
                const words = text.text().split(/\s+/).reverse();
                let word;
                let line = [];
                let lineNumber = 0;
                let lineHeight = 1.4; // ems
                const y = text.attr("y");
                const x = text.attr("x");
                const dy = parseFloat(text.attr("dy"));
                const dx = parseFloat(text.attr("dx"));
                let tspan = text.text(null).append("tspan").attr("x", x).attr("y", y)//.attr("dy", dy + "rem");

                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(" "));
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(" "));
                        line = [word];
                        tspan = text.append("tspan").attr("x", x).attr("y", y).text(word)//.attr("dy", ++lineNumber * lineHeight + dy + "rem").text(word);
                    }
                }
            });
        }
    }
};

export default createRadar;