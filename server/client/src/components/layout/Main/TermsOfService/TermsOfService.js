import React from 'react';
import './TermsOfService.scss';
import close from "../../../../assets/icons/close.svg";

const TermsOfService = ({ termsRef }) => {
    function handleCloseClick() {
        if (termsRef && termsRef.current) {
            termsRef.current.classList.remove('active');
        }
    }

    return (
        <div ref={ termsRef } className="terms-of-service--container">
            <div className="terms-of-service--close-container">
                <img onClick={ handleCloseClick } src={ close } alt="close" />
            </div>
            <div className="holder">
                <div className="terms-of-service--header-container">
                    <h2>Terms of Service</h2>
                    <p>Let’s cut to the chase:</p>
                </div>
                <div className="terms-of-service--body-container">
                    <div className="section">
                        <h3>Age Restrictions</h3>
                        <p>In Adasik, Games are suitable for all ages.</p>
                        <p>For using features like Messenger or make Friendship with others; You must have at least 13 years old.</p>
                        <p>Tests also suitable for all ages, but we recommend you to have at least 13 – 18 years old to get the best result.</p>
                        <p>For participating in the challenges and competitions, you must have at least 18 years old or (13 with parental consent.)</p>
                    </div>
                    <div className="section">
                        <h3>Third-Party Usage</h3>
                        <p>We don’t use any third-party services to do anything for us, we do everything ourselves.</p>
                    </div>
                    <div className="section">
                        <h3>Account Creation and Deletion</h3>
                        <p>When you create an account. We want to you to complete some information about yourself. In order to get the appropriate results, you should provide the correct information.</p>
                        <p>Anytime you felt like you don’t want to continue with Adasik, you can simply go to your account’s Settings -> Other then, in the Account section, hit the “Delete Account” button.</p>
                    </div>
                    <div className="section">
                        <h3>Users’ Rights</h3>
                        <p>Users should be nice to each other, If other users report a user or users frequently, we will investigate the reason and if there were any real problem, we will ban that user’s account temporarily or permanently.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsOfService;