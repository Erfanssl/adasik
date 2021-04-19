import {
    AUTH_SING_UP_VALIDATE_EMAIL,
    AUTH_SIGN_UP_VALIDATE_USERNAME,
    AUTH_SIGN_UP_SEND_DATA,
    AUTH_SIGN_UP_WIPE_DATA,
    AUTH_SIGN_IN_SEND_DATA,
    AUTH_SIGN_IN_WIPE_DATA,
    AUTH_SIGN_OUT_SEND_DATA
} from "./authTypes";

import {
    SETTINGS_OTHER_ACCOUNT_VALIDATE_EMAIL,
    SETTINGS_OTHER_ACCOUNT_VALIDATE_USERNAME
} from "./settingsTypes";

export const authSignUpValidateEmail = (email, type) => async (dispatch) => {
    try {
        const emailValidatorQuery = await fetch(`/api/auth/signUp/validator/email+${ email }`);
        const emailValidatorData = await emailValidatorQuery.json();

        if (emailValidatorData.Error) {
            if (type === 'setting') {
                dispatch({
                    type: SETTINGS_OTHER_ACCOUNT_VALIDATE_EMAIL,
                    payload: { Error: true }
                });
            }

            dispatch({
                type: AUTH_SING_UP_VALIDATE_EMAIL,
                payload: { Error: true }
            });
        }
        else {
            if (type === 'setting') {
                dispatch({
                    type: SETTINGS_OTHER_ACCOUNT_VALIDATE_EMAIL,
                    payload: { valid: true }
                });
            }

            dispatch({
                type: AUTH_SING_UP_VALIDATE_EMAIL,
                payload: { valid: true }
            });
        }
    } catch (err) {
        if (type === 'setting') {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_VALIDATE_EMAIL,
                payload: { Error: true }
            });
        }

        dispatch({
            type: AUTH_SING_UP_VALIDATE_EMAIL,
            payload: { Error: true }
        });
    }
};

export const authSignUpValidateUsername = (username, type) => async (dispatch) => {
    try {
        const usernameValidatorQuery = await fetch(`/api/auth/signUp/validator/username+${ username }`);
        const usernameValidatorData = await usernameValidatorQuery.json();

        if (usernameValidatorData.Error) {
            if (type === 'setting') {
                dispatch({
                    type: SETTINGS_OTHER_ACCOUNT_VALIDATE_USERNAME,
                    payload: { Error: true }
                });
            }

            dispatch({
                type: AUTH_SIGN_UP_VALIDATE_USERNAME,
                payload: { Error: true }
            });
        }
        else {
            if (type === 'setting') {
                dispatch({
                    type: SETTINGS_OTHER_ACCOUNT_VALIDATE_USERNAME,
                    payload: { valid: true }
                });
            }

            dispatch({
                type: AUTH_SIGN_UP_VALIDATE_USERNAME,
                payload: { valid: true }
            });
        }
    } catch (err) {
        if (type === 'setting') {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_VALIDATE_USERNAME,
                payload: { Error: true }
            });
        }

        dispatch({
            type: AUTH_SIGN_UP_VALIDATE_USERNAME,
            payload: { Error: true }
        });
    }
};

export const authSignUpSendData = (data) => async(dispatch) => {
    try {
        const signUpSendQuery = await fetch(`/api/auth/signUp`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const signUpSendData = await signUpSendQuery.json();

        if (signUpSendData.Error) {
            dispatch({
                type: AUTH_SIGN_UP_SEND_DATA,
                payload: { Error: true }
            });
        }
        else {
            dispatch({
                type: AUTH_SIGN_UP_SEND_DATA,
                payload: { done: true }
            });
        }
    } catch (err) {
        dispatch({
            type: AUTH_SIGN_UP_SEND_DATA,
            payload: { Error: true }
        });
    }
};

export const authSignUpWipeData = () => async (dispatch) => {
    dispatch({
        type: AUTH_SIGN_UP_WIPE_DATA
    });
};

// Sign In
export const authSignInSendData = (data) => async (dispatch) => {
    try {
        const signInSendQuery = await fetch(`/api/auth/signIn`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const signInSendData = await signInSendQuery.json();

        if (signInSendData.InfoError) {
            dispatch({
                type: AUTH_SIGN_IN_SEND_DATA,
                payload: { InfoError: true }
            });
        }

        if (signInSendData.Error) {
            dispatch({
                type: AUTH_SIGN_IN_SEND_DATA,
                payload: { Error: true }
            });
        }

        if (signInSendData.Message) {
            dispatch({
                type: AUTH_SIGN_IN_SEND_DATA,
                payload: { done: true }
            });
        }
    } catch (err) {
        dispatch({
            type: AUTH_SIGN_IN_SEND_DATA,
            payload: { Error: true }
        });
    }
};

export const authSignInWipeData = () => async (dispatch) => {
    dispatch({
        type: AUTH_SIGN_IN_WIPE_DATA
    });
};

// Sign Out
export const authSignOutSendData = () => async (dispatch) => {
    try {
        const signOutQuery = await fetch(`/api/auth/signOut`);
        const signOutData = await signOutQuery.json();

        if (signOutData.Error) {
            dispatch({
                type: AUTH_SIGN_OUT_SEND_DATA,
                payload: { Error: true }
            });
        }

        if (signOutData.Message) {
            dispatch({
                type: AUTH_SIGN_OUT_SEND_DATA,
                payload: { done: true }
            });
        }
    } catch (err) {
        dispatch({
            type: AUTH_SIGN_OUT_SEND_DATA,
            payload: { Error: true }
        });
    }
};