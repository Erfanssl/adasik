import React, { useState, useEffect, useRef } from 'react';
import './SignUp.scss';
import { connect } from 'react-redux';
import history from "../../../../history";
import Logo from "../../utils/Logo/Logo";
import Button from "../../utils/Button/Button";
import Spinner from "../../utils/Spinner/Spinner";
import {
    authSignUpValidateEmail,
    authSignUpValidateUsername,
    authSignUpSendData,
    authSignUpWipeData
} from "../../../../actions/authAction";
import TermsOfService from "../TermsOfService/TermsOfService";
import PrivacyPolicy from "../PrivacyPolicy/PrivacyPolicy";

import close from "../../../../assets/icons/close.svg";

const SignUp = ({
                    signUpData,
                    authSignUpValidateEmail,
                    authSignUpValidateUsername,
                    authSignUpSendData,
                    authSignUpWipeData
}) => {
    const [emailInput, setEmailInput] = useState('');
    const [usernameInput, setUsernameInput] = useState('');
    const [passwordInput, setPasswordInput] = useState('');
    const [showSpinner, setShowSpinner] = useState({ show: false, type: '' });

    // errors
    const [emailError, setEmailError] = useState({ show: false, text: '' });
    const [usernameError, setUsernameError] = useState({ show: false, text: '' });
    const [passwordError, setPasswordError] = useState({ show: false, text: '' });
    const [submissionResult, setSubmissionResult] = useState({ show: false, type: '', text: '' });

    // refs
    const emailInputEl = useRef();
    const usernameInputEl = useRef();
    const passwordInputEl = useRef();
    const termsContainer = useRef();
    const privacyContainer = useRef();
    const agreeCheckBox = useRef();

    useEffect(() => {
        document.title = 'Adasik - Sign Up';

        return () => {
            authSignUpWipeData();
        };
    }, []);


    function handleCloseClick() {
        history.push('/');
    }

    useEffect(() => {
        // email
        if (signUpData && signUpData.email && signUpData.email.Error) {
            emailInputEl.current.setCustomValidity('Email is already taken');
            setEmailError({ show: true, text: 'Email is already taken' });
            setShowSpinner({ show: false, type: '' });
        }

        if (signUpData && signUpData.email && signUpData.email.valid) {
            emailInputEl.current.setCustomValidity('');
            setEmailError({ show: false, text: '' });
            setShowSpinner({ show: false, type: '' });
        }

        // username
        if (signUpData && signUpData.username && signUpData.username.Error) {
            usernameInputEl.current.setCustomValidity('Username is already taken');
            setUsernameError({ show: true, text: 'Username is already taken' });
            setShowSpinner({ show: false, type: '' });
        }

        if (signUpData && signUpData.username && signUpData.username.valid) {
            usernameInputEl.current.setCustomValidity('');
            setUsernameError({ show: false, text: '' });
            setShowSpinner({ show: false, type: '' });
        }

        // when the form submission is over
        if (signUpData && signUpData.send && signUpData.send.Error) {
            setSubmissionResult({ show: true, type: 'error', text: 'Unable to Sign Up. Please try again' });
            setShowSpinner({ show: false, type: '' });
        }

        if (signUpData && signUpData.send && signUpData.send.done) {
            setSubmissionResult({ show: true, type: 'done', text: 'Sign Up was Successful' });
            setShowSpinner({ show: false, type: '' });
            history.push('/settings');
        }
    }, [signUpData]);

    function handleEmailBlur() {
        if (!emailInput.match(/^.+@.+\.[a-z]+$/i)) {
            setEmailError({ show: true, text: 'Please enter a valid email' });
            return emailInputEl.current.setCustomValidity('Please enter a valid email');
        }

        authSignUpValidateEmail(emailInput);
        setShowSpinner({ show: true, type: 'email' });
    }

    function handleEmailFocus() {
        setEmailError({ show: false, text: '' });
    }

    function handleUsernameBlur() {
        let allowChar = false;
        let finalAllowChar = true;

        if (usernameInput.trim().length < 4 || usernameInput.trim().length > 16) {
            setUsernameError({ show: true, text: 'Should be 4 or more and 16 or less characters' });
            return usernameInputEl.current.setCustomValidity('Username Should be 4 or more and 16 or less characters');
        }

        for (let i = 0; i < usernameInput.trim().length; i++) {
            if (
                (usernameInput[i].charCodeAt(0) >= 65 && usernameInput[i].charCodeAt(0) <= 90) ||
                (usernameInput[i].charCodeAt(0) >= 97 && usernameInput[i].charCodeAt(0) <= 122)
            ) allowChar = true;
            if (usernameInput[i].charCodeAt(0) >= 48 && usernameInput[i].charCodeAt(0) <= 57) allowChar = true;
            if (usernameInput[i] === '_') allowChar = true;
            if (usernameInput[i] === '.') allowChar = true;
            if (!allowChar) {
                finalAllowChar = false;
                break;
            }
            allowChar = false;
        }

        if (!finalAllowChar) {
            setUsernameError({ show: true, text: 'only letters, numbers, period and underscore' });
            return usernameInputEl.current.setCustomValidity('Username can only contain letters, numbers, period and underscore');
        }

        authSignUpValidateUsername(usernameInput);
        setShowSpinner({ show: true, type: 'username' });
    }

    function handleUsernameFocus() {
        setUsernameError({ show: false, text: '' });
    }

    function handlePasswordBlur() {
        let passwordValidity = false;
        let hasWord = false;
        let hasNumber = false;

        if (passwordInput.trim().length < 16) passwordValidity = false;
        else {
            for (let i = 0; i < passwordInput.trim().length; i++) {
                if (passwordInput[i].charCodeAt(0) >= 48 && passwordInput[i].charCodeAt(0) <= 57) hasNumber = true;
                if (
                    (passwordInput[i].charCodeAt(0) >= 65 && passwordInput[i].charCodeAt(0) <= 90) ||
                    (passwordInput[i].charCodeAt(0) >= 97 && passwordInput[i].charCodeAt(0) <= 122)
                ) hasWord = true;

                if (hasWord && hasNumber) {
                    passwordValidity = true;
                    break;
                }
            }
        }

        if (!passwordValidity) {
            setPasswordError({ show: true, text: 'At least 16 characters with numbers and letters' });
            passwordInputEl.current.setCustomValidity('At least 16 characters with numbers and letters');
        } else passwordInputEl.current.setCustomValidity('');
    }

    function handlePasswordFocus() {
        setPasswordError({ show: false, text: '' });
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        if (agreeCheckBox && agreeCheckBox.current) {
            if (!agreeCheckBox.current.checked) {
                return setSubmissionResult({ show: true, type: 'error', text: 'You should agree with the terms and privacy policy' });
            }
        }

        setSubmissionResult({ show: false, type: '', text: '' });
        setShowSpinner({ show: true, type: 'submission' });
        authSignUpSendData({
            email: emailInput,
            username: usernameInput,
            password: passwordInput
        });
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

    return (
        <div className="sign-up--container">
            <TermsOfService termsRef={ termsContainer } />
            <PrivacyPolicy privacyRef={ privacyContainer } />
            <div onClick={ handleCloseClick } className="sign-up--close-container">
                <img src={ close } alt="close" />
            </div>
            <div className="sign-up--header-container">
                <Logo />
                <h2>Sign up and start improving</h2>
            </div>
            <form onSubmit={ handleFormSubmit }>
                <div className="input--group-container">
                    <input
                        ref={ emailInputEl }
                        onBlur={ handleEmailBlur }
                        onFocus={ handleEmailFocus }
                        onChange={ e => setEmailInput(e.target.value) }
                        type="email"
                        required
                        id="sign-up--email"
                        placeholder="Email"
                        value={ emailInput }
                    />
                    <label htmlFor="sign-up--email">Email</label>
                    {
                        emailError.show &&
                        <div className="sign-up--error">
                            <span />
                            <p>{ emailError.text }</p>
                        </div>
                    }
                    {
                        showSpinner.show && showSpinner.type === 'email' &&
                        <div className="sign-up--spinner__container">
                            <Spinner />
                        </div>
                    }
                </div>
                <div className="input--group-container">
                    <input
                        ref={ usernameInputEl }
                        type="text"
                        onFocus={ handleUsernameFocus }
                        onBlur={ handleUsernameBlur }
                        onChange={ e => setUsernameInput(e.target.value) }
                        value={ usernameInput }
                        required
                        id="sign-up--username"
                        placeholder="Username"

                    />
                    <label htmlFor="sign-up--username">Username</label>
                    {
                        usernameError.show &&
                        <div className="sign-up--error">
                            <span />
                            <p>{ usernameError.text }</p>
                        </div>
                    }
                    {
                        showSpinner.show && showSpinner.type === 'username' &&
                        <div className="sign-up--spinner__container">
                            <Spinner />
                        </div>
                    }
                </div>
                <div className="input--group-container">
                    <input
                        ref={ passwordInputEl }
                        type="password"
                        id="sign-up-password"
                        required
                        placeholder="Password"
                        onChange={ e => setPasswordInput(e.target.value) }
                        value={ passwordInput }
                        onBlur={ handlePasswordBlur }
                        onFocus={ handlePasswordFocus }
                    />
                    <label htmlFor="sign-up-password">Password</label>
                    {
                        passwordError.show &&
                        <div className="sign-up--error">
                            <span />
                            <p>{ passwordError.text }</p>
                        </div>
                    }
                </div>
                <div className="agree-to-terms--container">
                    <input ref={ agreeCheckBox } id="agree" type="checkbox" />
                    <label htmlFor="agree">
                        I have read and agree to the <span onClick={ handleTermsClick }>terms of service</span> and <span onClick={ handlePrivacyClick }>privacy policy</span>
                    </label>
                </div>
                <button type="submit">
                    <Button form={ true } text="Sign Up" />
                </button>
                <div className="sign-up--footer__container">
                    {
                        showSpinner.show && showSpinner.type === 'submission' &&
                        <div className="spinner--container">
                            <Spinner />
                        </div>
                    }
                    {
                        submissionResult.show && submissionResult.type === 'error' &&
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
        signUpData: state.auth.signUp
    };
}

export default connect(mapStateToProps, {
    authSignUpValidateEmail,
    authSignUpValidateUsername,
    authSignUpSendData,
    authSignUpWipeData
})(SignUp);