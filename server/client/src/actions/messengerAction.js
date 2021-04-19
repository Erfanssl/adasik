import {
    FETCH_CONVERSATIONS,
    FETCH_INDIVIDUAL_CONVERSATION,
    UPDATE_MESSAGE_STATUS,
    SUBMIT_NEW_MESSAGE,
    UPDATE_MESSAGE_TEXT,
    DELETE_MESSAGE_FOR_ME,
    DELETE_MESSAGE_FOR_EVERYONE,
    MESSENGER_UPDATE_USER_STATUS
} from './messengerTypes';
import { TEMP_MESSAGE_WIPE_DATA } from "./tempMessageTypes";

import {
    RECEIVE_NOTIFICATION_MESSENGER
} from "./innerTypes";

export const wipeTempMessage = () => async (dispatch, getState) => {
    if (getState().messenger.conversationData) {
        dispatch({
            type: TEMP_MESSAGE_WIPE_DATA
        });
    }
};

export const fetchMessages = () => async (dispatch, getState) => {
    try {
        const messengerReq = await fetch(`/api/messenger`);
        const messengerData = await messengerReq.json();

        if (Object.keys(getState().tempMessage).length) {
            dispatch({
                type: FETCH_CONVERSATIONS,
                payload: { messengerData, conversationData: { ...getState().tempMessage, isFromProfile: true } }
            });
        }

        dispatch({
            type: FETCH_CONVERSATIONS,
            payload: { messengerData, conversationData: false }
        });
    } catch (err) {

    }
};

export const fetchIndividualConversation = (conversationId, fullName, messengerStatus, isNew, isExiting = false, username) => async (dispatch, getState) => {
    try {
        if (isExiting) {
            return dispatch({
                type: FETCH_INDIVIDUAL_CONVERSATION,
                payload: undefined
            });
        }

        let messageBucket;

        if (!isNew) {
            messageBucket = getState().messenger.conversationData.messageBucket;
        }

        messageBucket = messageBucket ? (messageBucket + 1) : 1;

        async function dataGetter() {
            const conversationReq = await fetch(`/api/messenger/${ conversationId }/${ 10 * messageBucket }`);
            const conversationData = await conversationReq.json();

            const replyIds = conversationData.messages.filter(m => m.reply).map(m => m.reply);

            let shouldUpdate = false;
            replyIds.forEach(r => {
                if (!conversationData.messages.find(m => m._id === r)) {
                    shouldUpdate = true;
                }
            });

            if (shouldUpdate) {
                messageBucket += 1;
                return await dataGetter();
            }

            return conversationData;
        }

        const conversationData = await dataGetter();

        conversationData.fullName = fullName;
        conversationData.messengerStatus = messengerStatus;
        conversationData.messageBucket = messageBucket;
        conversationData.username = username;

        dispatch({
            type: FETCH_INDIVIDUAL_CONVERSATION,
            payload: conversationData
        });
    } catch (err) {

    }
};

export const updateMessageStatus = (messageId, status, conversationPersonId) => async (dispatch) => {
    try {
        const body = {
            messageId,
            status
        };

        await fetch(`/api/messenger`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        dispatch({
            type: UPDATE_MESSAGE_STATUS,
            payload: {
                messageId,
                status,
                conversationPersonId // when comes with socket, it means the id of the person in the persons
            }
        });
    } catch (err) {

    }
};

export const submitNewMessage = (messageData = {}, personId, messengerSocket, statusSocket, buffer = false, userInfo) => async (dispatch, getState) => {
    try {
        // first dispatch for when data is not yet saved to DB
        // message._id = (Math.random() * 64).toString();
        // message.toMessageId = (Math.random() * 64).toString();
        // message.createdAt = Date.now();
        // message.side = 'host';
        // message.status = 'pending';
        //
        // dispatch({
        //     type: SUBMIT_NEW_MESSAGE,
        //     payload: {
        //         message,
        //         personId,
        //         shouldUpdateConversationData: true
        //     }
        // });


        if (buffer) {
            const bufRequest = await fetch(`/api/messenger/${personId}`, {
                method: 'POST',
                body: buffer
            });

            const { data: { senderMessage, receiverMessage } } = await bufRequest.json();
            messageData.isBuf = true;
            messageData.message = senderMessage;
            messageData.messageBuf = { senderMessage, receiverMessage };
        }

        const submitMessageQuery = await fetch(`/api/messenger/${personId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(messageData)
        });

        const { data: { messageId, toMessageId, createdAt } } = await submitMessageQuery.json();

        messageData._id = messageId;
        messageData.toMessageId = toMessageId;
        messageData.createdAt = createdAt;
        messageData.side = 'host';
        messageData.status = 'sent';

        dispatch({
            type: SUBMIT_NEW_MESSAGE,
            payload: {
                message: messageData,
                personId,
                shouldUpdateConversationData: true
            }
        });

        // handling socket data transfer
        // main socket to show in the what's new
        let conversation = getState().messenger.conversations.find(conv => conv.userId === messageData.to);
        // // we need the username of the sender
        // const userQuery = await fetch(`/api/profile`);
        // const userData = await userQuery.json();
        if (!conversation && (Object.keys(getState().tempMessage).length)) {
            conversation = getState().tempMessage;

            dispatch({
                type: TEMP_MESSAGE_WIPE_DATA
            });
        }

        // messenger socket
        messengerSocket.emit('messageSent', {
            fromUsername: userInfo.username,
            toUsername: conversation.username,
            fullName: conversation.fullName,
            userInfo,
            message: messageData
        });


        // status socket
        const statusSocket = getState().sockets.status;

        statusSocket.emit('new-message', {
            toUsername: conversation.username,
        });
    } catch (err) {

    }
};

export const submitNewMessageFromSocket = (message, personId, shouldUpdateConversationData, userInfo) => async (dispatch, getState) => {
    try {
        // we need to know about the sender of the message for when the person is not in the conversations list.
        const newMessage = { ...message, _id: message.toMessageId, toMessageId: message._id };

        dispatch({
            type: SUBMIT_NEW_MESSAGE,
            payload: {
                message: newMessage,
                personId,
                shouldUpdateConversationData,
                userInfo,
                fromSocket: true
            }
        });

        // now we should change the unseen of this user's conversation to 0 if they're in the messenger and seeing the message(s)
        if (shouldUpdateConversationData) {
            await fetch(`/api/messenger/unseen`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ encryptedPersonId: personId })
            });
        } else {
            // now we should update the notification
            // but first we should see if the unseen is one (because when it gets here, it got updated)
            const conversation = getState().messenger.conversations.find(conv => conv.userId === personId);
            if (conversation && conversation.unseen === 1) {
                dispatch({
                    type: RECEIVE_NOTIFICATION_MESSENGER
                });
            }
        }
    } catch (err) {

    }
};

export const messengerStart = () => async () => {
    try {
        await fetch(`/api/messenger/start`);
    } catch (err) {

    }
};

export const updateMessageText = (message, personId, messageId, isLast, type, messengerSocket, messageData, toMessageId) => async (dispatch, getState) => {
    try {
        // constructing data
        const data = {
            newMessage: message,
            messageId,
            type,
            isLast,
            personId,
            shouldUpdateConversationData: true
        };

        dispatch({
            type: UPDATE_MESSAGE_TEXT,
            payload: data
        });

        await fetch(`/api/messenger`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // handling socket data transfer
        // main socket to show in the what's new
        const conversation = getState().messenger.conversations.find(conv => conv.userId === personId);

        const newMessageData = { ...messageData, type, toMessageId };

        // messenger socket
        messengerSocket.emit('messageUpdatedSent', {
            toUsername: conversation.username,
            fullName: conversation.fullName,
            message: newMessageData,
            isLast
        });
    } catch (err) {

    }
};

export const updateMessageTextFromSocket = (message, personId, messageId, isLast, type, shouldUpdateConversationData) => async (dispatch) => {
    try {
        // constructing data
        const data = {
            newMessage: message,
            messageId,
            type,
            isLast,
            personId,
            shouldUpdateConversationData
        };

        dispatch({
            type: UPDATE_MESSAGE_TEXT,
            payload: data
        });
    } catch (err) {

    }
};

export const deleteMessageForMe = (id, personId, isLast) => async (dispatch) => {
    // constructing data
    const data = {
        messageId: id,
        type: 'deleteForMe',
        oneWay: true,
        personId
    };

    data.isLast = isLast;

    dispatch({
        type: DELETE_MESSAGE_FOR_ME,
        payload: data
    });

    await fetch(`/api/messenger`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });
};

export const deleteMessageForEveryone = (id, personId, isLast, from, toMessageId, messengerSocket) => async (dispatch, getState) => {
    // constructing data
    const data = {
        messageId: id,
        type: 'deleteForEveryone',
        oneWay: false,
        personId,
        shouldUpdateConversationData: true
    };

    data.isLast = isLast;

    dispatch({
        type: DELETE_MESSAGE_FOR_EVERYONE,
        payload: data
    });

    await fetch(`/api/messenger`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    // handling socket data transfer
    // main socket to show in the what's new
    const conversation = getState().messenger.conversations.find(conv => conv.userId === personId);

    messengerSocket.emit('messageDeleted', {
        toUsername: conversation.username,
        fullName: conversation.fullName,
        isLast,
        message: {
            from,
            toMessageId
        }
    });
};

export const deleteMessageFromSocket = (personId, messageId, isLast, shouldUpdateConversationData) => async (dispatch) => {
    // constructing data
    const data = {
        messageId,
        type: 'deleteForEveryone',
        personId,
        shouldUpdateConversationData
    };

    data.isLast = isLast;

    dispatch({
        type: DELETE_MESSAGE_FOR_EVERYONE,
        payload: data
    });
};

export const messengerUpdateUserStatus = (username, status) => async (dispatch) => {
    dispatch({
        type: MESSENGER_UPDATE_USER_STATUS,
        payload: { username, status }
    });
};