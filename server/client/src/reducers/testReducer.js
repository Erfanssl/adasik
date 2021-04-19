import {
    TEST_FETCH_DATA,
    TEST_INSIDE_FETCH_DATA,
    TEST_INSIDE_SEND_DATA,
    TEST_INSIDE_SEND_FEEDBACK,
    TEST_INSIDE_FETCH_WHO_AM_I,
    TEST_INSIDE_WIPE_WHO_AM_I
} from "../actions/testTypes";

export default (state = [], action) => {
    switch (action.type) {
        case TEST_FETCH_DATA:
            if (action.payload.Error) return { ...state, Error: true };
            return { ...state, main: action.payload };
        case TEST_INSIDE_FETCH_DATA:
            if (action.payload.Error) return { ...state, inside: { ...state.inside, Error: true } };
            return { ...state, inside: action.payload };
        case TEST_INSIDE_SEND_DATA:
            if (action.payload.Error) return { ...state, inside: { ...state.inside, result: { Error: true } } };
            return { ...state, inside: { ...state.inside, result: action.payload } };
        case TEST_INSIDE_SEND_FEEDBACK:
            if (action.payload.Error) return { ...state, inside: { ...state.inside, feedback: { Error: true } } };
            if (action.payload.done) return { ...state, inside: { ...state.inside, feedback: { Error: false, done: true } } };
            return { ...state, inside: { ...state.inside, feedback: { Error: false, done: false } } };
        case TEST_INSIDE_FETCH_WHO_AM_I:
            if (action.payload.Error) return { ...state, whoAmI: { ...state.whoAmI, Error: true } };
            return { ...state, whoAmI: action.payload };
        case TEST_INSIDE_WIPE_WHO_AM_I:
            return { ...state, whoAmI: undefined };
        default:
            return state;
    }
};