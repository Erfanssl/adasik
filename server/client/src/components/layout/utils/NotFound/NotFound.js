import React from 'react';
import './NotFound.scss';
import Logo from "../Logo/Logo";

const NotFound = ({ text, showLogo = false }) => {
    return (
        <div className="not-found--container">
            { showLogo && <Logo onlyImg={ true } /> }
            <p>{ text ? text : 'Not Found!' }</p>
        </div>
    );
};

export default NotFound
