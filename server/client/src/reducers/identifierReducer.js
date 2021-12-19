import {
    SET_IDENTIFIER,
    WIPE_IDENTIFIER,
    CHANGE_IDENTIFIER_NAME
} from "../actions/types";

export default (state = null, action) => {
    switch (action.type) {
        case SET_IDENTIFIER:
            if (action.payload.FetchError) return { FetchError: true };
            return action.payload;
        case CHANGE_IDENTIFIER_NAME:
            if (!state.name) return { ...state, name: true };
            return state;
        case WIPE_IDENTIFIER:
            return { NotAuthorizedError: true };
        default:
            return state;
    }
};
