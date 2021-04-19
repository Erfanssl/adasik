import {
    FETCH_MAIN_SOCKET,
    FETCH_MESSENGER_SOCKET,
    FETCH_STATUS_SOCKET
} from './socketsTypes';

export const fetchMainSocket = (socket) => async (dispatch) => {
    dispatch({
        type: FETCH_MAIN_SOCKET,
        payload: socket
    });
};

export const fetchMessengerSocket = (socket) => async (dispatch) => {
    dispatch({
        type: FETCH_MESSENGER_SOCKET,
        payload: socket
    });
};

export const fetchStatusSocket = (socket) => async (dispatch) => {
    dispatch({
        type: FETCH_STATUS_SOCKET,
        payload: socket
    });
};