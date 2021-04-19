import {
    FETCH_DASHBOARD,
    DASHBOARD_SEND_TOOLS
} from "../actions/types";

export default (state = {}, action) => {
    switch (action.type) {
        case FETCH_DASHBOARD:
            return { ...state, ...action.payload };
        case DASHBOARD_SEND_TOOLS:
            if (state.userInfo && action.payload === 'install') return { ...state, userInfo: { ...state.userInfo, install: true } };
            if (state.userInfo && action.payload === 'notification') return { ...state, userInfo: { ...state.userInfo, notification: true } };
            return state;
        default:
            return state;
    }
};