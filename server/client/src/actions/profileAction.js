import {
    FETCH_PROFILE,
    SET_STATUS
} from './types';

export const fetchProfile = () => async (dispatch) => {
    const profileReq = await fetch(`/api/profile`);
    const profileData = await profileReq.json();

    dispatch({
        type: FETCH_PROFILE,
        payload: profileData
    });
};

export const setStatus = (username, status) => async (dispatch) => {
    dispatch({
        type: SET_STATUS,
        payload: { username, status }
    })
};