import React, { useState, useRef, useEffect, useCallback } from 'react';
import './Conections.scss';
import particle from "../../../../assets/particle.svg";

const Connections = ({ cont: container, small = false }) => {
    const can = useRef();
    const frame = useRef();

    useEffect(() => {
        return () => {
            cancelAnimationFrame(frame.current)
        };
    }, []);

    useEffect(() => {
        if (can && can.current) {
            let canvas = can.current;

            // Adjustable variables
            const settings = {
                pointDensity: 8,
                connections: 2,
                sizeVariation: 0.01,
                velocity: 0.00003,
                maxMovement: 50,
                attractionRange: 400,
                attractionFactor: 0.06,
                imgWidth: 20,
                imgHeight: 18,
                lineColor: "rgba(255,255,255,0.4)",
                particleDensity: 0.2,
                particleChance: 0.2,
                particleVelocity: 70,
                particleColor: "rgba(255,255,255,0.8)",
                particleLength: 40,
                flashRadius: 18,
                flashOpacity: 1.6,
                flashDecay: 0.2
            }

            if (small) {
                settings.connections = 2.2;
                settings.attractionRange = 2500;
            }

            let start = null;
            let lastTimestamp = null;

            let points = [];
            let particles = [];

            const mousePoint = {x: 0, y: 0};

            const img = new Image();
            img.src = particle;

            let ctx;
            if (canvas) ctx = canvas.getContext('2d');

            // resize the canvas to fill browser window dynamically
            let resizeTimer;
            container.current.addEventListener('resize', resizeCanvas, false);

            function resizeCanvas() {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(function () {
                    canvas.width = container.current.offsetWidth;
                    canvas.height = container.current.offsetHeight;
                    createPoints();
                    drawFrame();
                }, 250);

            }

            resizeCanvas();

            createPoints();

            container.current.onmousemove = handleMouseMove;

            const anFrame1 = window.requestAnimationFrame(animate);
            frame.current = anFrame1;

            function createPoints() {
                points = [];
                particles = [];
                for (let x = 0 - 100; x < canvas.width + 100; x = x + 1000 / settings.pointDensity) {
                    for (let y = 0 - 100; y < canvas.height + 100; y = y + 1000 / settings.pointDensity) {
                        const px = Math.floor(x + Math.random() * 1000 / settings.pointDensity);
                        const py = Math.floor(y + Math.random() * 1000 / settings.pointDensity);
                        let pSizeMod;
                        if (small) {
                            pSizeMod = Math.random() * settings.sizeVariation + .3;
                        } else {
                            pSizeMod = Math.random() * settings.sizeVariation + .7;
                        }
                        const pw = settings.imgWidth * pSizeMod;
                        const ph = settings.imgHeight * pSizeMod;
                        const pAnimOffset = Math.random() * 2 * Math.PI;
                        const p = {
                            x: px,
                            originX: px,
                            y: py,
                            originY: py,
                            w: pw,
                            h: ph,
                            sizeMod: pSizeMod,
                            animOffset: pAnimOffset,
                            attraction: 0,
                            flashOpacity: 0
                        };
                        points.push(p);
                    }
                }

                // for each point find the closest points.
                for (let i = 0; i < points.length; i++) {
                    let closest = [];
                    let p1 = points[i];
                    for (let j = 0; j < points.length; j++) {
                        let p2 = points[j]
                        if (!contains(p2.closest, p1) && p1 !== p2) {
                            let placed = false;
                            for (let k = 0; k < settings.connections; k++) {
                                if (!placed && closest[k] === undefined) {
                                    closest[k] = p2;
                                    placed = true;
                                }
                            }

                            for (let k = 0; k < settings.connections; k++) {
                                if (!placed && getDistance(p1, p2) < getDistance(p1, closest[k])) {
                                    closest[k] = p2;
                                    placed = true;
                                }
                            }
                        }
                    }
                    p1.closest = closest;
                }
            }

            function animate(timestamp) {
                // Calculate frame-time
                if (!start) {
                    start = timestamp;
                    lastTimestamp = timestamp;
                }
                let elapsed = timestamp - start;
                let delta = (timestamp - lastTimestamp) / 100;
                lastTimestamp = timestamp;

                // Move points around
                for (let i = 0; i < points.length; i++) {
                    let point = points [i];

                    let attractionOffset = {x: 0, y: 0};
                    let distanceToMouse = getDistance({x: point.originX, y: point.originY}, mousePoint);
                    if (distanceToMouse <= settings.attractionRange) {
                        let displacementFactor = (Math.cos(distanceToMouse / settings.attractionRange * Math.PI) + 1) / 2 * settings.attractionFactor;
                        attractionOffset.x = displacementFactor * (mousePoint.x - point.x);
                        attractionOffset.y = displacementFactor * (mousePoint.y - point.y);
                    }

                    point.x = point.originX + Math.sin(elapsed * settings.velocity + point.animOffset) * settings.maxMovement * point.sizeMod + attractionOffset.x;
                    point.y = point.originY - Math.cos(elapsed * settings.velocity + point.animOffset) * settings.maxMovement * point.sizeMod + attractionOffset.y;

                    point.flashOpacity = Math.max(0, point.flashOpacity - settings.flashDecay * delta);
                }

                // Move particles
                for (let i = 0; i < particles.length; i++) {
                    let particle = particles[i];

                    let origin = points[particle.origin];
                    let target = origin.closest[particle.target];

                    let distance = getDistance({x: origin?.x, y: origin?.y}, {x: target?.x, y: target?.y});
                    let direction = {x: (target?.x - origin?.x) / distance, y: (target?.y - origin?.y) / distance};

                    particle.traveled += settings.particleVelocity * delta;
                    particle.direction = direction;

                    particle.x = origin.x + direction.x * particle.traveled;
                    particle.y = origin.y + direction.y * particle.traveled;

                    if (!between(origin, {x: particle.x}, target)) {
                        particles.splice(i, 1);
                        i--;
                    }

                }

                // Spawn new particles
                for (let i = 0; i < settings.particleDensity * points.length; i++) {
                    if (Math.random() < settings.particleChance * delta) {
                        const pOriginNum = Math.floor(Math.random() * points.length);
                        const pOrigin = points[pOriginNum];
                        const pTargetNum = Math.floor(Math.random() * pOrigin.closest.length);
                        const px = pOrigin.x;
                        const py = pOrigin.y;
                        const p = {
                            origin: pOriginNum,
                            target: pTargetNum,
                            x: px,
                            y: py,
                            traveled: 0,
                            direction: {x: 0, y: 0}
                        };
                        particles.push(p);
                        pOrigin.flashOpacity = settings.flashOpacity;
                    }
                }

                drawFrame();

                const anFrame2 = window.requestAnimationFrame(animate);
                frame.current = anFrame2;
            }

            function handleMouseMove(event) {
                mousePoint.x = event.pageX;
                mousePoint.y = event.pageY;
            }

            function drawFrame() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);

                for (let i = 0; i < points.length; i++) {
                    drawLines(points[i]);
                }

                for (let i = 0; i < particles.length; i++) {
                    let particle = particles[i];
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(particle.x - particle.direction.x * settings.particleLength, particle.y - particle.direction.y * settings.particleLength);
                    ctx.strokeStyle = settings.particleColor;
                    ctx.stroke();
                }

                for (let i = 0; i < points.length; i++) {
                    let point = points [i];
                    if (point.flashOpacity > 0) {
                        ctx.beginPath();
                        ctx.rect(point.x - settings.flashRadius, point.y - settings.flashRadius, settings.flashRadius * 2, settings.flashRadius * 2);
                        const gradient = ctx.createRadialGradient(point.x, point.y, settings.flashRadius, point.x, point.y, 1);
                        gradient.addColorStop(0, "rgba(255, 255, 255, 0)");
                        gradient.addColorStop(1, "rgba(255, 255, 255, " + point.flashOpacity + ")");
                        ctx.fillStyle = gradient;
                        ctx.fill();
                    }
                    ctx.drawImage(img, point.x - point.w / 2, point.y - point.h / 2, point.w, point.h);
                }
            }

            function drawLines(p) {
                for (let i in p.closest) {
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(p.closest[i].x, p.closest[i].y);
                    ctx.strokeStyle = settings.lineColor;
                    ctx.stroke();
                }
            }

            //Util
            function getDistance(p1, p2) {
                return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
            }

            function contains(a, obj) {
                if (a !== undefined) {
                    for (let i = 0; i < a.length; i++) {
                        if (a[i] === obj) {
                            return true;
                        }
                    }
                }
                return false;
            }

            function between(p1, p2, t) {
                return (p1?.x - p2?.x) * (p2?.x - t?.x) > 0;
            }
        }
    }, [can]);
    return <canvas ref={ can } />;
};

export default Connections;