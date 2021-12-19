import React, { useState, useEffect, useRef } from 'react';
import './AboutUs.scss';
import { connect } from 'react-redux';
import { joinUsSendData } from "../../../../actions/joinUsAction";
import close from "../../../../assets/icons/close.svg";
import Button from "../../utils/Button/Button";
import Spinner from "../../utils/Spinner/Spinner";

const AboutUs = ({
                     joinUsData,
                     aboutRef,
                     joinUsSendData
                 }) => {
    // state
    const [showSpinner, setShowSpinner] = useState(false);

    // refs
    const nameInputEl = useRef();
    const messageInputEl = useRef();

    function handleCloseClick() {
        if (aboutRef && aboutRef.current) {
            aboutRef.current.classList.remove('active');
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();

        const data = {};

        if (nameInputEl && nameInputEl.current && nameInputEl.current.value) data.name = nameInputEl.current.value;
        if (messageInputEl && messageInputEl.current && messageInputEl.current.value) data.message = messageInputEl.current.value;

        setShowSpinner(true);
        joinUsSendData(data);
    }

    useEffect(() => {
        if (joinUsData && joinUsData.Error) setShowSpinner(false);

        if (joinUsData && joinUsData.done) {
            setShowSpinner(false);
            nameInputEl.current.value = '';
            messageInputEl.current.value = '';
        }
    }, [joinUsData]);

    return (
        <div ref={ aboutRef } className="about-us--container">
            <div className="about-us--close-container">
                <img onClick={ handleCloseClick } src={ close } alt="close" />
            </div>
            <div className="holder">
                <div className="about-us--header-container">
                    <h2>About Adasik</h2>
                    {/*<p>Lets cut to the chase:</p>*/}
                </div>
                <div className="about-us--body-container">
                    <div className="section">
                        <h3>Mission</h3>
                        <p>The only way to become a better person is to understand who you really are right now.</p>
                        <p>At Adasik, we work hard to help people know themselves better.</p>
                        <p>We analyze two parts to achieve this: Brain and Personality.</p>
                        <p>Of course, to make Adasik more fun to use, we've added Messenger, ability to make friends and like them and also know about each other.</p>
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
                        <p>If you like to join us in this amazing journey, just let us know about yourself by either contacting us with the form below or just messaging us inside your account.</p>
                        <form onSubmit={ handleFormSubmit }>
                            <input ref={ nameInputEl } type="text" placeholder="Name" required />
                            <textarea ref={ messageInputEl } id="" cols="30" rows="10" placeholder="Message" required />
                            <button type="submit">
                                <Button form={ true } text="Submit" />
                            </button>
                            { showSpinner && <div className="spinner--container"><Spinner /></div> }
                            { joinUsData && (!joinUsData.done && !joinUsData.Error && !showSpinner) && <p>Message was sent successfully</p> }
                            { joinUsData && joinUsData.done && !showSpinner && <p className="success">Message was sent successfully</p> }
                            { joinUsData && joinUsData.Error && !showSpinner && <p className="error">Unable to send message. Try again</p> }
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

function mapStateToProps(state) {
    return {
        joinUsData: state.joinUs
    };
}

export default connect(mapStateToProps, { joinUsSendData })(AboutUs);
