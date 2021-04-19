import {
    REQUIRE_AUTH_FETCH_DATA,
    REQUIRE_AUTH_WIPE_DATA
} from "../actions/requireAuthTypes";

export default (state = {}, action) => {
    switch (action.type) {
        case REQUIRE_AUTH_FETCH_DATA:
            if (action.payload.NotAuthorizedError) return { NotAuthorizedError: true, IncompleteProfileError: false, FetchError: false, done: false };
            if (action.payload.IncompleteProfileError) return { NotAuthorizedError: false, IncompleteProfileError: true, FetchError: false, done: false };
            if (action.payload.FetchError) return { NotAuthorizedError: false, IncompleteProfileError: false, FetchError: true, done: false };
            return { NotAuthorizedError: false, IncompleteProfileError: false, FetchError: false, done: true };
        case REQUIRE_AUTH_WIPE_DATA:
            return { NotAuthorizedError: false, IncompleteProfileError: false, FetchError: false, done: false };
        default:
            return state;
    }
};