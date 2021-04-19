import { SET_IDENTIFIER } from "./types";

export const setIdentifier = (id) => (dispatch) => {
    try {
        dispatch({
            type: SET_IDENTIFIER,
            payload: id
        });
    } catch (err) {

    }
};