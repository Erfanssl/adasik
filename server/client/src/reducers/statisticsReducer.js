import {
    FETCH_STATISTICS_DATA,
    WIPE_STATISTICS_DATA
} from '../actions/statisticsTypes';

export default (state = {}, action) => {
    switch (action.type) {
        case FETCH_STATISTICS_DATA:
            return action.payload;
        case WIPE_STATISTICS_DATA:
            return {};
        default:
            return state;
    }
};
