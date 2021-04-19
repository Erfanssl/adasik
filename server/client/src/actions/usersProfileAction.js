import {
    USERS_PROFILE_FETCH_DATA,
    USERS_PROFILE_SEND_FRIEND_REQUEST,
    USERS_PROFILE_SEND_CHALLENGE_REQUEST,
    USERS_PROFILE_SEND_LIKE,
    USERS_PROFILE_SEND_BLOCK,
    USERS_PROFILE_SEND_REPORT,
    USERS_PROFILE_FETCH_SEARCH,
    USERS_PROFILE_WIPE_SEARCH,
    USERS_PROFILE_WIPE_DATA
} from "./usersProfileTypes";

export const usersProfileFetchData = (username) => async (dispatch) => {
    try {
        const usersProfileQuery = await fetch(`/api/profile/users/${ username }`);

        const usersProfileData = await usersProfileQuery.json();

        dispatch({
            type: USERS_PROFILE_FETCH_DATA,
            payload: usersProfileData
        });
    } catch (err) {

    }
};

export const usersProfileSendFriendRequest = (id) => async (dispatch, getState) => {
    try {
        const sendFriendRequestQuery = await fetch(`/api/friend/request/create/${ id }`);
        const sendFriendRequestData = await sendFriendRequestQuery.json();

        if (sendFriendRequestData.Error) {
            dispatch({
                type: USERS_PROFILE_SEND_FRIEND_REQUEST,
                payload: { Error: true }
            });

            setTimeout(() => {
                dispatch({
                    type: USERS_PROFILE_SEND_FRIEND_REQUEST
                });
            }, 3000);
        }
        else {
            const statusSocket = getState().sockets.status;

            if (statusSocket) {
                const messageArr = sendFriendRequestData.Message.split(' ');
                const allowToSend = messageArr[messageArr.length - 1] === '..';
                const username = messageArr[messageArr.length - 2];
                if (allowToSend) statusSocket.emit('friend-request', { toUsername: username });
            }

            dispatch({
                type: USERS_PROFILE_SEND_FRIEND_REQUEST,
                payload: { done: true }
            });

            setTimeout(() => {
                dispatch({
                    type: USERS_PROFILE_SEND_FRIEND_REQUEST
                });
            }, 3000);
        }
    } catch (err) {
        dispatch({
            type: USERS_PROFILE_SEND_FRIEND_REQUEST,
            payload: { Error: true }
        });

        setTimeout(() => {
            dispatch({
                type: USERS_PROFILE_SEND_FRIEND_REQUEST
            });
        }, 3000);
    }
};

export const usersProfileSendChallengeRequest = (id) => async (dispatch, getState) => {
    try {
        const sendChallengeRequestQuery = await fetch(`/api/challenge/request`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ids: [id] })
        });

        const sendChallengeRequestData = await sendChallengeRequestQuery.json();

        if (sendChallengeRequestData.ChallengeError) {
            dispatch({
                type: USERS_PROFILE_SEND_CHALLENGE_REQUEST,
                payload: { ChallengeError: true }
            });

            setTimeout(() => {
                dispatch({
                    type: USERS_PROFILE_SEND_CHALLENGE_REQUEST
                });
            }, 3000);
        }

        if (sendChallengeRequestData.RequestError) {
            dispatch({
                type: USERS_PROFILE_SEND_CHALLENGE_REQUEST,
                payload: { RequestError: true }
            });

            setTimeout(() => {
                dispatch({
                    type: USERS_PROFILE_SEND_CHALLENGE_REQUEST
                });
            }, 3000);
        }

        if (sendChallengeRequestData.Error) {
            dispatch({
                type: USERS_PROFILE_SEND_CHALLENGE_REQUEST,
                payload: { Error: true }
            });

            setTimeout(() => {
                dispatch({
                    type: USERS_PROFILE_SEND_CHALLENGE_REQUEST
                });
            }, 3000);
        }

        if (sendChallengeRequestData.Message) {
            const statusSocket = getState().sockets.status;

            if (statusSocket) {
                const messageArr = sendChallengeRequestData.Message.split(' ');
                const allowToSend = messageArr[messageArr.length - 1] === '..';
                const usernames = JSON.parse(messageArr[messageArr.length - 2]);
                if (allowToSend) {
                    usernames.forEach(username => {
                        statusSocket.emit('challenge-request', { toUsername: username });
                    });
                }
            }

            dispatch({
                type: USERS_PROFILE_SEND_CHALLENGE_REQUEST,
                payload: { done: true }
            });

            setTimeout(() => {
                dispatch({
                    type: USERS_PROFILE_SEND_CHALLENGE_REQUEST
                });
            }, 3000);
        }
    } catch (err) {
        dispatch({
            type: USERS_PROFILE_SEND_CHALLENGE_REQUEST,
            payload: { Error: true }
        });

        setTimeout(() => {
            dispatch({
                type: USERS_PROFILE_SEND_CHALLENGE_REQUEST
            });
        }, 3000);
    }
};

export const usersProfileSendLike = (id) => async (dispatch) => {
    try {
        const likeQuery = await fetch(`/api/profile/like/${ id }`);
        const likeData = await likeQuery.json();

        if (likeData.Error) {
            dispatch({
                type: USERS_PROFILE_SEND_LIKE,
                payload: { Error: true }
            });

            setTimeout(() => {
                dispatch({
                    type: USERS_PROFILE_SEND_LIKE
                });
            }, 3000);
        }

        if (likeData.type && likeData.type === 'like') {
            dispatch({
                type: USERS_PROFILE_SEND_LIKE,
                payload: { like: true }
            });

            setTimeout(() => {
                dispatch({
                    type: USERS_PROFILE_SEND_LIKE
                });
            }, 3000);
        }

        if (likeData.type && likeData.type === 'dislike') {
            dispatch({
                type: USERS_PROFILE_SEND_LIKE,
                payload: { dislike: true }
            });

            setTimeout(() => {
                dispatch({
                    type: USERS_PROFILE_SEND_LIKE
                });
            }, 3000);
        }
    } catch (err) {
        dispatch({
            type: USERS_PROFILE_SEND_LIKE,
            payload: { Error: true }
        });

        setTimeout(() => {
            dispatch({
                type: USERS_PROFILE_SEND_LIKE
            });
        }, 3000);
    }
};

export const usersProfileSendBlock = (id) => async (dispatch) => {
    try {
        const blockQuery = await fetch(`/api/profile/block/${ id }`);
        const blockData = await blockQuery.json();

        if (blockData.Error) {
            dispatch({
                type: USERS_PROFILE_SEND_BLOCK,
                payload: { Error: true }
            });

            setTimeout(() => {
                dispatch({
                    type: USERS_PROFILE_SEND_BLOCK
                });
            }, 3000);
        }

        if (blockData.Message) {
            dispatch({
                type: USERS_PROFILE_SEND_BLOCK,
                payload: { done: true }
            });

            setTimeout(() => {
                dispatch({
                    type: USERS_PROFILE_SEND_BLOCK
                });
            }, 3000);
        }
    } catch (err) {
        dispatch({
            type: USERS_PROFILE_SEND_BLOCK,
            payload: { Error: true }
        });

        setTimeout(() => {
            dispatch({
                type: USERS_PROFILE_SEND_BLOCK
            });
        }, 3000);
    }
};

export const usersProfileSendReport = (id) => async (dispatch) => {
    try {
        const reportQuery = await fetch(`/api/profile/report/${ id }`);
        const reportData = await reportQuery.json();

        if (reportData.Error) {
            dispatch({
                type: USERS_PROFILE_SEND_REPORT,
                payload: { Error: true }
            });

            setTimeout(() => {
                dispatch({
                    type: USERS_PROFILE_SEND_REPORT
                });
            }, 3000);
        }

        if (reportData.Message) {
            dispatch({
                type: USERS_PROFILE_SEND_REPORT,
                payload: { done: true }
            });

            setTimeout(() => {
                dispatch({
                    type: USERS_PROFILE_SEND_REPORT
                });
            }, 3000);
        }
    } catch (err) {
        dispatch({
            type: USERS_PROFILE_SEND_REPORT,
            payload: { Error: true }
        });

        setTimeout(() => {
            dispatch({
                type: USERS_PROFILE_SEND_REPORT
            });
        }, 3000);
    }
};

export const usersProfileFetchSearch = (wordToSearch) => async (dispatch) => {
    try {
        const searchQuery = await fetch(`/api/profile/search/${ wordToSearch }`);
        const searchData = await searchQuery.json();

        if (searchData.Error) {
            dispatch({
                type: USERS_PROFILE_FETCH_SEARCH,
                payload: { Error: true }
            });

            setTimeout(() => {
                dispatch({
                    type: USERS_PROFILE_FETCH_SEARCH
                });
            }, 3000);
        }

        if (Array.isArray(searchData)) {
            dispatch({
                type: USERS_PROFILE_FETCH_SEARCH,
                payload: searchData
            });
        }
    } catch (err) {

    }
};

export const usersProfileWipeSearch = () => async (dispatch) => {
    dispatch({
        type: USERS_PROFILE_WIPE_SEARCH
    });
};

export const usersProfileWipeData = () => async (dispatch) => {
    dispatch({
        type: USERS_PROFILE_WIPE_DATA
    })
};