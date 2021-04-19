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
    SETTINGS_OTHER_ACCOUNT_VALIDATE_EMAIL,
    SETTINGS_OTHER_ACCOUNT_VALIDATE_USERNAME,
    SETTINGS_OTHER_ACCOUNT_SEND_EMAIL,
    SETTINGS_OTHER_ACCOUNT_SEND_USERNAME,
    SETTINGS_OTHER_ACCOUNT_SEND_PASSWORD,
    SETTINGS_OTHER_ACCOUNT_DELETE_ACCOUNT
} from '../actions/settingsTypes';

export default (state = { other: {} }, action) => {
    switch (action.type) {
        case SEND_SETTINGS_PROFILE_AVATAR:
            if (action.payload.Error) return { ...state, profile: { Error: action.payload.Error } };
            return { ...state, profile: { ...state.profile, url: action.payload.url } };
        case FETCH_SETTINGS_PROFILE_DATA:
            return { ...state, profile: { ...state.profile, ...action.payload } };
        case SEND_SETTINGS_PROFILE_DATA:
            if (action.payload.Error) return { ...state, profile: { ...state.profile, Error: true } };
            if (action.payload.PhoneError) return { ...state, profile: { ...state.profile, PhoneError: true } };
            if (action.payload.dataSent) return { ...state, profile: { ...state.profile, dataSent: true } };
            return { ...state, profile: { ...state.profile, Error: false, PhoneError: false, dataSent: false } };
        case WIPE_SETTINGS_PROFILE_DATA:
            return { ...state, profile: undefined };

        case FETCH_SETTINGS_MESSENGER_DATA:
            return { ...state, messenger: { ...state.messenger, data: action.payload } };
        case SEND_SETTINGS_MESSENGER_DATA:
            if (action.payload.Error) return { ...state, messenger: { ...state.messenger, Error: true } };
            if (action.payload.messengerSettingsDataSend) return { ...state, messenger: { ...state.messenger, messengerSettingsDataSend: true } };
            return { ...state, messenger: { ...state.messenger, Error: false, messengerSettingsDataSend: false } };
        case WIPE_SETTINGS_MESSENGER_DATA:
            return { ...state, messenger: undefined };

        case FETCH_SETTINGS_PRIVACY_DATA:
            return { ...state, privacy: { data: action.payload } };
        case SEND_SETTINGS_PRIVACY_DATA:
            if (action.payload.Error) return { ...state, privacy: { ...state.privacy, Error: true } };
            if (action.payload.privacySettingsDataSend) return { ...state, privacy: { ...state.privacy, privacySettingsDataSend: true } };
            return { ...state, privacy: { ...state.privacy, Error: false, privacySettingsDataSend: false } };
        case WIPE_SETTINGS_PRIVACY_DATA:
            return { ...state, privacy: undefined };

        case FETCH_SETTINGS_OTHER_ACCOUNT_DATA:
            if (action.payload.Error) return { ...state, other: { ...state.other, account: { Error: true } } };
            return { ...state, other: { ...state.other, account: action.payload } };
        case SETTINGS_OTHER_ACCOUNT_VALIDATE_EMAIL:
            if (action.payload.Error) return { ...state, other: { ...state.other, account: { ...state.other.account, validity: { ...state.other.account.validity, email: 'invalid' } } } };
            return { ...state, other: { ...state.other, account: { ...state.other.account, validity: { ...state.other.account.validity, email: 'valid' } } } };
        case SETTINGS_OTHER_ACCOUNT_VALIDATE_USERNAME:
            if (action.payload.Error) return { ...state, other: { ...state.other, account: { ...state.other.account, validity: { ...state.other.account.validity, username: 'invalid' } } } };
            return { ...state, other: { ...state.other, account: { ...state.other.account, validity: { ...state.other.account.validity, username: 'valid' } } } };
        case SETTINGS_OTHER_ACCOUNT_SEND_EMAIL:
            if (action.payload.ValidationError) return { ...state, other: { ...state.other, account: { ...state.other.account, validity: { email: 'invalid' } } } };
            if (action.payload.Error) return { ...state, other: { ...state.other, account: { ...state.other.account, submission: { email: 'fail' } } } };
            if (action.payload.reset) return { ...state, other: { ...state.other, account: { ...state.other.account, submission: { email: '' } } } };
            return { ...state, other: { ...state.other, account: { ...state.other.account, submission: { email: 'done' } } } };
        case SETTINGS_OTHER_ACCOUNT_SEND_USERNAME:
            if (action.payload.ValidationError) return { ...state, other: { ...state.other, account: { ...state.other.account, validity: { ...state.other.account.validity, username: 'invalid' } } } };
            if (action.payload.Error) return { ...state, other: { ...state.other, account: { ...state.other.account, submission: { username: 'fail' } } } };
            if (action.payload.reset) return { ...state, other: { ...state.other, account: { ...state.other.account, submission: { username: '' } } } };
            return { ...state, other: { ...state.other, account: { ...state.other.account, submission: { username: 'done' } } } };
        case SETTINGS_OTHER_ACCOUNT_SEND_PASSWORD:
            if (action.payload.ValidationError) return { ...state, other: { ...state.other, account: { ...state.other.account, validity: { ...state.other.account.validity, password: 'invalid' } } } };
            if (action.payload.MatchError) return { ...state, other: { ...state.other, account: { ...state.other.account, validity: { ...state.other.account.validity, password: 'incorrect' } } } };
            if (action.payload.Error) return { ...state, other: { ...state.other, account: { ...state.other.account, submission: { password: 'fail' } } } };
            if (action.payload.reset) return { ...state, other: { ...state.other, account: { ...state.other.account, submission: { password: '' } } } };
            return { ...state, other: { ...state.other, account: { ...state.other.account, submission: { password: 'done' }, validity: { ...state.other.account.validity, password: '' } } } };
        case SETTINGS_OTHER_ACCOUNT_DELETE_ACCOUNT:
            if (action.payload.Error) return { ...state, other: { ...state.other, account: { ...state.other.account, submission: { deleteAccount: 'fail' } } } };
            if (action.payload.ChallengeError) return { ...state, other: { ...state.other, account: { ...state.other.account, submission: { deleteAccount: 'challengeError' } } } };
            if (action.payload.reset) return { ...state, other: { ...state.other, account: { ...state.other.account, submission: { deleteAccount: '' } } } };
            return { ...state, other: { ...state.other, account: { ...state.other.account, submission: { deleteAccount: 'done' } } } };
        default:
            return state;
    }
};