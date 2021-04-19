import {
    FETCH_APP_NOTIFICATION,
    RECEIVE_NOTIFICATION_FRIENDS,
    RECEIVE_NOTIFICATION_MESSENGER,
    RECEIVE_NOTIFICATION_CHALLENGES_REQUEST,
    RECEIVE_NOTIFICATION_CHALLENGES_TURN
} from "./innerTypes";

export const fetchAppNotification = () => async (dispatch) => {
    try {
        const innerQuery = await fetch(`/api/inner/inner-notification`);
        const innerData = await innerQuery.json();

        dispatch({
            type: FETCH_APP_NOTIFICATION,
            payload: innerData
        });
    } catch (err) {

    }
};

export const receiveNotificationFriends = (notificationType = 'increment') => async (dispatch) => {
    dispatch({
        type: RECEIVE_NOTIFICATION_FRIENDS,
        payload: notificationType
    });
};

export const receiveNotificationMessenger = (notificationType = 'increment') => async (dispatch) => {
    dispatch({
        type: RECEIVE_NOTIFICATION_MESSENGER,
        payload: notificationType
    });
};

export const receiveNotificationChallengesRequest = (notificationType = 'increment') => async (dispatch) => {
    dispatch({
        type: RECEIVE_NOTIFICATION_CHALLENGES_REQUEST,
        payload: notificationType
    });
};

export const receiveNotificationChallengesTurn = (notificationType = 'increment') => async (dispatch) => {
    dispatch({
        type: RECEIVE_NOTIFICATION_CHALLENGES_TURN,
        payload: notificationType
    });
};