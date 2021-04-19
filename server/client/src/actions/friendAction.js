import {
    FETCH_FRIENDS_DATA,
    ACCEPT_FRIEND_REQUEST,
    REJECT_FRIEND_REQUEST,
    DELETE_FRIEND
} from './friendsTypes';

import {
    RECEIVE_NOTIFICATION_FRIENDS
} from "./innerTypes";

export const fetchFriendsData = () => async (dispatch) => {
    try {
        const friendsQuery = await fetch(`/api/friend/data/complete`);
        const friendsData = await friendsQuery.json();

        dispatch({
            type: FETCH_FRIENDS_DATA,
            payload: friendsData
        });
    } catch (err) {

    }
};

export const acceptFriendRequest = (id) => async (dispatch) => {
    try {
        const friendQuery = await fetch(`/api/friend/request/${ id }`);
        const friendData = await friendQuery.json();

        dispatch({
            type: ACCEPT_FRIEND_REQUEST,
            payload: friendData
        });

        dispatch({
            type: RECEIVE_NOTIFICATION_FRIENDS,
            payload: 'decrement'
        });
    } catch (err) {

    }
};

export const rejectFriendRequest = (id) => async (dispatch) => {
    try {
        const friendQuery = await fetch(`/api/friend/request/${ id }`, { method: 'DELETE' });
        const friendData = await friendQuery.json();

        dispatch({
            type: REJECT_FRIEND_REQUEST,
            payload: friendData
        });

        dispatch({
            type: RECEIVE_NOTIFICATION_FRIENDS,
            payload: 'decrement'
        });
    } catch (err) {

    }
};

export const deleteFriend = (id) => async (dispatch) => {
    try {
        const friendQuery = await fetch(`/api/friend/delete/${ id }`, { method: 'DELETE' });
        const friendData = await friendQuery.json();

        dispatch({
            type: DELETE_FRIEND,
            payload: friendData
        });
    } catch (err) {
        dispatch({
            type: DELETE_FRIEND,
            payload: { Error: 'Error' }
        });
    }
};
