import {
    TEST_FETCH_DATA,
    TEST_INSIDE_FETCH_DATA,
    TEST_INSIDE_SEND_DATA,
    TEST_INSIDE_SEND_FEEDBACK,
    TEST_INSIDE_FETCH_WHO_AM_I,
    TEST_INSIDE_WIPE_WHO_AM_I
} from "./testTypes";

export const testFetchData = () => async (dispatch) => {
    try {
        const testQuery = await fetch(`/api/test`);
        const testData = await testQuery.json();

        if (testData.Error) {
            dispatch({
                type: TEST_FETCH_DATA,
                payload: { Error: true }
            });
        } else {
            dispatch({
                type: TEST_FETCH_DATA,
                payload: testData
            });
        }
    } catch (err) {
        dispatch({
            type: TEST_FETCH_DATA,
            payload: { Error: true }
        });
    }
};

export const testInsideFetchData = (testName) => async (dispatch) => {
    try {
        const testQuery = await fetch(`/api/test/start/${ testName }`);
        const testData = await testQuery.json();

        if (testData.Error) {
            dispatch({
                type: TEST_INSIDE_FETCH_DATA,
                payload: { Error: true }
            });
        } else {
            dispatch({
                type: TEST_INSIDE_FETCH_DATA,
                payload: testData
            });
        }
    } catch (err) {
        dispatch({
            type: TEST_INSIDE_FETCH_DATA,
            payload: { Error: true }
        });
    }
};

export const testInsideSendData = (data) => async (dispatch) => {
    try {
        const testQuery = await fetch(`/api/test/personality-general`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const testData = await testQuery.json();

        if (testData.Error) {
            dispatch({
                type: TEST_INSIDE_SEND_DATA,
                payload: { Error: true }
            });
        } else {
            dispatch({
                type: TEST_INSIDE_SEND_DATA,
                payload: testData
            });
        }
    } catch (err) {
        dispatch({
            type: TEST_INSIDE_SEND_DATA,
            payload: { Error: true }
        });
    }
};

export const testInsideSendFeedback = (data) => async (dispatch) => {
    try {
        const testQuery = await fetch(`/api/test/feedback`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const testData = await testQuery.json();

        if (testData.Error) {
            dispatch({
                type: TEST_INSIDE_SEND_FEEDBACK,
                payload: { Error: true }
            });

            setTimeout(() => {
                dispatch({
                    type: TEST_INSIDE_SEND_FEEDBACK
                });
            }, 3000);
        } else {
            dispatch({
                type: TEST_INSIDE_SEND_FEEDBACK,
                payload: { done: true }
            });
        }
    } catch (err) {
        dispatch({
            type: TEST_INSIDE_SEND_FEEDBACK,
            payload: { Error: true }
        });

        setTimeout(() => {
            dispatch({
                type: TEST_INSIDE_SEND_FEEDBACK
            });
        }, 3000);
    }
};

export const testInsideFetchWhoAmI = () => async (dispatch) => {
    try {
        const testQuery = await fetch(`/api/test/who-am-i`);
        const testData = await testQuery.json();

        if (testData.Error) {
            dispatch({
                type: TEST_INSIDE_FETCH_WHO_AM_I,
                payload: { Error: true }
            });
        } else {
            dispatch({
                type: TEST_INSIDE_FETCH_WHO_AM_I,
                payload: testData
            });
        }
    } catch (err) {
        dispatch({
            type: TEST_INSIDE_FETCH_WHO_AM_I,
            payload: { Error: true }
        });
    }
};

export const testInsideWipeWhoAmI = () => async (dispatch) => {
    dispatch({
        type: TEST_INSIDE_WIPE_WHO_AM_I
    });
};