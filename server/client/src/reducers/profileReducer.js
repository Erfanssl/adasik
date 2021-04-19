import {
    FETCH_PROFILE,
    SET_STATUS
} from '../actions/types';

export default (state = {}, action) => {
    switch (action.type) {
        case FETCH_PROFILE:
            return { ...state, ...action.payload };
        case SET_STATUS:
            return { ...state, friends: state.friends.map(friend => friend.username === action.payload.username ? { ...friend, status: action.payload.status } : friend) }
        default:
            return state;
    }
};