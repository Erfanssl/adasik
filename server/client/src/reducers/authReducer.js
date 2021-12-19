import {
    AUTH_SING_UP_VALIDATE_EMAIL,
    AUTH_SIGN_UP_VALIDATE_USERNAME,
    AUTH_SIGN_UP_SEND_DATA,
    AUTH_SIGN_UP_WIPE_DATA,
    AUTH_SIGN_IN_SEND_DATA,
    AUTH_SIGN_IN_WIPE_DATA,
    AUTH_SIGN_OUT_SEND_DATA,
    AUTH_SIGN_IN_FORGOT_VALIDATE,
    AUTH_SIGN_IN_FORGOT_QUESTIONS,
    AUTH_SIGN_IN_FORGOT_RESET,
    AUTH_SIGN_OUT_WIPE_DATA
} from "../actions/authTypes";

export default (state = { signUp: { email: {}, username: {}, send: {} }, signIn: {}, signOut: {} }, action) => {
    switch (action.type) {
        case AUTH_SING_UP_VALIDATE_EMAIL:
            if (action.payload.Error) return { ...state, signUp: { ...state.signUp, email: { ...state.signUp.email, Error: true, valid: false } } };
            return { ...state, signUp: { ...state.signUp, email: { ...state.signUp.email, valid: true, Error: false } } };
        case AUTH_SIGN_UP_VALIDATE_USERNAME:
            if (action.payload.Error) return { ...state, signUp: { ...state.signUp, username: { ...state.signUp.username, Error: true, valid: false } } };
            return { ...state, signUp: { ...state.signUp, username: { ...state.signUp.username, valid: true, Error: false } } };
        case AUTH_SIGN_UP_SEND_DATA:
            if (action.payload.Error) return { ...state, signUp: { ...state.signUp, send: { ...state.signUp.send, Error: true, done: false } } };
            return { ...state, signUp: { ...state.signUp, send: { ...state.signUp.send, Error: false, done: true } } };
        case AUTH_SIGN_UP_WIPE_DATA:
            return { ...state, signUp: {} };
        case AUTH_SIGN_IN_SEND_DATA:
            if (action.payload.InfoError) return { ...state, signIn: { ...state.signIn, InfoError: true, Error: false, done: false } };
            if (action.payload.Error) return { ...state, signIn: { ...state.signIn, InfoError: false, Error: true, done: false } };
            if (action.payload.done) return { ...state, signIn: { ...state.signIn, InfoError: false, Error: false, done: true } };
            return {};
        case AUTH_SIGN_IN_FORGOT_VALIDATE:
            if (action.payload.ForgotValidationError) return { ...state, signIn: { ForgotValidationError: true } };
            if (action.payload.ForgotError) return { ...state, signIn: { ForgotError: true } };
            if (action.payload.ForgotValidationSucceed) return { ...state, signIn: { ForgotValidationSucceed: true, securityQuestions: action.payload.securityQuestions } };
            return {};
        case AUTH_SIGN_IN_FORGOT_QUESTIONS:
            if (action.payload.AnswersError) return { ...state, signIn: { securityQuestions: state.signIn.securityQuestions, AnswersError: true } };
            if (action.payload.ForgotError) return { ...state, signIn: { securityQuestions: state.signIn.securityQuestions, ForgotError: true } };
            if (action.payload.AnswersCorrect) return { ...state, signIn: { securityQuestions: state.signIn.securityQuestions, AnswersCorrect: true } };
            return {};
        case AUTH_SIGN_IN_FORGOT_RESET:
            if (action.payload.ResetValidationError) return { ...state, signIn: { ResetValidationError: true } };
            if (action.payload.ResetError) return { ...state, signIn: { ResetError: true } };
            if (action.payload.ResetSucceed) return { ...state, signIn: { ResetSucceed: true } };
            if (action.payload.ForgotError) return { ...state, signIn: {  ForgotError: true } };
            return {};
        case AUTH_SIGN_IN_WIPE_DATA:
            return { ...state, signIn: {} };
        case AUTH_SIGN_OUT_SEND_DATA:
            if (action.payload.Error) return { ...state, signOut: { Error: true, done: false } };
            return { ...state, signOut: { Error: false, done: true } };
        case AUTH_SIGN_OUT_WIPE_DATA:
            return { ...state, signOut: { Error: false, done: false } };
        default:
            return state;
    }
};
