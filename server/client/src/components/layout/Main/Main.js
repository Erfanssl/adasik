import React, { useEffect, useRef } from 'react';
import Header from "./Header/Header";
import Second from "./Second/Second";
import Third from "./Third/Third";
import Fourth from "./Fourth/Fourth";
import Fifth from "./Fifth/Fifth";
import Sixth from "./Sixth/Sixth";
import Seventh from "./Seventh/Seventh";
import Footer from "./Footer/Footer";
import TermsOfService from "./TermsOfService/TermsOfService";
import PrivacyPolicy from "./PrivacyPolicy/PrivacyPolicy";
import AboutUs from "./AboutUs/AboutUs";

import pageViewSocketConnection from "../../../utility/pageViewSocketConnection";

const Main = ({ signIn, signUp }) => {

    // refs
    const termsContainer = useRef();
    const privacyContainer = useRef();
    const aboutUsContainer = useRef();

    useEffect(() => {
        const pageViewSocket = pageViewSocketConnection();
        document.title = 'Adasik';

        return () => {
            pageViewSocket.disconnect();
        };
    }, []);

    if (signIn) {
        return (
            <div className="main-container">
                <Header signIn={ true } />
            </div>
        );
    }

    if (signUp) {
        return (
            <div className="main-container">
                <Header signUp={ true } />
            </div>
        );
    }

    function handleTermsClick(scrollY) {
        if (termsContainer && termsContainer.current) {
            termsContainer.current.classList.add('active');

            if (scrollY) {
                termsContainer.current.style.top = scrollY + (termsContainer?.current.offsetHeight / 1.5) + 'px';
            }
        }
    }

    function handlePrivacyClick(scrollY) {
        if (privacyContainer && privacyContainer.current) {
            privacyContainer.current.classList.add('active');

            if (scrollY) {
                privacyContainer.current.style.top = scrollY + (privacyContainer?.current.offsetHeight / 1.5) + 'px';
            }
        }
    }

    function handleAboutClick(scrollY) {
        if (aboutUsContainer && aboutUsContainer.current) {
            aboutUsContainer.current.classList.add('active');

            if (scrollY) {
                aboutUsContainer.current.style.top = scrollY + (aboutUsContainer?.current.offsetHeight / 1.5) + 'px';
            }
        }
    }

    return (
        <div className="main-container">
            <TermsOfService termsRef={ termsContainer } />
            <PrivacyPolicy privacyRef={ privacyContainer } />
            <AboutUs aboutRef={ aboutUsContainer } />
            <Header
                handleTermsClick={ handleTermsClick }
                handlePrivacyClick={ handlePrivacyClick }
                handleAboutClick={ handleAboutClick }
            />
            <Second />
            <Third />
            <Fourth />
            <Fifth />
            <Sixth />
            <Seventh />
            <Footer
                handleTermsClick={ handleTermsClick }
                handlePrivacyClick={ handlePrivacyClick }
                handleAboutClick={ handleAboutClick }
            />
        </div>
    );
};

export default Main;
