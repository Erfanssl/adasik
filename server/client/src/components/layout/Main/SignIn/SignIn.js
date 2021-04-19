import React, { useState, useEffect, useRef } from 'react';
import history from "../../../../history";
import './SignIn.scss';
import { Link } from "react-router-dom";
import { connect } from 'react-redux';
import {
    authSignInSendData,
    authSignInWipeData
} from "../../../../actions/authAction";
import Logo from "../../utils/Logo/Logo";
import Button from "../../utils/Button/Button";


import close from '../../../../assets/icons/close.svg';
import Spinner from "../../utils/Spinner/Spinner";

const SignIn = ({
                    signInData,
                    authSignInSendData,
                    authSignInWipeData
}) => {
    // states
    const [submissionResult, setSubmissionResult] = useState({ show: false, type: '', text: '' });
    const [showSpinner, setShowSpinner] = useState(false);

    // refs
    const identifierInputEl = useRef();
    const passwordInputEl = useRef();

    useEffect(() => {
        document.title = 'Adasik - Sign In';

        return () => {
            authSignInWipeData();
        };
    }, []);

    useEffect(() => {
        if (signInData) {
            if (signInData.Error) {
                setShowSpinner(false);
                setSubmissionResult({ show: true, type: 'error', text: 'Unable to sign you in. Please try again.' });
            }

            if (signInData.InfoError) {
                setShowSpinner(false);
                setSubmissionResult({ show: true, type: 'info-error', text: 'Wrong Information provided. Please change them' });
            }

            if (signInData.done) {
                setShowSpinner(false);
                setSubmissionResult({ show: true, type: 'success', text: 'Sign in was Successful' });
                history.push('/dashboard');
            }
        }
    }, [signInData]);

    function handleCloseClick() {
        history.push('/');
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        const data = {};

        setSubmissionResult({ show: false, type: '', text: '' });
        setShowSpinner(true);

        if (identifierInputEl && identifierInputEl.current.value.trim()) data.identifier = identifierInputEl.current.value;
        if (passwordInputEl && passwordInputEl.current.value.trim()) data.password = passwordInputEl.current.value;

        authSignInSendData(data);
    }

    return (
        <div className="sign-in--container">
            <div onClick={ handleCloseClick } className="sign-in--close-container">
                <img src={ close } alt="close" />
            </div>
            <div className="sign-in--header-container">
                <Logo />
                <h2>Log in to your account</h2>
            </div>
            <form onSubmit={ handleFormSubmit }>
                <div className="input--group-container">
                    <input ref={ identifierInputEl } type="text" required id="sign-in--username" placeholder="Phone number, Email or Username" />
                    <label htmlFor="sign-in--username">Phone number, Email or Username</label>
                </div>
                <div className="input--group-container">
                    <input ref={ passwordInputEl } type="password" id="sign-in-password" required autoComplete="true" placeholder="Password" />
                    <label htmlFor="sign-in-password">Password</label>
                </div>
                <button type="submit">
                    <Button form={ true } text="Log in" />
                </button>
                {/*<Link className="sign-in--forgot__password" to="/sign-in/forgot-password">Forgot password</Link>*/}
                <div className="sign-in--footer__container">
                    {
                        showSpinner &&
                        <div className="spinner--container">
                            <Spinner />
                        </div>
                    }
                    {
                        submissionResult.show && submissionResult.type === 'error' &&
                        <div className="submission--error">{ submissionResult.text }</div>
                    }
                    {
                        submissionResult.show && submissionResult.type === 'info-error' &&
                        <div className="submission--error">{ submissionResult.text }</div>
                    }
                    {
                        submissionResult.show && submissionResult.type === 'done' &&
                        <div className="submission--success">{ submissionResult.text }</div>
                    }
                </div>
            </form>
        </div>
    );
};

function mapStateToProps(state) {
    return {
        signInData: state.auth.signIn
    };
}

export default connect(mapStateToProps, {
    authSignInSendData,
    authSignInWipeData
})(SignIn);