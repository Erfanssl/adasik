import React from 'react';
import './Logo.scss';
import { Link } from 'react-router-dom';
import adasikLogo from '../../../../assets/adasik-logo-small.png';
import adasikLogoBig from '../../../../assets/adasik-logo-big.png';

const Logo = ({ extraClass }) => {
    return (
        <div className={ "nav--logo" + (extraClass ? (" " + extraClass) : "") }>
            <Link to="/">
                <img src={ adasikLogo } alt="Adasik" />
            </Link>
            <h1>
                <Link to="/">Adasik</Link>
            </h1>
        </div>
    );
};

export default Logo;