import {
    REQUIRE_AUTH_FETCH_DATA,
    REQUIRE_AUTH_WIPE_DATA
} from "./requireAuthTypes";

export const requireAuthFetchData = () => async (dispatch) => {
    try {
        const requireAuthQuery = await fetch(`/api/profile/name`);
        const requireAuthData = await requireAuthQuery.json();

        if (requireAuthData.NotAuthorizedError) {
            dispatch({
                type: REQUIRE_AUTH_FETCH_DATA,
                payload: { NotAuthorizedError: true }
            });
        }

        else if (!requireAuthData.name) {
            dispatch({
                type: REQUIRE_AUTH_FETCH_DATA,
                payload: { IncompleteProfileError: true }
            });
        }

        else if (requireAuthData.name) {
            dispatch({
                type: REQUIRE_AUTH_FETCH_DATA,
                payload: { done: true }
            });
        }
    } catch (err) {
        dispatch({
            type: REQUIRE_AUTH_FETCH_DATA,
            payload: { FetchError: true }
        });
    }
};

export const requireAuthWipeData = () => async (dispatch) => {
    dispatch({
        type: REQUIRE_AUTH_WIPE_DATA
    });
};