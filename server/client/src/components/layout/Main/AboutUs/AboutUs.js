import React from 'react';
import './AboutUs.scss';
import close from "../../../../assets/icons/close.svg";

const AboutUs = ({ aboutRef }) => {
    function handleCloseClick() {
        if (aboutRef && aboutRef.current) {
            aboutRef.current.classList.remove('active');
        }
    }

    return (
        <div ref={ aboutRef } className="about-us--container">
            <div className="about-us--close-container">
                <img onClick={ handleCloseClick } src={ close } alt="close" />
            </div>
            <div className="holder">
                <div className="about-us--header-container">
                    <h2>About Adasik</h2>
                    {/*<p>Let’s cut to the chase:</p>*/}
                </div>
                <div className="about-us--body-container">
                    <div className="section">
                        <h3>Mission</h3>
                        <p>The only way to become a better person is to understand who you really are right now.</p>
                        <p>At Adasik, we work hard to help people know themselves better.</p>
                        <p>We analyze two parts to achieve this: Brain and Personality.</p>
                        <p>Of course, to make Adasik more fun to use, we’ve added Messenger, ability to make friends and like them and also know about each other.</p>
                        <p>Everything we do is backed by science.</p>
                    </div>
                    <div className="section">
                        <h3>Team</h3>
                        <p>We have couple of teams to make Adasik possible:</p>
                        <ul>
                            <li>Data Analytics</li>
                            <li>Website Developers</li>
                            <li>Designers</li>
                            <li>Game Developers</li>
                            <li>Psychology Researchers</li>
                            <li>Digital Marketers</li>
                        </ul>
                        <p>If you like to join us in this amazing journey, just let us know about yourself by either contacting us with the email below or just messaging us inside your account.</p>
                        <p>E-mail: info@adasik.com</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;