import {
    FETCH_IS_LOGGED_ID
} from "./isLoggedInTypes";

export const fetchIsLoggedIn = () => async (dispatch) => {
    try {
        const requireAuthQuery = await fetch(`/api/profile/name`);
        const requireAuthData = await requireAuthQuery.json();

        if (requireAuthData.NotAuthorizedError) {
            dispatch({
                type: FETCH_IS_LOGGED_ID,
                payload: { error: true }
            });
        } else {
            dispatch({
                type: FETCH_IS_LOGGED_ID,
                payload: { done: true }
            });
        }
    } catch (err) {
        dispatch({
            type: FETCH_IS_LOGGED_ID,
            payload: { error: true }
        });
    }
};