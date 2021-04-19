import React, { useState, useEffect } from 'react';
import numberFormatter from "../../../../../utility/numberFormatter";

const BoxFour = ({ level, progress, destination }) => {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const increment = Math.max(Math.floor(progress / 25), 1);
        const interval = setInterval(() => {
            setAnimatedScore(s => {
                if ((s + increment) >= progress) {
                    clearInterval(interval);
                    return progress;
                }

                return s + increment;
            });

        }, 10);
    }, []);

    const levelProgressPercentage = (animatedScore / destination) * 100;

    return (
        <div className="dashboard--box__four">
            <div className="box--four__bg" style={{ width: `${ levelProgressPercentage }%` }} />
            <div className="box--four__level-progress">
                <p>{ numberFormatter(animatedScore) + '/'}{ numberFormatter(destination) }</p>
            </div>
            <div className="dashboard--score-container">
                <p className="dashboard--score__text">Level</p>
                <p className="dashboard--score__number">{ numberFormatter(level) }</p>
            </div>
        </div>
    );
};

export default BoxFour;