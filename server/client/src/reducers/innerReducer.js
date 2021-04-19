import {
    FETCH_APP_NOTIFICATION,
    RECEIVE_NOTIFICATION_MESSENGER,
    RECEIVE_NOTIFICATION_FRIENDS,
    RECEIVE_NOTIFICATION_CHALLENGES_TURN,
    RECEIVE_NOTIFICATION_CHALLENGES_REQUEST
} from "../actions/innerTypes";

export default (state = {}, action) => {
    switch (action.type) {
        case FETCH_APP_NOTIFICATION:
            return action.payload;
        case RECEIVE_NOTIFICATION_MESSENGER:
            if (action.payload === 'decrement') return { ...state, newMessengerConversations: Math.max(state.newMessengerConversations - 1, 0) };
            return { ...state, newMessengerConversations: state.newMessengerConversations + 1 };
        case RECEIVE_NOTIFICATION_FRIENDS:
            if (action.payload === 'decrement') return { ...state, newFriendRequests: Math.max(state.newFriendRequests - 1, 0) };
            return { ...state, newFriendRequests: state.newFriendRequests + 1 };
        case RECEIVE_NOTIFICATION_CHALLENGES_REQUEST:
            if (action.payload === 'decrement') return { ...state, challengeRequests: Math.max(state.challengeRequests - 1, 0) };
            return { ...state, challengeRequests: state.challengeRequests + 1 };
        case RECEIVE_NOTIFICATION_CHALLENGES_TURN:
            if (action.payload === 'decrement') return { ...state, challengesShouldPlay: Math.max(state.challengesShouldPlay - 1, 0) };
            return { ...state, challengesShouldPlay: state.challengesShouldPlay + 1 };
        default:
            return state;
    }
};