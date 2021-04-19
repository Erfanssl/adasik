import {
    SEND_SETTINGS_PROFILE_AVATAR,
    FETCH_SETTINGS_PROFILE_DATA,
    SEND_SETTINGS_PROFILE_DATA,
    WIPE_SETTINGS_PROFILE_DATA,
    FETCH_SETTINGS_MESSENGER_DATA,
    SEND_SETTINGS_MESSENGER_DATA,
    WIPE_SETTINGS_MESSENGER_DATA,
    FETCH_SETTINGS_PRIVACY_DATA,
    SEND_SETTINGS_PRIVACY_DATA,
    WIPE_SETTINGS_PRIVACY_DATA,
    FETCH_SETTINGS_OTHER_ACCOUNT_DATA,
    SETTINGS_OTHER_ACCOUNT_SEND_EMAIL,
    SETTINGS_OTHER_ACCOUNT_SEND_USERNAME,
    SETTINGS_OTHER_ACCOUNT_SEND_PASSWORD,
    SETTINGS_OTHER_ACCOUNT_DELETE_ACCOUNT
} from './settingsTypes';

export const sendSettingsProfileAvatar = ({ left, top, imageWidth, imageHeight, squareWidth, squareHeight }, file) => async (dispatch) => {
    try {
        const sendAvatarQuery = await fetch(`/api/setting/profile/avatar/${ left }.${ top }.${ imageWidth }.${ imageHeight }.${ squareWidth }.${ squareHeight }`, {
            method: 'POST',
            headers: {
                'Content-Type': 'image/jpeg'
            },
            body: file
        });

        const sendAvatarData = await sendAvatarQuery.json();

        dispatch({
            type: SEND_SETTINGS_PROFILE_AVATAR,
            payload: sendAvatarData
        });
    } catch (err) {
        dispatch({
            type: SEND_SETTINGS_PROFILE_AVATAR,
            payload: { Error: 'Error ' + err }
        });
    }
};

export const fetchSettingsProfileData = () => async (dispatch) => {
    try {
        const profileQuery = await fetch(`/api/setting/profile`);
        const profileData = await profileQuery.json();

        dispatch({
            type: FETCH_SETTINGS_PROFILE_DATA,
            payload: profileData
        });
    } catch (err) {

    }
};

export const sendSettingsProfileData = (data) => async (dispatch) => {
    try {
        const profileQuery = await fetch(`/api/setting/profile`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const profileData = await profileQuery.json();

        if (profileData.PhoneError) {
            dispatch({
                type: SEND_SETTINGS_PROFILE_DATA,
                payload: { PhoneError: true }
            });

            setTimeout(() => {
                dispatch({
                    type: SEND_SETTINGS_PROFILE_DATA,
                    payload: { PhoneError: false }
                });
            }, 3000);
        }

        else if (profileData.Error) {
            dispatch({
                type: SEND_SETTINGS_PROFILE_DATA,
                payload: { Error: true }
            });

            setTimeout(() => {
                dispatch({
                    type: SEND_SETTINGS_PROFILE_DATA,
                    payload: { Error: false }
                });
            }, 3000);
        }

        else {
            dispatch({
                type: SEND_SETTINGS_PROFILE_DATA,
                payload: { dataSent: true }
            });

            setTimeout(() => {
                dispatch({
                    type: SEND_SETTINGS_PROFILE_DATA,
                    payload: { dataSent: false }
                });
            }, 3000);
        }

    } catch (err) {
        dispatch({
            type: SEND_SETTINGS_PROFILE_DATA,
            payload: { Error: 'Error' }
        });
    }
};

export const wipeSettingsProfileData = () => async (dispatch) => {
    dispatch({
        type: WIPE_SETTINGS_PROFILE_DATA
    });
};

// actions for messenger settings
export const fetchSettingsMessengerData = () => async (dispatch) => {
    try {
        const messengerSettingsQuery = await fetch(`/api/setting/messenger`);
        const messengerSettingsData = await messengerSettingsQuery.json();

        dispatch({
            type: FETCH_SETTINGS_MESSENGER_DATA,
            payload: messengerSettingsData
        });
    } catch (err) {

    }
};

export const sendSettingsMessengerData = (messengerSettingsDataArr) => async (dispatch) => {
    try {
        const messengerSettingsQuery = await fetch(`/api/setting/messenger`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messengerSettingsDataArr)
        });

        const messengerSettingsData = await messengerSettingsQuery.json();

        if (messengerSettingsData.Error) {
            dispatch({
                type: SEND_SETTINGS_MESSENGER_DATA,
                payload: { Error: true }
            });

            setTimeout(() => {
                dispatch({
                    type: SEND_SETTINGS_MESSENGER_DATA,
                    payload: { Error: false }
                });
            }, 3000);
        } else {
            dispatch({
                type: SEND_SETTINGS_MESSENGER_DATA,
                payload: { messengerSettingsDataSend: true }
            });

            setTimeout(() => {
                dispatch({
                    type: SEND_SETTINGS_MESSENGER_DATA,
                    payload: { messengerSettingsDataSend: false }
                });
            }, 3000);
        }
    } catch (err) {
        dispatch({
            type: SEND_SETTINGS_MESSENGER_DATA,
            payload: { Error: true }
        });
    }
};

export const wipeSettingsMessengerData = () => async (dispatch) => {
    try {
        dispatch({
            type: WIPE_SETTINGS_MESSENGER_DATA
        });
    } catch (err) {}
};

// actions for privacy settings
export const fetchSettingsPrivacyData = () => async (dispatch) => {
    try {
        const privacySettingsQuery = await fetch(`/api/setting/privacy`);
        const privacySettingsData = await privacySettingsQuery.json();

        dispatch({
            type: FETCH_SETTINGS_PRIVACY_DATA,
            payload: privacySettingsData
        });
    } catch (err) {

    }
};

export const sendSettingsPrivacyData = (privacySettingsDataArr) => async (dispatch) => {
    try {
        const privacySettingsQuery = await fetch(`/api/setting/privacy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(privacySettingsDataArr)
        });

        const privacySettingsData = await privacySettingsQuery.json();

        if (privacySettingsData.Error) {
            dispatch({
                type: SEND_SETTINGS_PRIVACY_DATA,
                payload: { Error: true }
            });

            setTimeout(() => {
                dispatch({
                    type: SEND_SETTINGS_PRIVACY_DATA,
                    payload: { Error: false }
                });
            }, 3000);
        } else {
            dispatch({
                type: SEND_SETTINGS_PRIVACY_DATA,
                payload: { privacySettingsDataSend: true }
            });

            setTimeout(() => {
                dispatch({
                    type: SEND_SETTINGS_PRIVACY_DATA,
                    payload: { privacySettingsDataSend: false }
                });
            }, 3000);
        }
    } catch (err) {
        dispatch({
            type: SEND_SETTINGS_PRIVACY_DATA,
            payload: { Error: true }
        });
    }
};

export const wipeSettingsPrivacyData = () => async (dispatch) => {
    try {
        dispatch({
            type: WIPE_SETTINGS_PRIVACY_DATA
        });
    } catch (err) {}
};

// actions for other settings
// Account
export const fetchSettingsOtherAccountData = () => async (dispatch) => {
    try {
        const accountSettingsQuery = await fetch(`/api/setting/account`);
        const accountSettingsData = await accountSettingsQuery.json();

        if (accountSettingsData.Error) {
            dispatch({
                type: FETCH_SETTINGS_OTHER_ACCOUNT_DATA,
                payload: { Error: true }
            });
        } else {
            dispatch({
                type: FETCH_SETTINGS_OTHER_ACCOUNT_DATA,
                payload: accountSettingsData
            });
        }
    } catch (err) {
        dispatch({
            type: FETCH_SETTINGS_OTHER_ACCOUNT_DATA,
            payload: { Error: true }
        });
    }
};

export const sendSettingsOtherAccountEmail = (email) => async (dispatch) => {
    try {
        const accountSettingsQuery = await fetch(`/api/setting/account/email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const accountSettingsData = await accountSettingsQuery.json();

        if (accountSettingsData.ValidationError) {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_SEND_EMAIL,
                payload: { ValidationError: true }
            });
        }

        else if (accountSettingsData.Error) {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_SEND_EMAIL,
                payload: { Error: true }
            });

            setTimeout(() => {
                dispatch({
                    type: SETTINGS_OTHER_ACCOUNT_SEND_EMAIL,
                    payload: { reset: true }
                });
            }, 3000);
        }

        else {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_SEND_EMAIL,
                payload: { done: true }
            });

            setTimeout(() => {
                dispatch({
                    type: SETTINGS_OTHER_ACCOUNT_SEND_EMAIL,
                    payload: { reset: true }
                });
            }, 3000);
        }

    } catch (err) {
        dispatch({
            type: SETTINGS_OTHER_ACCOUNT_SEND_EMAIL,
            payload: { Error: true }
        });

        setTimeout(() => {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_SEND_EMAIL,
                payload: { reset: true }
            });
        }, 3000);
    }
};

export const sendSettingsOtherAccountUsername = (username) => async (dispatch) => {
    try {
        const accountSettingsQuery = await fetch(`/api/setting/account/username`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username })
        });

        const accountSettingsData = await accountSettingsQuery.json();

        if (accountSettingsData.ValidationError) {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_SEND_USERNAME,
                payload: { ValidationError: true }
            });
        }

        else if (accountSettingsData.Error) {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_SEND_USERNAME,
                payload: { Error: true }
            });

            setTimeout(() => {
                dispatch({
                    type: SETTINGS_OTHER_ACCOUNT_SEND_USERNAME,
                    payload: { reset: true }
                });
            }, 3000);
        }

        else {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_SEND_USERNAME,
                payload: { done: true }
            });

            setTimeout(() => {
                dispatch({
                    type: SETTINGS_OTHER_ACCOUNT_SEND_USERNAME,
                    payload: { reset: true }
                });
            }, 3000);
        }
    } catch (err) {
        dispatch({
            type: SETTINGS_OTHER_ACCOUNT_SEND_USERNAME,
            payload: { Error: true }
        });

        setTimeout(() => {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_SEND_USERNAME,
                payload: { reset: true }
            });
        }, 3000);
    }
}

export const sendSettingsOtherAccountPassword = (oldPassword, newPassword) => async (dispatch) => {
    try {
        const accountSettingsQuery = await fetch(`/api/setting/account/password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ oldPassword, newPassword })
        });

        const accountSettingsData = await accountSettingsQuery.json();

        if (accountSettingsData.ValidationError) {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_SEND_PASSWORD,
                payload: { ValidationError: true }
            });
        }

        else if (accountSettingsData.MatchError) {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_SEND_PASSWORD,
                payload: { MatchError: true }
            });
        }

        else if (accountSettingsData.Error) {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_SEND_PASSWORD,
                payload: { Error: true }
            });

            setTimeout(() => {
                dispatch({
                    type: SETTINGS_OTHER_ACCOUNT_SEND_PASSWORD,
                    payload: { reset: true }
                });
            }, 3000);
        }

        else {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_SEND_PASSWORD,
                payload: { done: true }
            });

            setTimeout(() => {
                dispatch({
                    type: SETTINGS_OTHER_ACCOUNT_SEND_PASSWORD,
                    payload: { reset: true }
                });
            }, 3000);
        }
    } catch (err) {
        dispatch({
            type: SETTINGS_OTHER_ACCOUNT_SEND_PASSWORD,
            payload: { Error: true }
        });

        setTimeout(() => {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_SEND_PASSWORD,
                payload: { reset: true }
            });
        }, 3000);
    }
}

export const settingsOtherAccountDeleteAccount = () => async (dispatch) => {
    try {
        const accountSettingsQuery = await fetch(`/api/setting/account`, {
            method: 'DELETE'
        });

        const accountSettingsData = await accountSettingsQuery.json();

        if (accountSettingsData.Error) {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_DELETE_ACCOUNT,
                payload: { Error: true }
            });

            setTimeout(() => {
                dispatch({
                    type: SETTINGS_OTHER_ACCOUNT_DELETE_ACCOUNT,
                    payload: { reset: true }
                });
            }, 3000);
        }

        else if (accountSettingsData.ChallengeError) {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_DELETE_ACCOUNT,
                payload: { ChallengeError: true }
            });

            setTimeout(() => {
                dispatch({
                    type: SETTINGS_OTHER_ACCOUNT_DELETE_ACCOUNT,
                    payload: { reset: true }
                });
            }, 3000);
        }

        else {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_DELETE_ACCOUNT,
                payload: { done: true }
            });
        }
    } catch (err) {
        dispatch({
            type: SETTINGS_OTHER_ACCOUNT_DELETE_ACCOUNT,
            payload: { Error: true }
        });

        setTimeout(() => {
            dispatch({
                type: SETTINGS_OTHER_ACCOUNT_DELETE_ACCOUNT,
                payload: { reset: true }
            });
        }, 3000);
    }
};