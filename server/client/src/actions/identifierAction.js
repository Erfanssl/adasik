import {
    SET_IDENTIFIER,
    WIPE_IDENTIFIER,
    CHANGE_IDENTIFIER_NAME
} from "./types";

export const setIdentifier = (id) => async (dispatch) => {
    try {
        dispatch({
            type: SET_IDENTIFIER,
            payload: id
        });
    } catch (err) {
        dispatch({
            type: SET_IDENTIFIER,
            payload: { FetchError: true }
        });
    }
};

export const changeIdentifierProfileName = () => async (dispatch) => {
    dispatch({
        type: CHANGE_IDENTIFIER_NAME
    });
};

export const wipeIdentifier = () => async (dispatch) => {
    dispatch({
        type: WIPE_IDENTIFIER
    });
};
