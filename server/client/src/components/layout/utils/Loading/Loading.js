import React from 'react';
import './Loading.scss';

const Loading = ({ text = 'Loading...' }) => {
    return (
        <div className="loading--container">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.1" className="loading" width="0" height="0">
                <defs>
                    <filter id="goo">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur"/>
                        <feColorMatrix in="blur" mode="matrix"
                                       values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 35 -10" result="goo"/>
                        <feBlend in="SourceGraphic" in2="goo" operator="atop"/>
                    </filter>
                </defs>
            </svg>
            <div className="loader">
                <div />
                <div />
                <div />
                <div />
                <div />
            </div>
            <p>{ text }</p>
        </div>
    );
};

export default Loading;