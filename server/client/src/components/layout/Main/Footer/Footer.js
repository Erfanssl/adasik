import React from 'react';
import './Footer.scss';
import { Link } from "react-router-dom";
import dottedCircle from '../../../../assets/circle-dotted.svg';

const Footer = ({
                    handleTermsClick,
                    handlePrivacyClick,
                    handleAboutClick
                }) => {
    function handleAboutClickFn() {
        handleAboutClick(window.scrollY);
    }

    function handleTermsClickFn() {
        handleTermsClick(window.scrollY);
    }

    function handlePrivacyClickFn() {
        handlePrivacyClick(window.scrollY);
    }

    return (
        <div className="footer--container">
            <div className="footer--columns">
                <div className="footer--part-one">
                    <h3>Navigation</h3>
                    <ul>
                        <li>
                            <Link to="/">Home</Link>
                        </li>
                        <li>
                            <Link to="/sign-up">Sign Up</Link>
                        </li>
                        <li>
                            <Link to="/sign-in">Login</Link>
                        </li>
                        <li>
                            <p onClick={ handleAboutClickFn }>About</p>
                        </li>
                    </ul>
                </div>
                <div className="footer--part-two">
                    <h3>Games</h3>
                    <ul>
                        <li>
                            <a href="#second-container">Information</a>
                        </li>
                    </ul>
                </div>
                <div className="footer--part-three">
                    <h3>Legal</h3>
                    <ul>
                        <li>
                            <p onClick={ handlePrivacyClickFn }>Privacy Policy</p>
                        </li>
                        <li>
                            <p onClick={ handleTermsClickFn }>Terms of Service</p>
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
