import {
    JOIN_US_SEND_DATA
} from './joinUsTypes';

export const joinUsSendData = (data) => async (dispatch) => {
    try {
        const joinUsQuery = await fetch('/api/joinUs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const joinUsData = await joinUsQuery.json();

        if (joinUsData.Error) {
            dispatch({
                type: JOIN_US_SEND_DATA,
                payload: { Error: true }
            });

            setTimeout(() => {
                dispatch({
                    type: JOIN_US_SEND_DATA,
                    payload: { Error: false }
                });
            }, 3000);
        } else {
            dispatch({
                type: JOIN_US_SEND_DATA,
                payload: { done: true }
            });

            setTimeout(() => {
                dispatch({
                    type: JOIN_US_SEND_DATA,
                    payload: { done: false }
                });
            }, 3000);
        }
    } catch (err) {
        dispatch({
            type: JOIN_US_SEND_DATA,
            payload: { Error: true }
        });

        setTimeout(() => {
            dispatch({
                type: JOIN_US_SEND_DATA,
                payload: { Error: false }
            });
        }, 3000);
    }
};
