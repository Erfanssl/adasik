import {
    FETCH_MAIN_SOCKET,
    FETCH_MESSENGER_SOCKET,
    FETCH_STATUS_SOCKET
} from '../actions/socketsTypes';

export default (state = {}, action) => {
    switch (action.type) {
        case FETCH_STATUS_SOCKET:
            return { ...state, status: action.payload };
        case FETCH_MESSENGER_SOCKET:
            return { ...state, messenger: action.payload };
        case FETCH_MAIN_SOCKET:
            return { ...state, main: action.payload };
        default:
            return state;
    }
};