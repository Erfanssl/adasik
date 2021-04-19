import * as d3 from 'd3';
import * as topojson from "topojson-client";
import globeJsonData from './globeJsonData';
import globeTsvData from './globeTsvData';

function renderGlobe(ref) {
    // Configuration
    // scale of the globe (not the canvas element)
    const scaleFactor = 0.9;
    // autorotation speed
    const degPerSec = 6;
    // start angles
    const angles = { x: -20, y: 40, z: 0 };
    // colors
    const colorWater = '#0ab3d2';
    const colorLand = '#982B00';
    const colorGraticule = '#ccc';
    const colorCountry = '#a863ec';

    // Variables
    const canvas = d3.select(ref);
    const context = canvas.node().getContext('2d');
    const water = { type: 'Sphere' };
    const projection = d3.geoOrthographic().precision(0.1);
    const graticule = d3.geoGraticule10();
    const path = d3.geoPath(projection).context(context);
    const degPerMs = degPerSec / 1000;
    let lastTime = d3.now();
    let width;
    let height;
    let land;
    let countries
    let countryList;
    let autorotate;
    let now;
    let diff;
    let currentCountry;

    // Functions
    function setAngles() {
        const rotation = projection.rotate();
        rotation[0] = angles.y;
        rotation[1] = angles.x;
        rotation[2] = angles.z;
        projection.rotate(rotation);
    }

    function scale() {
        width = document.querySelector('.sixth--left-container').offsetWidth || document.querySelector('.sixth--right-container').offsetWidth / 2;
        height = document.querySelector('.sixth--left-container').offsetHeight || document.querySelector('.sixth--right-container').offsetHeight / 2;
        canvas.attr('width', width).attr('height', height);
        projection
            .scale((scaleFactor * Math.min(width, height)) / 2)
            .translate([width / 2, height / 2]);
        render();
    }

    function render() {
        context.clearRect(0, 0, width, height);
        fill(water, colorWater);
        stroke(graticule, colorGraticule);
        fill(land, colorLand);
        if (currentCountry) {
            fill(currentCountry, colorCountry);
        }
    }

    function fill(obj, color) {
        context.beginPath();
        path(obj);
        context.fillStyle = color;
        context.fill();
    }

    function stroke(obj, color) {
        context.beginPath();
        path(obj);
        context.strokeStyle = color;
        context.stroke();
    }

    function rotate(elapsed) {
        now = d3.now();
        diff = now - lastTime;
        if (diff < elapsed) {
            const rotation = projection.rotate();
            rotation[0] += diff * degPerMs;
            projection.rotate(rotation);
            render();
        }
        lastTime = now;
    }

    function loadData(cb) {
        cb(globeJsonData, globeTsvData);
    }

    function polygonContains(polygon, point) {
        const n = polygon.length;
        let p = polygon[n - 1];
        const x = point[0], y = point[1];
        let x0 = p[0], y0 = p[1];
        let x1;
        let y1;
        let inside = false;
        for (let i = 0; i < n; ++i) {
            p = polygon[i];
            x1 = p[0];
            y1 = p[1];
            if (((y1 > y) !== (y0 > y)) && (x < (x0 - x1) * (y - y1) / (y0 - y1) + x1)) inside = !inside;
            x0 = x1;
            y0 = y1;
        }
        return inside;
    }

    function mousemove(e) {
        const c = getCountry(e);
        if (!c) {
            if (currentCountry) {
                currentCountry = undefined;
                render();
            }
            return;
        }
        if (c === currentCountry) {
            return;
        }
        currentCountry = c;
        render();
    }

    function getCountry(event) {
        const pos = projection.invert(d3.pointer(event, event.target));
        return countries.features.find(function (f) {
            return f.geometry.coordinates.find(function (c1) {
                return polygonContains(c1, pos) || c1.find(function (c2) {
                    return polygonContains(c2, pos);
                });
            });
        });
    }

    // Initialization
    setAngles();

    canvas.on('mousemove', mousemove);

    return new Promise((resolve, reject) => {
        loadData(function (world, cList) {
            land = topojson.feature(world, world.objects.land);
            countries = topojson.feature(world, world.objects.countries);
            countryList = cList;

            window.addEventListener('resize', scale);
            scale();
            autorotate = d3.timer(rotate);
            resolve(autorotate);
        });
    });
}

export default renderGlobe;