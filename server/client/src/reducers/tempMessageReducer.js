import {
    TEMP_MESSAGE_SEND_DATA,
    TEMP_MESSAGE_WIPE_DATA
} from "../actions/tempMessageTypes";

export default (state = {}, action) => {
    switch (action.type) {
        case TEMP_MESSAGE_SEND_DATA:
            return action.payload;
        case TEMP_MESSAGE_WIPE_DATA:
            return {};
        default:
            return state;
    }
}