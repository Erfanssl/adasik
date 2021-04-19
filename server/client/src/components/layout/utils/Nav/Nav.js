import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './Nav.scss';
import Logo from "../Logo/Logo";
import { fetchIsLoggedIn } from "../../../../actions/isLoggedInAction";

const Nav = ({ becomeTop = false, handleTermsClick, handlePrivacyClick, handleAboutClick, fetchIsLoggedIn, isLoggedInData }) => {
    const [showItems, setShowItems] = useState(false);

    useEffect(() => {
        fetchIsLoggedIn();
    }, []);

    // refs
    const navBtn = useRef();
    const navItems = useRef();

    function handleNavButtonClick() {
        if (showItems) setShowItems(false);
        else setShowItems(true);
    }

    useEffect(() => {
        if (showItems) {
            // means we need to give them active class
            if (navBtn && navBtn.current) navBtn.current.classList.add('active');
            if (navItems && navItems.current) navItems.current.classList.add('active');
        } else {
            // means we need to take them the active class
            if (navBtn && navBtn.current) navBtn.current.classList.remove('active');
            if (navItems && navItems.current) navItems.current.classList.remove('active');
        }
    }, [showItems]);

    return (
        <nav className="header--nav" style={ becomeTop ? { position: 'relative', zIndex: '1000' } : {} }>
            <Logo />
            <div ref={ navBtn } onClick={ handleNavButtonClick } className="nav--button">
                <div className="line" />
                <div className="line" />
                <div className="line" />
            </div>
            <div className="nav--items">
                <ul>
                    <li onClick={ handleAboutClick }>
                        About Us
                    </li>
                    <li onClick={ handleTermsClick }>
                        <p>Terms of Service</p>
                    </li>
                    <li onClick={ handlePrivacyClick }>
                        <p>Privacy Policy</p>
                    </li>
                    {
                        isLoggedInData === null &&
                        <li>
                            <p>Fetching Data...</p>
                        </li>
                    }
                    {
                        isLoggedInData === false &&
                        <>
                            <li>
                                <Link to="/sign-in">Login</Link>
                            </li>
                            <li>
                                <Link to="/sign-up">Sign Up</Link>
                            </li>
                        </>
                    }
                    {
                        isLoggedInData &&
                        <li>
                            <Link to="/dashboard">
                                Dashboard
                            </Link>
                        </li>
                    }
                </ul>
            </div>
            <div ref={ navItems } className="nav--items--two">
                <ul>
                    <li onClick={ handleAboutClick }>
                        About Us
                    </li>
                    <li onClick={ handleTermsClick }>
                        <p>Terms of Service</p>
                    </li>
                    <li onClick={ handlePrivacyClick }>
                        <p>Privacy Policy</p>
                    </li>
                    {
                        isLoggedInData === null &&
                        <li>
                            <p>Fetching Data...</p>
                        </li>
                    }
                    {
                        isLoggedInData === false &&
                        <>
                            <li>
                                <Link to="/sign-in">Login</Link>
                            </li>
                            <li>
                                <Link to="/sign-up">Sign Up</Link>
                            </li>
                        </>
                    }
                    {
                        isLoggedInData &&
                        <li>
                            <Link to="/dashboard">
                                Dashboard
                            </Link>
                        </li>
                    }
                </ul>
            </div>
        </nav>
    );
};

function mapStateToProps(state) {
    return {
        isLoggedInData: state.isLoggedIn
    };
}

export default connect(mapStateToProps, {
    fetchIsLoggedIn
})(Nav);