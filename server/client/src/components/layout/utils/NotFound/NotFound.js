import React from 'react';
import './NotFound.scss';

const NotFound = ({ text }) => {
    return (
        <div className="not-found--container">
            <p>{ text ? text : 'Not Found!' }</p>
        </div>
    );
};

export default NotFound