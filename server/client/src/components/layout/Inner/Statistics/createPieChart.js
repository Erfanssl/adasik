import * as d3 from "d3";
import { legendColor } from "d3-svg-legend";

const sampleData = [
    {
        "name": "Win",
        "orders": 800
    },
    {
        "name": "Lose",
        "orders": 200
    },
    {
        "name": "Draw",
        "orders": 400
    }
];

function renderPieChart(games, data = sampleData, optionalDims, statistics = false) {
    if (!optionalDims && statistics) optionalDims = {
        width: games.current.offsetWidth - 120,
        height: games.current.offsetWidth - 120,
        radius: (games.current.offsetWidth - 120) / 2.5
    };

    const dims = optionalDims ? optionalDims :  { height: 460, width: 460, radius: 230 };



    const cent = { x: (dims.width / 2 + 10), y: (dims.height / 2 + 5) };

    const svg = d3.select(games.current)
        .append('svg')
        .attr('width', dims.width + 100)
        .attr('height', dims.height + 100);

    const graph = svg.append('g')
        .attr('transform', `translate(${ cent.x }, ${ cent.y })`);

    const pie = d3.pie()
        .sort(null)
        .value(d => d.orders);

    const arcPath = d3.arc()
        .outerRadius(dims.radius)
        .innerRadius(dims.radius / 2 - (dims.radius / 8)) // where should arc start in the other arc

    const color = d3.scaleOrdinal(['#6bd46b', '#ff6565', '#5eb1ef']);

    // legend setup
    const legendGroup = svg.append('g')
        .attr('transform', `translate(${ dims.width + 40 }, 10)`);

    const legend = legendColor()
        .shape('circle' /* can be a custom path */)
        .shapePadding(10)
        .scale(color);

    let total;

    // update function
    const update = data => {

        total = data.reduce((acc, el) => acc + el.orders, 0);

        // update color scale domain
        color.domain(data.map(d => d.name));

        // update and call legend
        legendGroup.call(legend);
        legendGroup.selectAll('text').attr('fill', 'white');

        // join enhanced (pie) data to path elements
        const paths = graph.selectAll('path')
            .data(pie(data));

        // handle exit selection
        paths.exit()
            .transition().duration(750)
            .attrTween('d', arcTweenExit)
            .remove();

        // handle the current DOM path updates
        paths.attr('d', arcPath)
            .transition().duration(750)
            .attrTween('d', arcTweenUpdate);

        paths.enter()
            .append('path')
            .attr('class', 'arc')
            // .attr('d', arcPath) // We don't need this anymore when we have our tween.
            .attr('stroke', '#175646')
            .attr('stroke-width', 4)
            .attr('fill', d => color(d.data.name))
            .each(function(d) { this /* reference the current path */ ._current = d })
            .transition().duration(750)
            .attrTween('d', arcTweenEnter);

        // add events
        graph.selectAll('path')
            .on('mouseover', handleMouseOver)
            .on('mouseout', handleMouseOut);
    };

    const arcTweenEnter = (d) => {
        const i = d3.interpolate(d.endAngle, d.startAngle);

        return function (t) {
            d.startAngle = i(t);
            return arcPath(d);
        }
    };

    const arcTweenExit = (d) => {
        const i = d3.interpolate(d.startAngle, d.endAngle);

        return function (t) {
            d.startAngle = i(t);
            return arcPath(d);
        }
    };

    // use function keyword to allow use of 'this'
    function arcTweenUpdate(d) {

        // interpolate between the two objects
        const i = d3.interpolate(this._current, d);

        // update the current prop with new updated data
        this._current = i(1); // or d

        return function (t) {
            return arcPath(i(t));
        }
    }

    // event handlers
    function handleMouseOver(d, i, n) {
        d3.select(this)
            .transition('changeSliceFill').duration(150)
            .attr('fill', '#fff');

        const el = document.querySelector('.games--center-text');
        el?.parentNode.removeChild(el);

        const text = ((i.data.orders / total) * 100).toFixed(0) + '%';

        svg.append('text')
            .attr('class', 'games--center-text')
            .attr('x', cent.x - text.length / 2 - 15)
            .attr('y', cent.y + 5)
            .text(text)
            .attr('fill', '#fff');
    }

    function handleMouseOut(d, i, n) {
        d3.select(this)
            .transition('changeSliceFill').duration(150)
            .attr('fill', color(i.data.name));

        const el = document.querySelector('.games--center-text');
        el.style.opacity = 0;
    }

    update(data || sampleData);
}

export default renderPieChart;