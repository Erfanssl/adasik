import {
    FETCH_STATISTICS_DATA,
    WIPE_STATISTICS_DATA
} from './statisticsTypes';

export const fetchStatisticsData = () => async (dispatch) => {
    try {
        const statisticsQuery = await fetch(`/api/statistics`);
        const statisticsData = await statisticsQuery.json();

        dispatch({
            type: FETCH_STATISTICS_DATA,
            payload: statisticsData
        });
    } catch (err) {

    }
};

export const wipeStatisticsData = () => async (dispatch) => {
    dispatch({
        type: WIPE_STATISTICS_DATA
    });
};
