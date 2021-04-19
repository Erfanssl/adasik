import React from 'react';
import './Footer.scss';
import dottedCircle from '../../../../assets/circle-dotted.svg';

const Footer = () => {
    return (
        <div className="footer--container">
            <div className="footer--columns">
                <div className="footer--part-one">
                    <h3>Navigation</h3>
                    <ul>
                        <li>
                            <a href="#">Home</a>
                        </li>
                        <li>
                            <a href="#">Sign Up</a>
                        </li>
                        <li>
                            <a href="#">Login</a>
                        </li>
                        <li>
                            <a href="#">Blog</a>
                        </li>
                        <li>
                            <a href="#">Contact</a>
                        </li>
                        <li>
                            <a href="#">About</a>
                        </li>
                    </ul>
                </div>
                <div className="footer--part-two">
                    <h3>Games</h3>
                    <ul>
                        <li>
                            <a href="#">Tutorials</a>
                        </li>
                        <li>
                            <a href="#">Information</a>
                        </li>
                    </ul>
                </div>
                <div className="footer--part-three">
                    <h3>Legal</h3>
                    <ul>
                        <li>
                            <a href="#">Privacy Policy</a>
                        </li>
                        <li>
                            <a href="#">Terms of Service</a>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="footer--info">
                <h2>Adasik</h2>
                <p>Start Improving</p>
                <p>&copy; 2021</p>
                <img src={ dottedCircle } alt="circle" />
            </div>
        </div>
    );
};

export default Footer;