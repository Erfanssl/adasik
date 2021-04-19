import React, { useRef, useEffect } from 'react';
import './Header.scss';
import Button from "../../utils/Button/Button";
import Nav from "../../utils/Nav/Nav";
import Connections from "../../utils/Connections/Connections";
import SignIn from "../SignIn/SignIn";
import SignUp from "../SignUp/SignUp";

const Header = ({ signIn = false, signUp = false, handleTermsClick, handlePrivacyClick, handleAboutClick }) => {
    const container = useRef();
    const wordInside = useRef();

    function renderSignIn() {
        return (
            <div className="header--sign-in-container">
                <SignIn />
            </div>
        );
    }

    function renderSignUp() {
        return (
            <div className="header--sign-up-container">
                <SignUp />
            </div>
        );
    }

    let num = 10;
    let count = 1;
    let acc = 10;

    useEffect(() => {
        let interval;
        if (window.innerWidth >= 1100) {
            interval = setInterval(() => {
                if (wordInside?.current) {
                    wordInside.current.style.transform = `translateY(-${num}rem)`;
                    count++;
                    if (count >= 3 && acc === 10) {
                        acc = -10;
                        count = 1;
                    } else if (count >= 3 && acc === -10) {
                        acc = 10;
                        count = 1;
                    }

                    num += acc;
                }
            }, 4000);
        }

        return () => {
            clearInterval(interval);
        };
    }, [wordInside]);

    function renderHeaderInner() {
        return (
            <div className="header--inner__main">
                <p>So you wanna improve your brain!</p>
                <div className="header--inner__text-group">
                    <div className="header--inner__line-one-container">
                        <p className="the-most">The most</p>
                        <p className="an">An</p>
                        {
                            window.innerWidth >= 1100 &&
                            <div className="header--inner__outside">
                                <div ref={ wordInside } className="header--inner__inside">
                                    <p>advanced</p>
                                    <p>modern</p>
                                    <p>intelligent</p>
                                </div>
                            </div>
                        }
                        {
                            window.innerWidth < 1100 &&
                            <p className="advanced">advanced</p>
                        }
                        <p> mind games platform</p>
                    </div>
                    <p>Completely free</p>
                </div>
                <p>Create an account and start knowing yourself better!</p>
                <div className="header--inner__link-group">
                    <Button link="/sign-up" />
                    <p className="header--link__text" onClick={ handleAboutClick }>Know us better</p>
                </div>
            </div>
        );
    }

    return (
        <div style={ (signIn || signUp) ? { height: '100vh', overflowY: 'hidden' } : {} }>
            { signIn && renderSignIn() }
            { signUp && renderSignUp() }
            <header
                ref={ container }
                className="header--container__main"
                style={ (signIn || signUp) ? { filter: 'blur(.5rem)' } : {} }
            >
                <div className="header--bg__main">
                    <Connections
                        cont={ container }
                    />
                </div>
                <Nav
                    becomeTop={ true }
                    handleTermsClick={ handleTermsClick }
                    handlePrivacyClick={ handlePrivacyClick }
                    handleAboutClick={ handleAboutClick }
                />
                { renderHeaderInner() }
            </header>
        </div>
    );
};

export default Header;