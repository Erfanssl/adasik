import React, { useState, useEffect } from 'react';
import numberFormatter from "../../../../../utility/numberFormatter";
import rank from "../../../../../assets/icons/rank.svg";

const BoxThree = ({ score }) => {
    const [animatedScore, setAnimatedScore] = useState(0);

    useEffect(() => {
        const increment = Math.max(Math.floor(score / 50), 1);
        const interval = setInterval(() => {
            setAnimatedScore(s => {
                if ((s + increment) >= score) {
                    clearInterval(interval);
                    return score;
                }

                return s + increment;
            });

        }, 30);
    }, []);

    return (
        <div className="dashboard--box__three">
            <div className="dashboard--box__icon-container">
                <img src={ rank } alt="rank"/>
            </div>
            <div className="dashboard--score-container">
                <p className="dashboard--score__text">Universal Rank</p>
                <p className="dashboard--score__number">{ numberFormatter(animatedScore) }</p>
            </div>
        </div>
    );
};

export default BoxThree;