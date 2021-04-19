import React, { useState, useEffect } from 'react';
import numberFormatter from "../../../../../utility/numberFormatter";
import trainingScore from "../../../../../assets/icons/training-score.svg";

const BoxTwo = ({ score }) => {
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
        <div className="dashboard--box__two">
            <div className="dashboard--box__icon-container">
                <img src={ trainingScore } alt="training score"/>
            </div>
            <div className="dashboard--score-container">
                <p className="dashboard--score__text">Training Score</p>
                <p className="dashboard--score__number">{ numberFormatter(animatedScore) }</p>
            </div>
        </div>
    );
};

export default BoxTwo;