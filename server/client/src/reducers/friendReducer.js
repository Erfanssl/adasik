import {
    FETCH_FRIENDS_DATA,
    ACCEPT_FRIEND_REQUEST,
    REJECT_FRIEND_REQUEST,
    DELETE_FRIEND
} from '../actions/friendsTypes';

import { SET_STATUS } from "../actions/types";

export default function (state = {}, action) {
    switch (action.type) {
        case FETCH_FRIENDS_DATA:
            return { ...action.payload, requestAccepted: false, requestRejected: false, friendDeleted: false };
        case ACCEPT_FRIEND_REQUEST:
            if (action.payload.Error) return { ...state, requestError: action.payload.Error };
            return { ...state, requestAccepted: true };
        case REJECT_FRIEND_REQUEST:
            if (action.payload.Error) return { ...state, requestError: action.payload.Error };
            return { ...state, requestRejected: true };
        case DELETE_FRIEND:
            if (action.payload.Error) return { ...state, friendError: action.payload.Error };
            return { ...state, friendDeleted: true };
        case SET_STATUS:
            return {
                ...state,
                friends: state.friends.map(friend =>
                        friend.username === action.payload.username ? { ...friend, status: { ...friend.status, text: action.payload.status } } : friend) };
        default:
            return state;
    }
}