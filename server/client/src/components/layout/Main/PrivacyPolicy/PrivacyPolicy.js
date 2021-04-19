import React from 'react';
import './PrivacyPolicy.scss';
import close from "../../../../assets/icons/close.svg";

const PrivacyPolicy = ({ privacyRef }) => {
    function handleCloseClick() {
        if (privacyRef && privacyRef.current) {
            privacyRef.current.classList.remove('active');
        }
    }

    return (
        <div ref={ privacyRef } className="privacy-policy--container">
            <div className="privacy-policy--close-container">
                <img onClick={ handleCloseClick } src={ close } alt="close" />
            </div>
            <div className="holder">
                <div className="privacy-policy--header-container">
                    <h2>Privacy Policy</h2>
                    <p>Let’s cut to the chase:</p>
                </div>
                <div className="privacy-policy--body-container">
                    <div className="section">
                        <h3>Information We Collect</h3>
                        <h4>About Brain and Personality</h4>
                        <p className="indent">Good statistics comes from good information. So, in order to bring you accurate and advanced statistics about you (your brain and your personality) we need to get accurate and appropriate information.</p>
                        <p className="indent">We store information about your brain base on the games you play and about your personality base on the tests you take. We also may mix that information to get better results.</p>
                        <h4>Messenger</h4>
                        <p className="indent">All of your messages get encrypted, so, even Adasik can’t see your messages.</p>
                        <h4>Other Interactions with Adasik</h4>
                        <p className="indent">Adasik uses Cookies for handling your login and also to know how much you work with Adasik    to again, get you better statistics about yourself.</p>
                    </div>
                    <div className="section">
                        <h3>Third-Party Usage</h3>
                        <p>We don’t use any third-party services to do anything for us, we do everything ourselves.</p>
                        <p>And we don’t share your information with any other services.</p>
                    </div>
                    <div className="section">
                        <h3>You Decide What Others Can See</h3>
                        <p>By default, all of your typical information will be shown into your profile and other users can see them; But you can go to your Settings and change what others can see about you.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicy;