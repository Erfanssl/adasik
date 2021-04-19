import {
    FETCH_GAMES,
    TRAINING_SEND_DATA,
    TRAINING_GAME_WIPE_DATA
} from '../actions/trainingTypes';

export default (state = [], action) => {
    switch (action.type) {
        case FETCH_GAMES:
            return { data: action.payload };
        case TRAINING_SEND_DATA:
            if (action.payload.Error) return { ...state, gameAnalysisData: { Error: true } };
            return { ...state, gameAnalysisData: action.payload };
        case TRAINING_GAME_WIPE_DATA:
            return { ...state, gameAnalysisData: undefined };
        default:
            return state;
    }
};