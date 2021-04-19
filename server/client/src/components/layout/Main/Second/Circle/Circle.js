import React from 'react';
import './Circle.scss';

const Circle = ({ children }) => {
    return (
        <div className="circle--item-container">
            { children }
        </div>
    );
};

export default Circle;