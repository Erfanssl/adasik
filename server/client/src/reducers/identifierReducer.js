import { SET_IDENTIFIER } from "../actions/types";

export default (state = {}, action) => {
    switch (action.type) {
        case SET_IDENTIFIER:
            return action.payload;
        default:
            return state;
    }
};