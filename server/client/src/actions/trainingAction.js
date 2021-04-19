import {
    FETCH_GAMES,
    TRAINING_SEND_DATA,
    TRAINING_GAME_WIPE_DATA
} from './trainingTypes';

export const fetchTrainings = () => async (dispatch) => {
    try {
        const trainingQuery = await fetch(`/api/training`);
        const trainingData = await trainingQuery.json();

        dispatch({
            type: FETCH_GAMES,
            payload: trainingData
        });
    } catch (err) {

    }
};

export const trainingSendData = (data) => async (dispatch) => {
    try {
        const trainingQuery = await fetch(`/api/training/finish`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const trainingData = await trainingQuery.json();

        if (trainingData.Error) {
            dispatch({
                type: TRAINING_SEND_DATA,
                payload: { Error: true }
            });
        } else {
            dispatch({
                type: TRAINING_SEND_DATA,
                payload: trainingData
            });
        }
    } catch (err) {
        dispatch({
            type: TRAINING_SEND_DATA,
            payload: { Error: true }
        });
    }
};

export const trainingGameWipeData = () => async (dispatch) => {
    dispatch({
        type: TRAINING_GAME_WIPE_DATA
    });
};