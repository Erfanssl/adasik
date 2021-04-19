import React, { useEffect, useRef } from 'react';
import './Sixth.scss';
import renderGlobe from "./renderGlobe";

const Sixth = () => {
    const globe = useRef();
    const globe2 = useRef();

    // data
    const globeOneData = useRef();
    const globeTwoData = useRef();

    useEffect(() => {
        if (window.innerWidth > 750) renderGlobe(globe.current).then(s => globeOneData.current = s);
        if (window.innerWidth <= 750) renderGlobe(globe2.current).then(s => globeTwoData.current = s);

        return () => {
            if (globeOneData && globeOneData.current) {
                globeOneData.current.stop();
            }
            if (globeTwoData && globeTwoData.current) {
                globeTwoData.current.stop();
            }
        };
    }, []);

    return (
        <div className="sixth--container">
            <div className="sixth--left-container">
                {
                    window.innerWidth > 750 &&
                    <canvas ref={ globe } id="globe" />
                }
            </div>
            <div className="sixth--right-container">
                <h2>Recognize your rivals</h2>
                {/*<h2>Know who looks like you</h2>*/}
                {
                    window.innerWidth <= 750 &&
                    <canvas ref={ globe2 } id="globe2" />
                }
                <div className="sixth--right__text">
                    <p>
                        We tell you about your top 10 rivals from all around the world;
                    </p>
                    <p>Players with nearest score in comparison to yours.</p>
                    <p>
                        Then you can know them better, contact them, or even challenge them.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Sixth;