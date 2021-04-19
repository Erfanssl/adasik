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

    function handleTermsClick() {
        if (termsContainer && termsContainer.current) {
            termsContainer.current.classList.add('active');
        }
    }

    function handlePrivacyClick() {
        if (privacyContainer && privacyContainer.current) {
            privacyContainer.current.classList.add('active');
        }
    }

    function handleAboutClick() {
        if (aboutUsContainer && aboutUsContainer.current) {
            aboutUsContainer.current.classList.add('active');
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
            <Footer />
        </div>
    );
};

export default Main;