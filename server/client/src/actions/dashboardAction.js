import {
    FETCH_DASHBOARD,
    DASHBOARD_SEND_TOOLS
} from './types';

export const fetchDashboard = () => async (dispatch) => {
    const dashReq = await fetch(`/api/dashboard`);
    const dashData = await dashReq.json();

    dispatch({
        type: FETCH_DASHBOARD,
        payload: dashData
    })
};

export const dashboardSendTools = (type) => async (dispatch) => {
    try {
        const dashboardQuery = await fetch(`/api/dashboard/tools`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ type })
        });

        const dashboardData = await dashboardQuery.json();

        if (dashboardData.Message) {
            dispatch({
                type: DASHBOARD_SEND_TOOLS,
                payload: type
            });
        }
        // we don't need to dispatch anything
    } catch (err) {

    }
};