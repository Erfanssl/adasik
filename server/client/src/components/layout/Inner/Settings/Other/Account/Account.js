import React, { useState, useEffect, useRef } from 'react';
import './Account.scss';
import { connect } from 'react-redux';
import Button from "../../Button/Button";
import {
    fetchSettingsOtherAccountData,
    sendSettingsOtherAccountEmail,
    sendSettingsOtherAccountUsername,
    sendSettingsOtherAccountPassword,
    settingsOtherAccountDeleteAccount
} from "../../../../../../actions/settingsAction";
import {
    authSignUpValidateEmail,
    authSignUpValidateUsername
} from "../../../../../../actions/authAction";
import Loading from "../../../../utils/Loading/Loading";
import Spinner from "../../../../utils/Spinner/Spinner";
import history from "../../../../../../history";

const Account = ({
                     accountData,
                     fetchSettingsOtherAccountData,
                     authSignUpValidateEmail,
                     sendSettingsOtherAccountEmail,
                     sendSettingsOtherAccountUsername,
                     sendSettingsOtherAccountPassword,
                     authSignUpValidateUsername,
                     settingsOtherAccountDeleteAccount
}) => {
    // states
    const [emailInput, setEmailInput] = useState('');
    const [usernameInput, setUsernameInput] = useState('');
    const [oldPasswordInput, setOldPasswordInput] = useState('');
    const [newPasswordInput, setNewPasswordInput] = useState('');
    const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
    const [showSpinner, setShowSpinner] = useState({ show: false, type: '' });
    const [emailSubmissionResult, setEmailSubmissionResult] = useState({ show: false, type: '', text: '' });
    const [usernameSubmissionResult, setUsernameSubmissionResult] = useState({ show: false, type: '', text: '' });
    const [passwordSubmissionResult, setPasswordSubmissionResult] = useState({ show: false, type: '', text: '' });
    const [accountDeletionResult, setAccountDeletionResult] = useState({ show: false, type: '', text: '' });
    const [popUpConfig, setPopUpConfig] = useState({ show: false, type: '' });
    const [scrollY, setScrollY] = useState(0);


    // errors
    const [emailError, setEmailError] = useState({ show: false, text: '' });
    const [usernameError, setUsernameError] = useState({ show: false, text: '' });
    const [oldPasswordError, setOldPasswordError] = useState({ show: false, text: '' });
    const [newPasswordError, setNewPasswordError] = useState({ show: false, text: '' });
    const [confirmPasswordError, setConfirmPasswordError] = useState({ show: false, text: '' });

    // refs
    const emailInputEl = useRef();
    const usernameInputEl = useRef();
    const oldPasswordInputEl = useRef();
    const newPasswordInputEl = useRef();
    const confirmPasswordInputEl = useRef();
    const popUpCardContainer = useRef();

    useEffect(() => {
        fetchSettingsOtherAccountData();
    }, []);

    useEffect(() => {
        if (accountData && accountData.email && !accountData.validity) {
            setEmailInput(accountData.email);
        }

        if (accountData && accountData.username && !accountData.validity) {
            setUsernameInput(accountData.username);
        }

        if (accountData && accountData.validity && accountData.validity.email === 'invalid') {
            emailInputEl.current.setCustomValidity('Email is already taken');
            setEmailError({ show: true, text: 'Email is already taken' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.validity && accountData.validity.email === 'valid') {
            emailInputEl.current.setCustomValidity('');
            setEmailError({ show: false, text: '' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.validity && accountData.validity.username === 'invalid') {
            usernameInputEl.current.setCustomValidity('Username is already taken');
            setUsernameError({ show: true, text: 'Username is already taken' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.validity && accountData.validity.username === 'valid') {
            usernameInputEl.current.setCustomValidity('');
            setUsernameError({ show: false, text: '' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.validity && accountData.validity.password === 'invalid') {
            newPasswordInputEl.current.setCustomValidity('At least 16 characters with numbers and letters');
            setNewPasswordError({ show: true, text: 'At least 16 characters with numbers and letters' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.validity && accountData.validity.password === 'incorrect') {
            oldPasswordInputEl.current.setCustomValidity('Password is incorrect');
            setOldPasswordError({ show: true, text: 'Password is incorrect' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.validity && accountData.validity.password === '') {
            oldPasswordInputEl.current.setCustomValidity('');
            setOldPasswordError({ show: false, text: '' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.submission && accountData.submission.email === 'fail') {
            setEmailSubmissionResult({ show: true, type: 'error', text: 'Unable to change the email. Try again.' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.submission && accountData.submission.email === 'done') {
            setEmailSubmissionResult({ show: true, type: 'success', text: 'Email was changed successfully.' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.submission && accountData.submission.email === '') {
            setEmailSubmissionResult({ show: false, type: '', text: '' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.submission && accountData.submission.username === 'fail') {
            setUsernameSubmissionResult({ show: true, type: 'error', text: 'Unable to change the username. Try again.' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.submission && accountData.submission.username === 'done') {
            setUsernameSubmissionResult({ show: true, type: 'success', text: 'Username was changed successfully.' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.submission && accountData.submission.username === '') {
            setUsernameSubmissionResult({ show: false, type: '', text: '' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.submission && accountData.submission.password === 'fail') {
            setPasswordSubmissionResult({ show: true, type: 'error', text: 'Unable to change the password. Try again.' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.submission && accountData.submission.password === 'done') {
            setPasswordSubmissionResult({ show: true, type: 'success', text: 'Password was changed successfully.' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.submission && accountData.submission.password === '') {
            setPasswordSubmissionResult({ show: false, type: '', text: '' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.submission && accountData.submission.deleteAccount === 'fail') {
            setAccountDeletionResult({ show: true, type: 'error', text: 'Unable to delete your Account. Try again.' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.submission && accountData.submission.deleteAccount === 'challengeError') {
            setAccountDeletionResult({ show: true, type: 'error', text: 'You need to finish all of your challenges first.' });
            setShowSpinner({ show: false, type: '' });
        }

        if (accountData && accountData.submission && accountData.submission.deleteAccount === 'done') {
            setAccountDeletionResult({ show: true, type: 'success', text: 'Your Account was deleted successfully. Bye!' });
            setShowSpinner({ show: false, type: '' });
            setTimeout(() => {
                history.push('/');
            }, 3000);
        }

        if (accountData && accountData.submission && accountData.submission.deleteAccount === '') {
            setAccountDeletionResult({ show: false, type: '', text: '' });
            setShowSpinner({ show: false, type: '' });
        }
    }, [accountData]);

    useEffect(() => {
        if (popUpConfig.show) {
            if (popUpCardContainer && popUpCardContainer.current) {
                popUpCardContainer.current.classList.add('active');
            } else popUpCardContainer.current.classList.remove('active');
        }

        if (!popUpConfig.show && scrollY) {
            document.querySelector('.inner--right-container').scrollTo(0, scrollY + 10);
            setScrollY(0);
        }
    }, [popUpConfig, popUpCardContainer]);

    function handleEmailSubmit(e) {
        e.preventDefault();
        sendSettingsOtherAccountEmail(emailInput);
        setShowSpinner({ show: true, type: 'email-submission' });
    }

    function handleUsernameSubmit(e) {
        e.preventDefault();
        sendSettingsOtherAccountUsername(usernameInput);
        setShowSpinner({ show: true, type: 'username-submission' });
    }

    function handlePasswordSubmit(e) {
        e.preventDefault();
        sendSettingsOtherAccountPassword(oldPasswordInput, newPasswordInput);
        setShowSpinner({ show: true, type: 'password-submission' });
    }

    function handleEmailBlur() {
        if (!emailInput.match(/^.+@.+\.[a-z]+$/i)) {
            setEmailError({ show: true, text: 'Please enter a valid email' });
            return emailInputEl.current.setCustomValidity('Please enter a valid email');
        }

        authSignUpValidateEmail(emailInput, 'setting');
        setShowSpinner({ show: true, type: 'email' });
    }

    function handleEmailFocus() {
        setEmailError({ show: false, text: '' });
        setEmailSubmissionResult({ show: false, type: '', text: '' });
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

        authSignUpValidateUsername(usernameInput, 'setting');
        setShowSpinner({ show: true, type: 'username' });
    }

    function handleUsernameFocus() {
        setUsernameError({ show: false, text: '' });
        setUsernameSubmissionResult({ show: false, type: '', text: '' });
    }

    function handleNewPasswordBlur() {
        let passwordValidity = false;
        let hasWord = false;
        let hasNumber = false;

        if (newPasswordInput.trim().length < 16) passwordValidity = false;
        else {
            for (let i = 0; i < newPasswordInput.trim().length; i++) {
                if (newPasswordInput[i].charCodeAt(0) >= 48 && newPasswordInput[i].charCodeAt(0) <= 57) hasNumber = true;
                if (
                    (newPasswordInput[i].charCodeAt(0) >= 65 && newPasswordInput[i].charCodeAt(0) <= 90) ||
                    (newPasswordInput[i].charCodeAt(0) >= 97 && newPasswordInput[i].charCodeAt(0) <= 122)
                ) hasWord = true;

                if (hasWord && hasNumber) {
                    passwordValidity = true;
                    break;
                }
            }
        }

        if (!passwordValidity) {
            setNewPasswordError({ show: true, text: 'At least 16 characters with numbers and letters' });
            newPasswordInputEl.current.setCustomValidity('At least 16 characters with numbers and letters');
        } else newPasswordInputEl.current.setCustomValidity('');
    }

    function handleNewPasswordFocus() {
        setNewPasswordError({ show: false, text: '' });
    }

    function handleConfirmPasswordBlur() {
        if (confirmPasswordInput !== newPasswordInput) {
            setConfirmPasswordError({ show: true, text: 'Passwords don\'t match.' });
            confirmPasswordInputEl.current.setCustomValidity('Passwords don\'t match.');
        } else confirmPasswordInputEl.current.setCustomValidity('');
    }

    function handleConfirmPasswordFocus() {
        setConfirmPasswordError({ show: false, text: '' });
    }

    function handleOldPasswordFocus() {
        oldPasswordInputEl.current.setCustomValidity('');
        setOldPasswordError({ show: false, text: '' });
    }

    function handleAccountDeleteBtnClick() {
        setPopUpConfig({ show: true, type: 'account-delete' });
        const sY = document.querySelector('.inner--right-container').scrollTop;
        setScrollY(sY);
    }

    function renderPopUp() {
        function handlePopUpYesBtn() {
            settingsOtherAccountDeleteAccount();
            setShowSpinner({ show: true, type: 'account-delete' });
            setPopUpConfig({ show: false, type: '' });
        }

        function handlePopUpNoBtn() {
            setPopUpConfig({ show: false, type: '' });
        }

        if (popUpConfig.type === 'account-delete') {
            return (
                <div className="settings--other__account--pop-up-container">
                    <div ref={ popUpCardContainer } className="card">
                        <p>Are you sure you want to delete your Adasik account?</p>
                        <p className="meta">You will lose all of your data</p>
                        <div className="btn--container">
                            <button onClick={ handlePopUpYesBtn } className="yes--btn">Yes</button>
                            <button onClick={ handlePopUpNoBtn } className="no--btn">No</button>
                        </div>
                    </div>
                </div>
            );
        }
    }

    return (
        <div className="settings--other__account-container" style={ popUpConfig.show ? { height: '84vh', overflow: 'hidden' } : {} }>
            { !accountData && <Loading /> }
            { popUpConfig.show && renderPopUp() }
            <div className="header">
                <div className="line" />
                <p>Account</p>
            </div>
            <div className="email">
                <h2>Change Email</h2>
                <form onSubmit={ handleEmailSubmit }>
                    <div className="input--group-container">
                        <input
                            ref={ emailInputEl }
                            onBlur={ handleEmailBlur }
                            onFocus={ handleEmailFocus }
                            onChange={ e => setEmailInput(e.target.value) }
                            type="email"
                            required
                            id="settings--email"
                            placeholder="Email"
                            value={ emailInput }
                        />
                        <label htmlFor="settings--email">Email</label>
                        {
                            emailError.show &&
                            <div className="settings--other__account--input-error">
                                <span />
                                <p>{ emailError.text }</p>
                            </div>
                        }
                        {
                            showSpinner.show && showSpinner.type === 'email' &&
                            <div className="settings--other__account--spinner__container">
                                <Spinner />
                            </div>
                        }
                    </div>
                    <Button value="Submit" />
                    {
                        showSpinner.show && showSpinner.type === 'email-submission' &&
                        <div className="settings--other__account--spinner__container submission">
                            <Spinner />
                        </div>
                    }
                    {
                        !emailSubmissionResult.show &&
                        <div className="settings--other__account--error" />
                    }
                    {
                        emailSubmissionResult.show && emailSubmissionResult.type === 'error' &&
                        <div className="settings--other__account--error">
                            <span/>
                            <p>{ emailSubmissionResult.text }</p>
                        </div>
                    }
                    {
                        emailSubmissionResult.show && emailSubmissionResult.type === 'success' &&
                        <div className="settings--other__account--success">
                            <span />
                            <p>{ emailSubmissionResult.text }</p>
                        </div>
                    }
                </form>
            </div>
            <div className="username">
                <h2>Change Username</h2>
                <form onSubmit={ handleUsernameSubmit }>
                    <div className="input--group-container">
                        <input
                            ref={ usernameInputEl }
                            onBlur={ handleUsernameBlur }
                            onFocus={ handleUsernameFocus }
                            onChange={ e => setUsernameInput(e.target.value) }
                            type="text"
                            required
                            id="settings--username"
                            placeholder="Username"
                            value={ usernameInput }
                        />
                        <label htmlFor="settings--username">Username</label>
                        {
                            usernameError.show &&
                            <div className="settings--other__account--input-error">
                                <span />
                                <p>{ usernameError.text }</p>
                            </div>
                        }
                        {
                            showSpinner.show && showSpinner.type === 'username' &&
                            <div className="settings--other__account--spinner__container submission">
                                <Spinner />
                            </div>
                        }
                    </div>
                    <Button value="Submit" />
                    {
                        showSpinner.show && showSpinner.type === 'username-submission' &&
                        <div className="settings--other__account--spinner__container">
                            <Spinner />
                        </div>
                    }
                    {
                        !usernameSubmissionResult.show &&
                        <div className="settings--other__account--error" />
                    }
                    {
                        usernameSubmissionResult.show && usernameSubmissionResult.type === 'error' &&
                        <div className="settings--other__account--error">
                            <span/>
                            <p>{usernameSubmissionResult.text}</p>
                        </div>
                    }
                    {
                        usernameSubmissionResult.show && usernameSubmissionResult.type === 'success' &&
                        <div className="settings--other__account--success">
                            <span />
                            <p>{ usernameSubmissionResult.text }</p>
                        </div>
                    }
                </form>
            </div>
            <div className="password">
                <h2>Change Password</h2>
                <form onSubmit={ handlePasswordSubmit }>
                    <div className="input--group-container">
                        <input
                            ref={ oldPasswordInputEl }
                            onChange={ e => setOldPasswordInput(e.target.value) }
                            onFocus={ handleOldPasswordFocus }
                            type="password"
                            required
                            id="settings--old-password"
                            placeholder="Old Password"
                            autoComplete="current-password"
                            value={ oldPasswordInput }
                        />
                        <label htmlFor="settings--old-password">Old Password</label>
                        {
                            oldPasswordError.show &&
                            <div className="settings--other__account--input-error">
                                <span />
                                <p>{ oldPasswordError.text }</p>
                            </div>
                        }
                    </div>
                    <div className="input--group-container">
                        <input
                            ref={ newPasswordInputEl }
                            onBlur={ handleNewPasswordBlur }
                            onFocus={ handleNewPasswordFocus }
                            onChange={ e => setNewPasswordInput(e.target.value) }
                            type="password"
                            required
                            id="settings--new-password"
                            placeholder="New Password"
                            autoComplete="new-password"
                            value={ newPasswordInput }
                        />
                        <label htmlFor="settings--new-password">New Password</label>
                        {
                            newPasswordError.show &&
                            <div className="settings--other__account--input-error">
                                <span />
                                <p>{ newPasswordError.text }</p>
                            </div>
                        }
                    </div>
                    <div className="input--group-container">
                        <input
                            ref={ confirmPasswordInputEl }
                            onBlur={ handleConfirmPasswordBlur }
                            onFocus={ handleConfirmPasswordFocus }
                            onChange={ e => setConfirmPasswordInput(e.target.value) }
                            type="password"
                            required
                            id="settings--confirm-password"
                            placeholder="Confirm New Password"
                            autoComplete="new-password"
                            value={ confirmPasswordInput }
                        />
                        <label htmlFor="settings--confirm-password">Confirm New Password</label>
                        {
                            confirmPasswordError.show &&
                            <div className="settings--other__account--input-error">
                                <span />
                                <p>{ confirmPasswordError.text }</p>
                            </div>
                        }
                    </div>
                    <Button value="Submit" />
                    {
                        showSpinner.show && showSpinner.type === 'password-submission' &&
                        <div className="settings--other__account--spinner__container">
                            <Spinner />
                        </div>
                    }
                    {
                        !passwordSubmissionResult.show &&
                        <div className="settings--other__account--error" />
                    }
                    {
                        passwordSubmissionResult.show && passwordSubmissionResult.type === 'error' &&
                        <div className="settings--other__account--error">
                            <span/>
                            <p>{ passwordSubmissionResult.text }</p>
                        </div>
                    }
                    {
                        passwordSubmissionResult.show && passwordSubmissionResult.type === 'success' &&
                        <div className="settings--other__account--success">
                            <span />
                            <p>{ passwordSubmissionResult.text }</p>
                        </div>
                    }
                </form>
            </div>
            <div className="delete--account">
                <h2>Delete Account</h2>
                <p>By deleting account, you will lose all of your data which includes: Statistics, Messages, Friends and...</p>
                <button onClick={ handleAccountDeleteBtnClick }>Delete Account</button>
                {
                    showSpinner.show && showSpinner.type === 'account-delete' &&
                    <div className="settings--other__account--spinner__container submission">
                        <Spinner />
                    </div>
                }
                {
                    !accountDeletionResult.show &&
                    <div className="settings--other__account--error" />
                }
                {
                    accountDeletionResult.show && accountDeletionResult.type === 'error' &&
                    <div className="settings--other__account--error">
                        <span/>
                        <p className="result">{ accountDeletionResult.text }</p>
                    </div>
                }
                {
                    accountDeletionResult.show && accountDeletionResult.type === 'success' &&
                    <div className="settings--other__account--success">
                        <span />
                        <p className="result">{ accountDeletionResult.text }</p>
                    </div>
                }
            </div>
        </div>
    );
};

function mapStateToProps(state) {
    return {
        accountData: state.settings.other.account
    }
}

export default connect(mapStateToProps, {
    fetchSettingsOtherAccountData,
    authSignUpValidateEmail,
    authSignUpValidateUsername,
    sendSettingsOtherAccountEmail,
    sendSettingsOtherAccountUsername,
    sendSettingsOtherAccountPassword,
    settingsOtherAccountDeleteAccount
})(Account);