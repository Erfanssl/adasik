import React, { useEffect, useRef } from 'react';
import './Third.scss';
import * as d3 from 'd3';
import { legendColor } from 'd3-svg-legend';
import createRadar from "../../Inner/Statistics/Radar/createRadar";
// import renderPieChart from "../../Inner/Statistics/createPieChart";
// import renderBarChart from "../../Inner/Statistics/createBarChart";

const data = [
    // [
    //     {axis: "Depressive", value: 0.12},
    //     {axis: "Bipolar", value: 0.18},
    //     {axis: "Self Love", value: 0.35},
    //     {axis: "Obsessive", value: 0.22},
    //     {axis: "Confidence", value: 0.52},
    //     {axis: "Social", value: 0.08},
    //     {axis: "Anxiety", value: 0.10},
    //     {axis: "Emotional", value: 0.29},
    //     {axis: "Aggressive", value: 0.19},
    //     {axis: "Introversion", value: 0.69}
    // ],
    [
        {axis: "Competence", value: 0.22},
        {axis: "Curiosity", value: 0.48},
        {axis: "Depressive", value: 0.15},
        {axis: "Obsessive", value: 0.62},
        {axis: "Confidence", value: 0.02},
        {axis: "Social", value: 0.18},
        {axis: "Stability", value: 0.18},
        {axis: "Emotional", value: 0.29},
        {axis: "Aggressive", value: 0.89},
        {axis: "Extroversion", value: 0.69}
    ],
    [
        {axis: "Competence", value: 0.12},
        {axis: "Curiosity", value: 0.88},
        {axis: "Depressive", value: 0.15},
        {axis: "Obsessive", value: 0.22},
        {axis: "Confidence", value: 0.52},
        {axis: "Social", value: 0.08},
        {axis: "Stability", value: 0.55},
        {axis: "Emotional", value: 0.89},
        {axis: "Aggressive", value: 0.19},
        {axis: "Extroversion", value: 0.19}
    ]
];

const Third = () => {
    const canvas = useRef();
    const canvas2 = useRef();
    const canvas3 = useRef();
    const canvas3Hidden = useRef();

    // handling data
    const pieChartData = useRef();
    const pieChartRender = useRef();
    const barChartData = useRef();
    const barChartRender = useRef();

    useEffect(() => {
        return () => {
            clearTimeout(pieChartData.current);
            clearTimeout(pieChartRender.current);
            clearTimeout(barChartData.current);
            clearTimeout(barChartRender.current);
        };
    }, []);

    useEffect(() => {
        if (canvas && canvas.current) {
            renderBarChart();
            renderPieChart();
        }
    }, [canvas]);

    useEffect(() => {
        createRadar(canvas3, data,'small-medium');
    }, [canvas3]);

    useEffect(() => {
        createRadar(canvas3Hidden, data,'small-medium', false, true);
    }, [canvas3Hidden]);

    // to create different data to show in diagrams
    function dataRandomizer(data, type) {
        const rand = Math.floor(Math.random() * 2);
        const newData = JSON.parse(JSON.stringify(data));

        if (type === 'pie') {
            const randomIdx = Math.floor(Math.random() * newData.length);
            newData[randomIdx].orders = Math.floor(Math.random() * 900);

        } else if (type === 'bar') {
            const randomIdx = Math.floor(Math.random() * newData.length);
            newData[randomIdx].percent = Math.floor(Math.random() * 101);
        }

        return newData;
    }

    function renderBarChart() {
        let data = [
            {
                "name": "Day 1",
                "percent": 20
            },
            {
                "name": "Day 2",
                "percent": 100
            },
            {
                "name": "Day 3",
                "percent": 30
            },
            {
                "name": "Day 4",
                "percent": 90
            },
            {
                "name": "Day 5",
                "percent": 60
            }
        ];

        // select the svg container first
        const svg = d3.select(canvas.current)
            .append('svg')
            .attr('width', 325)
            .attr('height', 325);

        // create margins and dimensions
        const margin = { top: 10, right: 10, bottom: 60, left: 65 };
        const graphWidth = 325 - margin.left - margin.right;
        const graphHeight = 325 - margin.top - margin.bottom;

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

        const t = d3.transition().duration(1500);

        // update function
        const update = (data) => {
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
                .attr('fill', 'url(#third--diagram__gr)')
                .attr('x', d => x(d.name))
                .transition().duration(1500)
                .attr('ry', '2%')
                .attrTween('width', widthTween)
                .attr('y', d => y(d.percent))
                .attr('height', d => graphHeight - y(d.percent));

            // enter selection
            rects.enter()
                .append('rect')
                .attr('height', 0)
                .attr('width', x.bandwidth)
                .attr('fill', 'url(#third--diagram__gr)')
                .attr('x', d => x(d.name))
                .attr('y', graphHeight)
                .attr('ry', '2%')
                .merge(rects) // means merge it to the rects object in the DOM
                .transition().duration(1500)
                .attrTween('width', widthTween)
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

        };

        function renderChangedData() {
            data = dataRandomizer(data, 'bar');
        }

        function changeData() {
            const timeout = setTimeout(changeData, 2500);
            barChartData.current = timeout;
            renderChangedData();
        }

        changeData();

        let arr = [];

        function socket() {
            if (data.length !== arr.length) {
                arr = JSON.parse(JSON.stringify(data));
                return update(data);
            }

            let count = 0;
            while (count < data.length) {
                if (arr[count].percent !== data[count].percent) {

                    arr = JSON.parse(JSON.stringify(data));
                    return update(data);
                }
                count++;
            }
        }

        function updateData() {
            const timeout = setTimeout(updateData, 2000);
            barChartRender.current = timeout;
            socket();
        }

        updateData();

        // TWEENS
        const widthTween = d => {

            // define interpolation
            // d3.interpolate returns a function which we call 'i'
            let i = d3.interpolate(0, x.bandwidth());

            // return a function which takes in a time ticker 't'
            return function (t) {

                // return the value from passing the ticker into the interpolation
                return i(t);
            }
        };

    }

    function renderPieChart() {
        let data = [
            {
                "name": "Memory",
                "orders": 200
            },
            {
                "name": "Speed",
                "orders": 600
            },
            {
                "name": "Attention",
                "orders": 300
            },
            {
                "name": "Flexibility",
                "orders": 900
            },
            {
                "name": "Accuracy",
                "orders": 1500
            }
        ];

        const dims = { height: 300, width: 300, radius: 150 };
        const cent = { x: (dims.width / 2 + 5), y: (dims.height / 2 + 5) };

        const svg = d3.select(canvas2.current)
            .append('svg')
            .attr('width', dims.width + 140)
            .attr('height', dims.height + 140);

        const graph = svg.append('g')
            .attr('transform', `translate(${ cent.x }, ${ cent.y })`);

        const pie = d3.pie()
            .sort(null)
            .value(d => d.orders);

        const arcPath = d3.arc()
            .outerRadius(dims.radius)
            .innerRadius(dims.radius / 2 - (dims.radius / 8)) // where should arc start in the other arc

        const color = d3.scaleOrdinal(d3['schemeSet3']);

        // legend setup
        const legendGroup = svg.append('g')
            .attr('transform', `translate(${ dims.width + 40 }, 10)`);

        const legend = legendColor()
            .shape('circle' /* can be a custom path */)
            .shapePadding(10)
            .scale(color);

        // update function
        const update = data => {

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
                .on('mouseover', (d, i, n) => {
                    handleMouseOver(d, i, n);
                })
                .on('mouseout', (d, i, n) => {
                    handleMouseOut(d, i, n);
                });
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
        const handleMouseOver = (d, i, n) => {
            d3.select(this)
                .transition('changeSliceFill').duration(300)
                .attr('fill', '#fff');
        };

        const handleMouseOut = (d, i, n) => {
            d3.select(this)
                .transition('changeSliceFill').duration(300)
                .attr('fill', 'blue');
                // .attr('fill', color(d.data.name));
        };

        let arr = [];

        function socket() {
            if (data.length !== arr.length) {
                arr = JSON.parse(JSON.stringify(data));
                return update(data);
            }

            let count = 0;
            while (count < data.length) {
                if (arr[count].orders !== data[count].orders) {
                    arr = JSON.parse(JSON.stringify(data));
                    return update(data);
                }
                count++;
            }
        }

        function renderChangedData() {
            data = dataRandomizer(data, 'pie');
        }

        function changeData() {
            const timeout = setTimeout(changeData, 2500);
            pieChartData.current = timeout;
            renderChangedData();
        }

        changeData();

        function updateData() {
            const timeout = setTimeout(updateData, 1000);
            pieChartRender.current = timeout;
            socket();
        }

        updateData();
    }

    return (
        <div className="third--container">
            <div className="third--right-side">
                <svg style={{ transform: 'scale(.9) translateX(5.5%)' }} version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 1000 1470">
                    <linearGradient id="third--svg__gr" gradientUnits="userSpaceOnUse" x1="499.7742" y1="1396.9193" x2="499.7742" y2="11.8453">
                        <stop  offset="0" style={{ stopColor: '#55efc4' }} />
                        <stop  offset="0.2412" style={{ stopColor: '#288069' }} />
                        <stop  offset="0.3742" style={{ stopColor: '#136e54' }} />
                        <stop  offset="0.5326" style={{ stopColor: '#064130' }} />
                        <stop  offset="1" style={{ stopColor: '#000000' }} />
                    </linearGradient>
                    <linearGradient id="third--diagram__gr" gradientUnits="userSpaceOnUse" x1="499.7742" y1="1396.9193" x2="499.7742" y2="11.8453">
                        <stop offset="0%" style={{ stopColor: '#ffffff' }} />
                        <stop offset="50%" style={{ stopColor: '#ffffff' }} />
                        <stop offset="60%" style={{ stopColor: '#ffffff' }} />
                        <stop offset="100%" style={{ stopColor: '#55EFC4' }} />
                    </linearGradient>
                    <path
                        fill="url(#third--svg__gr)"
                        d="M62,574c0,0-22.44,12.38-30.56,18.76c-0.66,0.63-1.57,1.51-2.84,2.73C19.29,604.41,7.97,620.76,4,635
	c-4.53,16.26-1.03,33.49,2.48,50.42c0.71,3.4,1.54,6.93,2.52,10.58c15,56,102,389,102,389l12,28c0,0,9.35,14.68,16,22
	c2.75,2.53,9.12,7.38,15,12c4.54,3.56,8.9,7.18,10.41,8.22L167,1157l13,7l32,12l788,236V36L62,574z"
                    />
                </svg>
                <div ref={ canvas } className="third--bar-chart" />
                <div ref={ canvas2 } className="third--pie-chart" />
                <div ref={ canvas3 } className="third--radar-chart" />
            </div>
            <div className="third--left-side">
                <h2 className="third--left__header">Monitor Your Progress</h2>
                <div ref={ canvas3Hidden } className="third--radar-chart--two" />
                <div className="third--left__text">
                    <p>How can you know if you're progressing?</p>
                    <p>Of course; With monitoring your results and comparing them.</p>
                    <p>We give you the tools you need to achieve that and show you your activities statistics in some charming diagrams.</p>
                </div>
            </div>
        </div>
    );
};

export default Third;

