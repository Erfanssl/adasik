import {
    FETCH_CHALLENGE_DATA,
    CREATE_CHALLENGE,
    FETCH_CHALLENGE_INSIDE_DATA,
    CREATE_GAME,
    CANCEL_GAME_REDIRECT,
    FETCH_GAME,
    FETCH_GAME_ANALYSIS,
    WIPE_GAME_ANALYSIS,
    CLOSE_RESULT,
    REJECT_REQUEST,
    ACCEPT_REQUEST,
    FETCH_FRIENDS,
    CLEAN_CREATE_CHALLENGE,
    WIPE_GAME_DATA
} from '../actions/challengeTypes';

export default (state = {}, action) => {
    switch (action.type) {
        case FETCH_CHALLENGE_DATA:
            return { ...state, main: action.payload };
        case CREATE_CHALLENGE:
            return { ...state, create: action.payload };
        case CLEAN_CREATE_CHALLENGE:
            return { ...state, create: undefined };
        case FETCH_CHALLENGE_INSIDE_DATA:
            if (action.payload.Error) return { ...state, inside: { Error: action.payload.Error } };
            return { ...state, inside: action.payload };
        case CREATE_GAME:
            return { ...state, inside: { ...state.inside, redirect: action.payload } };
        case CANCEL_GAME_REDIRECT:
            return { ...state, inside: { ...state.inside, redirect: undefined } };
        case FETCH_GAME:
            if (action.payload.Error) return { ...state, game: { Error: action.payload.Error } };
            return state.game ?
                { ...state, game: { ...state.game, ...action.payload } } :
                { ...state, game: action.payload };
        case FETCH_GAME_ANALYSIS:
            if (action.payload.Error) return { ...state, game: { ...state.game, analysis: { Error: true } } };
            return {...state, game: {...state.game, analysis: action.payload}};
        case WIPE_GAME_ANALYSIS:
            return { ...state, game: { ...state.game, analysis: undefined } };
        case WIPE_GAME_DATA:
            return { ...state, game: undefined }
        case CLOSE_RESULT:
            if (action.payload === 'all') return {
                ...state,
                main: {
                    ...state.main,
                    challenges: {
                        ...state.main.challenges,
                        inactive: state.main.challenges.inactive.map(inactiveChallenge => ({
                            ...inactiveChallenge,
                            close: true
                        }))
                    }
                }
            }
            return {
                ...state,
                main: {
                    ...state.main,
                    challenges: {
                        ...state.main.challenges,
                        inactive: state.main.challenges.inactive.map(inactiveChallenge => inactiveChallenge._id === action.payload ? {
                            ...inactiveChallenge,
                            close: true
                        } : inactiveChallenge)
                    }
                }
            }
        case REJECT_REQUEST:
            if (action.payload === 'all') return { ...state, main: { ...state.main, requests: [] } };
            return {
                ...state,
                main: { ...state.main, requests: state.main.requests.filter(req => req._id !== action.payload) }
            };
        case ACCEPT_REQUEST:
            const opponentInfo = {};
            const reqData = state.main.requests.find(req => req._id === action.payload.id);
            opponentInfo.avatar = reqData.avatar;
            opponentInfo.fullName = reqData.fullName;
            opponentInfo.status = reqData.status;
            return {
                ...state,
                main: {
                    ...state.main,
                    requests: state.main.requests.filter(req => req._id !== action.payload.id),
                    challenges: {
                        ...state.main.challenges,
                        active: [
                            ...state.main.challenges.active,
                            {
                                ...action.payload.data,
                                createdAt: Date.now(),
                                updatedAt: Date.now(),
                                opponentInfo,
                                shouldPlay: true
                            }
                        ]
                    }
                }
            };
        case FETCH_FRIENDS:
            return { ...state, main: { ...state.main, friends: action.payload } };
        default:
            return state;
    }
};