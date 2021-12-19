import * as d3 from "d3";
import numberFormatter from "../../../../utility/numberFormatter";
import likesFormatter from "../../../../utility/likesFormatter";

const totalScore2 = [
    {
        "date": 1,
        "value": 0
    },
    {
        "date": 2,
        "value": 0
    },
    {
        "date": 3,
        "value": 0
    },
    {
        "date": 4,
        "value": 0
    },
    {
        "date": 5,
        "value": 0
    },
    {
        "date": 6,
        "value": 0
    },
    {
        "date": 7,
        "value": 0
    },
    {
        "date": 8,
        "value": 0
    },
    {
        "date": 9,
        "value": 0
    },
    {
        "date": 10,
        "value": 0
    },
    {
        "date": 11,
        "value": 0
    },
    {
        "date": 12,
        "value": 0
    },
    {
        "date": 13,
        "value": 0
    },
    {
        "date": 14,
        "value": 0
    },
    {
        "date": 15,
        "value": 0
    },
    {
        "date": 16,
        "value": 0
    },
    {
        "date": 17,
        "value": 0
    },
    {
        "date": 18,
        "value": 0
    },
    {
        "date": 19,
        "value": 0
    },
    {
        "date": 20,
        "value": 0
    },
    {
        "date": 21,
        "value": 0
    },
    {
        "date": 22,
        "value": 0
    },
    {
        "date": 23,
        "value": 0
    },
    {
        "date": 24,
        "value": 0
    },
    {
        "date": 25,
        "value": 0
    },
    {
        "date": 26,
        "value": 0
    },
    {
        "date": 27,
        "value": 0
    },
    {
        "date": 28,
        "value": 0
    },
    {
        "date": 29,
        "value": 0
    },
    {
        "date": 30,
        "value": 0
    }
];

function renderMultiLineChart(data, selector) {
    function totalCallsGraph(data) {
        const margin = { top: 10, right: 10, bottom: 30, left: 50 };
        let width = 850 - margin.left - margin.right;
        // const width = selector.offsetWidth - margin.left - margin.right;
        // const height = selector.offsetHeight - margin.top - margin.bottom;
        let height = 450 - margin.top - margin.bottom;

        let select;
        let newSelector;
        if (!selector) {
            const node = document.querySelector('#totalChart svg');
            node?.parentNode.removeChild(node);
            select = '#totalChart';
            newSelector = document.querySelector(select);
        } else {
            select = selector;
            const node = select.svg;
            node?.parentNode.removeChild(node);
        }

        if (newSelector) {
            if (newSelector.offsetWidth <= 315) margin.left = 10;

            width = newSelector.offsetWidth - margin.left - margin.right;
            height = newSelector.offsetHeight - margin.top - margin.bottom;
        }

        const n = 32;

        const x = d3.scaleLinear()
            .domain([1, data.length])
            .range([0, width]);

        const y = d3.scaleLinear()
            .range([height, 0]);

        if (d3.min(data, d => d.value) < 0) {
            y.domain([d3.min(data, d => d.value), d3.max(data, d => d.value)]);
        } else y.domain([0, d3.max(data, d => d.value)]);

        const xAxis = d3.axisBottom(x)
            .ticks(data.length - 1);

        const yAxis = d3.axisLeft(y)
            .ticks(Math.min(d3.max(data, d => d.value), 5))
            .tickSizeInner(-width)
            .tickSizeOuter(0)
            .tickPadding(10)
            .tickFormat(d => {
                if (d >= 1000000) return likesFormatter(d);
                else return numberFormatter(d);
            });

        const valueline = d3.line()
            .curve(d3.curveMonotoneX)
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.value); });

        // Initiate the area line function
        const areaFunction1 = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function (d) {
                return x(d.date);
            })
            .y0(height)
            .y1(function (d) {
                return y(d.value);
            });

        //Add the svg canvas for the line chart

        const node = document.querySelector('#totalChart svg');
        node?.parentNode.removeChild(node);
        // select = '#totalChart';
        const svg = d3.select(select)
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

        // Get the data
        data.forEach(function(d) {
            d.date = +d.date;
            d.value = +d.value;
            d.outgoingCalls = +d.outgoingCalls;
        });

        // Scale the range of the data
        // x.domain(d3.extent(data, d => d.date ));
        // y.domain([0, d3.max(data, d => d.value )]);

        svg.append("path")		// Add the valueline path.
            .attr("class", "line")
            .attr("d", valueline(totalScore2))
            .transition().duration(1500)
            .attr("d", valueline(data))


        //Draw the underlying area chart filled with the gradient
        svg.append("path")
            .attr("class", "area")
            .style("fill", "url(#areaGradient1)")
            .attr("d", areaFunction1(totalScore2))
            .transition().duration(1500)
            .attr("d", areaFunction1(data));

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
            const tooltip = d3.select(select).append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            svg.selectAll("." + dots)
                .data(data, function (d) {
                    return d.date;
                })
                .enter().append("circle")
                .attr("class", "lineDots " + linedots)
                .attr("r", 4)
                .attr("cx", function (d) {
                    return x(d.date);
                })
                .attr("cy", function (d) {
                    return y(d[calls]);
                })
                .on("mouseover", function (d, i, n) {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", 1);
                    tooltip.html("<span>" + numberFormatter(i[calls]) + "</span>")
                        .style("left", (selector ? d.clientX - selector.getClientRects()[0].x - 15 : d.clientX - document.querySelector('.chart-wrapper').getClientRects()[0].x) + "px")
                        .style("top", (selector ? d.clientY - selector.getClientRects()[0].y - 35 : d.clientY - document.querySelector('.chart-wrapper').getClientRects()[0].y + 50) + "px");
                })
                .on("mouseout", function (d) {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

        }

        tooltipCalls("incominglineDots","value","lineDotsIncoming");
    }

    totalCallsGraph(data);
}

export default renderMultiLineChart;
