import {
    TEMP_MESSAGE_SEND_DATA,
} from "./tempMessageTypes";

export const tempMessageSendData = (data) => async (dispatch) => {
    try {
        dispatch({
            type: TEMP_MESSAGE_SEND_DATA,
            payload: data
        })
    } catch (err) {

    }
};