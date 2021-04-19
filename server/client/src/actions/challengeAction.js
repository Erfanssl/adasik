import {
    FETCH_CHALLENGE_DATA,
    CREATE_CHALLENGE,
    FETCH_CHALLENGE_INSIDE_DATA,
    CREATE_GAME,
    CANCEL_GAME_REDIRECT,
    FETCH_GAME,
    FETCH_GAME_ANALYSIS,
    WIPE_GAME_ANALYSIS,
    CLOSE_RESULT,
    REJECT_REQUEST,
    ACCEPT_REQUEST,
    FETCH_FRIENDS,
    CLEAN_CREATE_CHALLENGE,
    WIPE_GAME_DATA
} from './challengeTypes';

import {
    RECEIVE_NOTIFICATION_CHALLENGES_REQUEST,
    RECEIVE_NOTIFICATION_CHALLENGES_TURN,
} from "./innerTypes";

export const fetchChallengeData = () => async (dispatch) => {
    try {
        const challengeQuery = await fetch(`/api/challenge`);
        const challengeData = await challengeQuery.json();

        dispatch({
            type: FETCH_CHALLENGE_DATA,
            payload: challengeData
        });
    } catch (err) {

    }
};

export const createChallenge = () => async (dispatch) => {
    try {
        const createChallengeQuery = await fetch(`/api/challenge/start`);
        const createChallengeData = await createChallengeQuery.json();

        dispatch({
            type: CREATE_CHALLENGE,
            payload: createChallengeData.data
        });

        dispatch({
            type: RECEIVE_NOTIFICATION_CHALLENGES_TURN
        });
    } catch (err) {

    }
};

export const cleanCreateChallenge = () => async (dispatch) => {
    dispatch({
        type: CLEAN_CREATE_CHALLENGE
    });
};

export const fetchChallengeInsideData = (id) => async (dispatch) => {
    try {
        const challengeInsideQuery = await fetch(`/api/challenge/${ id }`);
        const challengeInsideData = await challengeInsideQuery.json();

        dispatch({
            type: FETCH_CHALLENGE_INSIDE_DATA,
            payload: challengeInsideData
        });
    } catch (err) {

    }
};

export const createGame = (id, username) => async (dispatch) => {
    try {
        const createGameQuery = await fetch(`/api/challenge/play/${ id }/${ username }`);
        const createGameData = await createGameQuery.json();

        dispatch({
            type: CREATE_GAME,
            payload: `${ createGameData.userId }/${ createGameData.gameId }`
        });
    } catch (err) {

    }
};

export const cancelGameRedirect = () => async (dispatch) => {
    try {
        dispatch({
            type: CANCEL_GAME_REDIRECT
        });
    } catch (err) {

    }
};

export const fetchGame = (challengeId, gameId) => async (dispatch) => {
    try {
        const gameQuery = await fetch(`/api/challenge/game/${ challengeId }/${ gameId }`);
        const gameData = await gameQuery.json();

        dispatch({
            type: FETCH_GAME,
            payload: gameData
        });
    } catch (err) {

    }
};

export const fetchGameAnalysis = (gameId, toUsername) => async (dispatch, getState) => {
    try {
        // we send the notification through socket
        const statusSocket = getState().sockets.status;

        if (statusSocket && toUsername) {
            statusSocket.emit('challenge-turn', { toUsername });
        }

        dispatch({
            type: RECEIVE_NOTIFICATION_CHALLENGES_TURN,
            payload: 'decrement'
        });

        const gameQuery = await fetch(`/api/challenge/gameAnalysis/challenge/${ gameId }`);
        const gameData = await gameQuery.json();

        if (gameData.Error) {
            dispatch({
                type: FETCH_GAME_ANALYSIS,
                payload: { Error: true }
            });
        } else {
            dispatch({
                type: FETCH_GAME_ANALYSIS,
                payload: gameData
            });
        }
    } catch (err) {
        dispatch({
            type: FETCH_GAME_ANALYSIS,
            payload: { Error: true }
        });
    }
};

export const wipeGameAnalysis = () => async (dispatch) => {
    try {
        dispatch({
            type: WIPE_GAME_ANALYSIS
        });
    } catch (err) {

    }
};

export const wipeGameData = () => async (dispatch) => {
    dispatch({
        type: WIPE_GAME_DATA
    });
};

export const closeResult = (id) => async (dispatch) => {
    try {
        const resultQuery = await fetch(`/api/challenge/results/${ id }`);

        dispatch({
            type: CLOSE_RESULT,
            payload: id
        });
    } catch (err) {

    }
};

export const rejectRequest = (id) => async (dispatch) => {
    try {
        const requestQuery = await fetch(`/api/challenge/request/${ id }`, { method: 'DELETE' });

        dispatch({
            type: REJECT_REQUEST,
            payload: id
        });

        dispatch({
            type: RECEIVE_NOTIFICATION_CHALLENGES_REQUEST,
            payload: 'decrement'
        });
    } catch (err) {

    }
};

export const acceptRequest = (id) => async (dispatch) => {
    try {
        const requestQuery = await fetch(`/api/challenge/request/${ id }`);
        const requestData = await requestQuery.json();

        dispatch({
            type: ACCEPT_REQUEST,
            payload: {
                id,
                data: requestData
            }
        });

        dispatch({
            type: RECEIVE_NOTIFICATION_CHALLENGES_REQUEST,
            payload: 'decrement'
        });

        dispatch({
            type: RECEIVE_NOTIFICATION_CHALLENGES_TURN
        });
    } catch (err) {

    }
};

export const fetchFriends = () => async (dispatch) => {
    try {
        const friendsQuery = await fetch(`/api/friend/data/friends`);
        const friendsData = await friendsQuery.json();

        dispatch({
            type: FETCH_FRIENDS,
            payload: friendsData
        });
    } catch (err) {

    }
};

export const sendChallengeFriendRequest = (ids) => async (dispatch, getState) => {
    try {
        const sendChallengeFriendRequestQuery = await fetch(`/api/challenge/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids })
        });

        const sendChallengeFriendRequestData = await sendChallengeFriendRequestQuery.json();

        if (sendChallengeFriendRequestData.Message) {
            const statusSocket = getState().sockets.status;

            if (statusSocket) {
                const messageArr = sendChallengeFriendRequestData.Message.split(' ');
                const allowToSend = messageArr[messageArr.length - 1] === '..';
                const usernames = JSON.parse(messageArr[messageArr.length - 2]);
                if (allowToSend) {
                    usernames.forEach(username => {
                        statusSocket.emit('challenge-request', { toUsername: username });
                    });
                }
            }
        }
    } catch (err) {

    }
};