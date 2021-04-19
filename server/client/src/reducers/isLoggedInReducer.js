import {
    FETCH_IS_LOGGED_ID
} from "../actions/isLoggedInTypes";

export default (state = null, action) => {
    switch (action.type) {
        case FETCH_IS_LOGGED_ID:
            if (action.payload.error) return false;
            return action.payload.done;
        default:
            return state;
    }
};