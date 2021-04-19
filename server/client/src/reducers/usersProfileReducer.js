import {
    USERS_PROFILE_FETCH_DATA,
    USERS_PROFILE_SEND_FRIEND_REQUEST,
    USERS_PROFILE_SEND_CHALLENGE_REQUEST,
    USERS_PROFILE_SEND_LIKE,
    USERS_PROFILE_SEND_BLOCK,
    USERS_PROFILE_SEND_REPORT,
    USERS_PROFILE_FETCH_SEARCH,
    USERS_PROFILE_WIPE_SEARCH,
    USERS_PROFILE_WIPE_DATA
} from "../actions/usersProfileTypes";

export default (state = {}, action) => {
    switch (action.type) {
        case USERS_PROFILE_FETCH_DATA:
            return action.payload;
        case USERS_PROFILE_SEND_FRIEND_REQUEST:
            if (action.payload && action.payload.Error) return { ...state, friendRequest: { Error: true, done: false } };
            if (action.payload && action.payload.done) return { ...state, friendRequest: { Error: false, done: true } };
            return { ...state, friendRequest: { Error: false, done: false } };
        case  USERS_PROFILE_SEND_CHALLENGE_REQUEST:
            if (action.payload && action.payload.ChallengeError) return { ...state, challengeRequest: { ChallengeError: true, RequestError: false, Error: false, done: false } };
            if (action.payload && action.payload.RequestError) return { ...state, challengeRequest: { ChallengeError: false, RequestError: true, Error: false, done: false } };
            if (action.payload && action.payload.Error) return { ...state, challengeRequest: { ChallengeError: false, RequestError: false, Error: true, done: false } };
            if (action.payload && action.payload.done) return { ...state, challengeRequest: { ChallengeError: false, RequestError: false, Error: false, done: true } };
            return { ...state, challengeRequest: { ChallengeError: false, RequestError: false, Error: false, done: false } };
        case USERS_PROFILE_SEND_LIKE:
            if (action.payload && action.payload.Error) return { ...state, like: { Error: true, done: false } };
            if (action.payload && action.payload.like) return { ...state, userLiked: true, info: { ...state.info, general: { ...state.info.general, likes: state.info.general.likes + 1 } }, like: { Error: false, done: true } };
            if (action.payload && action.payload.dislike) return { ...state, userLiked: false, info: { ...state.info, general: { ...state.info.general, likes: state.info.general.likes - 1 } }, like: { Error: false, done: true } };
            return { ...state, like: { Error: false, done: false } };
        case USERS_PROFILE_SEND_BLOCK:
            if (action.payload && action.payload.Error) return { ...state, block: { Error: true, done: false } };
            if (action.payload && action.payload.done) return { ...state, userBlocked: !state.userBlocked, block: { Error: false, done: true } };
            return { ...state, block: { Error: false, done: false } };
        case USERS_PROFILE_SEND_REPORT:
            if (action.payload && action.payload.Error) return { ...state, report: { Error: true, done: false } };
            if (action.payload && action.payload.done) return { ...state, report: { Error: false, done: true } };
            return { ...state, report: { Error: false, done: false } };
        case USERS_PROFILE_FETCH_SEARCH:
            if (action.payload && action.payload.Error) return { ...state, search: { Error: true } };
            if (action.payload && Array.isArray(action.payload)) return { ...state, search: action.payload };
            return { ...state, search: { Error: false } };
        case USERS_PROFILE_WIPE_SEARCH:
            if (Object.keys(state).length) return { ...state, search: undefined };
            return state;
        case USERS_PROFILE_WIPE_DATA:
            return {};
        default:
            return state;
    }
};