import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import history from "../../../../history";
import { Link } from "react-router-dom";
import io from "socket.io-client";
import './SignIn.scss';
import { connect } from 'react-redux';
import {
    authSignInSendData,
    authSignInWipeData,
    authSignInForgotValidate,
    authSignInForgotQuestions,
    authSignInForgotReset
} from "../../../../actions/authAction";
import { setIdentifier as setMainDataIdentifier } from "../../../../actions/identifierAction";
import { fetchStatusSocket } from "../../../../actions/socketsAction";

import Logo from "../../utils/Logo/Logo";
import Button from "../../utils/Button/Button";

import close from '../../../../assets/icons/close.svg';
import Spinner from "../../utils/Spinner/Spinner";
import Loading from "../../utils/Loading/Loading";

const SignIn = ({
                    signInData,
                    mainSocket,
                    identifierData,
                    setMainDataIdentifier,
                    fetchStatusSocket,
                    authSignInSendData,
                    authSignInWipeData,
                    authSignInForgotValidate,
                    authSignInForgotQuestions,
                    authSignInForgotReset
}) => {
    // states
    const [submissionResult, setSubmissionResult] = useState({ show: false, type: '', text: '' });
    const [showSpinner, setShowSpinner] = useState(false);
    const [stage, setStage] = useState('login');
    const [identifier, setIdentifier] = useState('');
    const [passwordError, setPasswordError] = useState({ show: false, text: '' });
    const [confirmPasswordError, setConfirmPasswordError] = useState(false);

    // refs
    const identifierInputEl = useRef();
    const passwordInputEl = useRef();
    const confirmPasswordInputEl = useRef();
    const answerOneInputEl = useRef();
    const answerTwoInputEl = useRef();

    useEffect(() => {
        document.title = 'Adasik - Sign In';

        return () => {
            document.title = 'Adasik';
            authSignInWipeData();
        };
    }, []);

    useEffect(() => {
        if (identifierInputEl?.current && window.innerWidth > 600) {
            identifierInputEl.current.focus();
        }
    }, [identifierInputEl]);

    useLayoutEffect(() => {
        if (identifierData && identifierData.text) {
            history.push('/dashboard');
        }
    }, [identifierData]);

    useEffect(() => {
        if (signInData) {
            if (signInData.Error) {
                setShowSpinner(false);
                setSubmissionResult({ show: true, type: 'error', text: 'Unable to sign you in. Please try again.' });
            }

            else if (signInData.InfoError) {
                setShowSpinner(false);
                setSubmissionResult({ show: true, type: 'info-error', text: 'Wrong Information provided. Please change them' });
            }

            else if (signInData.done) {
                setSubmissionResult({ show: true, type: 'success', text: 'Sign in was Successful. Redirecting...' });

                fetch('/api/get')
                    .then(res => res.json())
                    .then(data => {
                        mainSocket.emit('encryptedMessage', data);
                        const statusSocket = io.connect('/status');
                        setMainDataIdentifier(data);

                        statusSocket.on('connect', () => {
                            fetchStatusSocket(statusSocket);
                        });

                        statusSocket.emit('data', data);

                        setShowSpinner(false);

                        history.push('/dashboard');
                    })
                    .catch(err => {
                        setMainDataIdentifier({
                            FetchError: true
                        });
                    });
            }

            else if (signInData.ForgotError) {
                setShowSpinner(false);
                setSubmissionResult({ show: true, type: 'error', text: 'Unable to send your request. Please try again.' });
            }

            else if (signInData.ForgotValidationError) {
                setShowSpinner(false);
                setSubmissionResult({ show: true, type: 'info-error', text: 'Either wrong Information provided Or You didn\'t answer to your security questions' });
            }

            else if (signInData.ForgotValidationSucceed) {
                setShowSpinner(false);
                setStage('security-questions');
            }

            else if (signInData.AnswersError) {
                setShowSpinner(false);
                setSubmissionResult({ show: true, type: 'info-error', text: 'You provided wrong answer(s). Please change them' });
            }

            else if (signInData.AnswersCorrect) {
                setShowSpinner(false);
                setStage('reset-password');
            }

            else if (signInData.ResetError) {
                setShowSpinner(false);
                setSubmissionResult({ show: true, type: 'info-error', text: 'Unable to reset password. Try again' });
            }

            else if (signInData.ResetValidationError) {
                setShowSpinner(false);
                setSubmissionResult({ show: true, type: 'info-error', text: 'Password validation error' });
            }

            else if (signInData.ResetSucceed) {
                setShowSpinner(false);
                setStage('reset-done');

                setTimeout(() => {
                    setStage('login');
                }, 2000);
            }
        }
    }, [signInData]);

    function handleCloseClick() {
        history.push('/');
    }

    function handleLoginFormSubmit(e) {
        e.preventDefault();
        const data = {};

        setSubmissionResult({ show: false, type: '', text: '' });
        setShowSpinner(true);

        if (identifierInputEl && identifierInputEl.current.value.trim()) data.identifier = identifierInputEl.current.value.trim();
        if (passwordInputEl && passwordInputEl.current.value.trim()) data.password = passwordInputEl.current.value.trim();

        authSignInSendData(data);
    }

    function handleForgotPasswordClick() {
        setStage('forgot');
    }

    function renderLoginForm() {
        return (
            <form onSubmit={ handleLoginFormSubmit }>
                <div className="input--group-container">
                    <input ref={ identifierInputEl } type="text" required id="sign-in--username" placeholder="Email or Username" />
                    <label htmlFor="sign-in--username">Email or Username</label>
                </div>
                <div className="input--group-container">
                    <input ref={ passwordInputEl } type="password" id="sign-in-password" required autoComplete="true" placeholder="Password" />
                    <label htmlFor="sign-in-password">Password</label>
                </div>
                <button type="submit">
                    <Button form={ true } text="Log in" />
                </button>
                <div className="sign-in__bottom--links">
                    <p onClick={ handleForgotPasswordClick } className="sign-in--forgot__password">Forgot password</p>
                    <Link to="/sign-up" className="sign-in--sign--up">Sign Up</Link>
                </div>
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
        );
    }

    function renderForgotForm() {
        function handleForgotValidateFormSubmit(e) {
            e.preventDefault();

            setSubmissionResult({ show: false, type: '', text: '' });
            setShowSpinner(true);

            if (identifierInputEl && identifierInputEl.current.value.trim()) {
                authSignInForgotValidate(identifierInputEl.current.value.trim().toLowerCase());
                setIdentifier(identifierInputEl.current.value.trim().toLowerCase())
            }
        }

        return (
            <form onSubmit={ handleForgotValidateFormSubmit }>
                <div className="input--group-container">
                    <input ref={ identifierInputEl } type="text" required id="sign-in--username" placeholder="Email or Username" />
                    <label htmlFor="sign-in--username">Email or Username</label>
                </div>
                <button type="submit">
                    <Button form={ true } text="Continue" />
                </button>
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
        );
    }

    function renderSecurityQuestionsForm() {
        function handleForgotSecurityQuestionsFormSubmit(e) {
            e.preventDefault();

            setSubmissionResult({ show: false, type: '', text: '' });
            setShowSpinner(true);

            const data = {};

            if (answerOneInputEl && answerOneInputEl.current.value.trim()) data.answerOne = answerOneInputEl.current.value.trim().toLowerCase();
            if (answerTwoInputEl && answerTwoInputEl.current.value.trim()) data.answerTwo = answerTwoInputEl.current.value.trim().toLowerCase();
            data.identifier = identifier;

            authSignInForgotQuestions(data);
        }

        return (
            <form onSubmit={ handleForgotSecurityQuestionsFormSubmit }>
                <div className="input--group-container">
                    <p className="question">{ signInData && signInData.securityQuestions && signInData.securityQuestions.one.question }</p>
                    <input ref={ answerOneInputEl } type="text" required id="sign-in--username" placeholder="Answer" />
                    <label htmlFor="sign-in--username">Answer</label>
                </div>
                <div className="input--group-container">
                    <p className="question">{ signInData && signInData.securityQuestions && signInData.securityQuestions.two.question }</p>
                    <input ref={ answerTwoInputEl } type="text" required id="sign-in--username" placeholder="Answer" />
                    <label htmlFor="sign-in--username">Answer</label>
                </div>
                <button type="submit">
                    <Button form={ true } text="Continue" />
                </button>
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
        );
    }

    function renderResetPasswordForm() {
        function handleResetPasswordFormSubmit(e) {
            e.preventDefault();

            const data = {};

            if (passwordInputEl && passwordInputEl.current.value) data.password = passwordInputEl.current.value;
            data.identifier = identifier;

            authSignInForgotReset(data);
        }

        function handlePasswordBlur() {
            let passwordValidity = false;
            let hasWord = false;
            let hasNumber = false;
            const passwordInput = passwordInputEl.current.value;

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

        function handleConfirmPasswordBlur() {
            if (passwordInputEl.current.value !== confirmPasswordInputEl.current.value) {
                setConfirmPasswordError(true);
                passwordInputEl.current.setCustomValidity('Passwords don\'t match');
            }
        }

        function handleConfirmPasswordFocus() {
            setConfirmPasswordError(false);
        }

        return (
            <form onSubmit={ handleResetPasswordFormSubmit }>
                <div className="input--group-container">
                    <input
                        onBlur={ handlePasswordBlur }
                        onFocus={ handlePasswordFocus }
                        ref={ passwordInputEl }
                        type="password"
                        id="sign-in-password"
                        required
                        autoComplete="true"
                        placeholder="New Password"
                    />
                    <label htmlFor="sign-in-password">New Password</label>
                    {
                        passwordError.show &&
                        <div className="sign-up--error">
                            <span />
                            <p>{ passwordError.text }</p>
                        </div>
                    }
                </div>
                <div className="input--group-container">
                    <input
                        onBlur={ handleConfirmPasswordBlur }
                        onFocus={ handleConfirmPasswordFocus }
                        ref={ confirmPasswordInputEl }
                        type="password"
                        id="sign-in-confirm-password"
                        required
                        autoComplete="true"
                        placeholder="Confirm Password" />
                    <label htmlFor="sign-in-confirm-password">Confirm Password</label>
                    {
                        confirmPasswordError &&
                        <div className="sign-up--error">
                            <span />
                            <p>Passwords don't match</p>
                        </div>
                    }
                </div>
                <button type="submit">
                    <Button form={ true } text="Reset" />
                </button>
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
        );
    }

    function renderResetDone() {
        return (
            <div className="reset--done">
                Password Reset Was Successful
            </div>
        );
    }

    return (
        <div className="sign-in--container">
            { !identifierData && <Loading /> }
            {
                identifierData &&
                <div onClick={ handleCloseClick } className="sign-in--close-container">
                    <img src={ close } alt="close" />
                </div>
            }
            <div className="sign-in--header-container">
                <Logo />
                { stage === 'login' && <h2>Log in to your account</h2> }
                { stage === 'forgot' && <h2>Enter Your Username or Email</h2> }
                { stage === 'security-questions' && <h2>Answer These Questions</h2> }
                { stage === 'reset-password' && <h2>Reset Your Password</h2> }
            </div>
            { stage === 'login' && renderLoginForm() }
            { stage === 'forgot' && renderForgotForm() }
            { stage === 'security-questions' && renderSecurityQuestionsForm() }
            { stage === 'reset-password' && renderResetPasswordForm() }
            { stage === 'reset-done' && renderResetDone() }
        </div>
    );
};

function mapStateToProps(state) {
    return {
        signInData: state.auth.signIn,
        mainSocket: state.sockets.main,
        identifierData: state.identifier
    };
}

export default connect(mapStateToProps, {
    authSignInSendData,
    authSignInWipeData,
    authSignInForgotValidate,
    authSignInForgotQuestions,
    authSignInForgotReset,
    setMainDataIdentifier,
    fetchStatusSocket,
})(SignIn);
