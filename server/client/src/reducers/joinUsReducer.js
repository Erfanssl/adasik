import {
    JOIN_US_SEND_DATA,
} from '../actions/joinUsTypes';

export default (state = {}, action) => {
    switch (action.type) {
        case JOIN_US_SEND_DATA:
            if (action.payload.Error) return { Error: true, done: false };
            if (action.payload.done) return { Error: false, done: true };
            return { Error: false, done: false }
        default:
            return state;
    }
};
