import * as d3 from "d3";

const fakeData = [
    {name: 'games', parent: ''},

    {name: 'memory', parent: 'games'},
    {name: 'You\'ve Played no Games', parent: 'memory', amount: 100}
];

function renderDataHierarchy(strength, data = fakeData, statistics = false) {

    let width = strength.current.offsetWidth;

    // create svg
    const svg = d3.select(strength.current)
        .append('svg')
        .attr('width', width)
        .attr('height', width);

    // create graph group
    const graph = svg.append('g')
        .attr('transform', 'translate(50, 40)') // to give a 50px margin


    // create stratify
    const stratify = d3.stratify()
        .id(d => d.name)
        .parentId(d => d.parent);

    const pack = d3.pack()
        .size([width - 100, width - 100]) // dimension of the bubble pack
        .padding(5);

    const rootNode = stratify(data)
        .sum(d => d.amount);

    const bubbleData = pack(rootNode).descendants();

    // create ordinal scale
    const color = d3.scaleOrdinal(['rgba(31,229,212, .4)', 'rgba(31,229,189, .4)', 'rgba(11,255,227, .4)']);

    // join data and add group for each node
    const nodes = graph.selectAll('g')
        .data(bubbleData)
        .enter()
        .append('g')
        .attr('transform', d => `translate(${ d.x }, ${ d.y })`);

    nodes.append('circle')
        .attr('r', d => d.r)
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .attr('fill', d => color(d.depth));

    function valueNormalizer(val) {
        return Math.min(val / 10, 3.5);
    }

    nodes.filter(d => !d.children)
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .attr('fill', 'white')
        .style('font-size', d => { return valueNormalizer(d.value) + 'rem' })
        .text(d => d.data.name);
}

export default renderDataHierarchy;