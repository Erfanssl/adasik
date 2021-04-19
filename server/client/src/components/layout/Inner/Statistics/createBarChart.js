import * as d3 from "d3";

function renderBarChart(barChart, data, statistics = false) {
    // select the svg container first

    let width = barChart.current.offsetWidth - 35;
    let height = barChart.current.offsetHeight;

    if (!statistics) {
        width = 1200;
        height = 400;
    }

    const svg = d3.select(barChart.current)
        .append('svg')
        .attr('width', width)
        .attr('height', height);

    // create margins and dimensions
    const margin = { top: 20, right: 20, bottom: 50, left: 80 };
    const graphWidth = width - margin.left - margin.right;
    const graphHeight = height - margin.top - margin.bottom;

    const graph = svg.append('g')
        .attr('width', graphWidth)
        .attr('height', graphHeight)
        .attr('transform', `translate(${ margin.left }, ${ margin.top })`);

    const xAxisGroup = graph.append('g')
        .attr('transform', `translate(0, ${ graphHeight })`);
    const yAxisGroup = graph.append('g');

    // Scales
    const y = d3.scaleLinear()
        .range([graphHeight, 0]);

    const x = d3.scaleBand()
        .range([0, graphWidth])
        .paddingInner(0.2)
        .paddingOuter(0.2);

    // create the axes
    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y)
        .ticks(3)
        .tickFormat(d => d + ' percent');

    // updating scale domains
    y.domain([0, 100]);
    x.domain(data.map(item => item.name))

    // Join the data to rect
    const rects = graph.selectAll('rect')
        .data(data);

    // remove exit selection
    rects.exit().remove();

    // update current shape in the DOM
    rects.attr('width', x.bandwidth)
        .attr('fill', 'url(#bar-chart--gr)')
        .attr('x', d => x(d.name))
        .transition().duration(1500)
        .attr('ry', '2%')
        .attr('y', d => y(d.percent))
        .attr('height', d => graphHeight - y(d.percent));

    // enter selection
    rects.enter()
        .append('rect')
        .attr('height', 0)
        .attr('width', x.bandwidth)
        .attr('fill', 'url(#bar-chart--gr)')
        .attr('x', d => x(d.name))
        .attr('y', graphHeight)
        .attr('ry', '2%')
        .merge(rects) // means merge it to the rects object in the DOM
        .transition().duration(1500)
        .attr('y', d => y(d.percent))
        .attr('height', d => graphHeight - y(d.percent));

    // call axes
    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

    // update x axis text
    xAxisGroup.selectAll('text')
        .attr('transform', 'translate(0, 7)')
        .attr('fill', 'white');

    xAxisGroup.selectAll('line')
        .attr('stroke', 'white');

    xAxisGroup.selectAll('path.domain')
        .attr('stroke', 'white');

    yAxisGroup.selectAll('path.domain')
        .attr('stroke', 'white');

    yAxisGroup.selectAll('text')
        .attr('transform', 'translate(-5, 0)')
        .attr('fill', 'white');

    yAxisGroup.selectAll('line')
        .attr('stroke', 'white');
}

export default renderBarChart;