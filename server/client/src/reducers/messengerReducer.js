import {
    FETCH_CONVERSATIONS,
    FETCH_INDIVIDUAL_CONVERSATION,
    UPDATE_MESSAGE_STATUS,
    SUBMIT_NEW_MESSAGE,
    UPDATE_MESSAGE_TEXT,
    DELETE_MESSAGE_FOR_ME,
    DELETE_MESSAGE_FOR_EVERYONE,
    MESSENGER_UPDATE_USER_STATUS
} from '../actions/messengerTypes';

export default (state = {}, action) => {
    switch (action.type) {
        case FETCH_CONVERSATIONS:
            if (action.payload.conversationData) return { ...state, conversations: action.payload.messengerData.persons, userId: action.payload.messengerData.userId, userInfo: action.payload.messengerData.userInfo, conversationData: action.payload.conversationData };
            return { ...state, conversations: action.payload.messengerData.persons, userId: action.payload.messengerData.userId, userInfo: action.payload.messengerData.userInfo };
        case FETCH_INDIVIDUAL_CONVERSATION:
            return { ...state, conversationData: action.payload };
        case MESSENGER_UPDATE_USER_STATUS:
            let newConversationData;
            if (state.conversationData && state.conversationData.username === action.payload.username) {
                newConversationData = { ...state.conversationData, messengerStatus: { text: action.payload.status, date: new Date() } };
            }

            if (newConversationData) return { ...state, conversationData: newConversationData, conversations: state.conversations.map(conv => conv.username === action.payload.username ? ({ ...conv, messengerStatus: { text: action.payload.status, date: new Date() } }) : conv) };
            return { ...state, conversations: state.conversations.map(conv => conv.username === action.payload.username ? ({ ...conv, messengerStatus: { text: action.payload.status, date: new Date() } }) : conv) };
        case UPDATE_MESSAGE_STATUS:
            return {
                ...state,
                conversations: action.payload.status === 'seen' ?
                    state.conversations.map(
                    c => c.userId === action.payload.conversationPersonId ? { ...c, unseen: 0 } : c) :
                    state.conversations,
                conversationData: {
                    ...state.conversationData,
                    messages: action.payload.status === 'delivered' ?
                        state.conversationData.messages.map(message => (message.status === 'sent' || message.status === 'pending') ? ({ ...message, status: 'delivered' }) : message )
                        : state.conversationData.messages.map(m => m._id === action.payload.messageId ? { ...m, status: action.payload.status } : m)
                }
            };
        case SUBMIT_NEW_MESSAGE:
            const isInConversation = state.conversations.find(conv => conv.userId === action.payload.personId);
            let conversations;
            if (!isInConversation) {
                if (action.payload.fromSocket) {
                    conversations = [...state.conversations, { userId: action.payload.message.from, messages: [ action.payload.message ], messengerStatus: action.payload.userInfo.messengerStatus, avatar: action.payload.userInfo.avatar, fullName: action.payload.userInfo.fullName , unseen: 1 }];
                } else {
                    conversations = [...state.conversations, { userId: action.payload.message.from, messages: [ action.payload.message ], messengerStatus: state.conversationData.messengerStatus, unseen: 1 }];
                }
            }
            else conversations = action.payload.shouldUpdateConversationData ? state.conversations.map(conv => conv.userId === action.payload.personId ? { ...conv, messages: [ action.payload.message ] } : conv) : state.conversations.map(conv => conv.userId === action.payload.personId ? { ...conv, messages: [ action.payload.message ], unseen: conv.unseen + 1 } : conv);
            const conversationData = action.payload.shouldUpdateConversationData ? ({ ...state.conversationData, messages: [ ...state.conversationData.messages, action.payload.message ] }) : state.conversationData;
            if (state.conversationData && state.conversationData.isFromProfile) conversationData.shouldConversationReload = true;
            return {
                ...state,
                conversations,
                conversationData
            };
        case UPDATE_MESSAGE_TEXT:
            return {
                ...state,
                conversations: action.payload.isLast ? (state.conversations.map(conv => conv.userId === action.payload.personId ? { ...conv, messages: [ { ...conv.messages[0], message: action.payload.newMessage } ] } : conv)) : state.conversations,
                conversationData: action.payload.shouldUpdateConversationData ? ({ ...state.conversationData, messages: state.conversationData.messages.map(m => m._id === action.payload.messageId ? { ...m, message: action.payload.newMessage, type: action.payload.type } : m) }) : state.conversationData
            };
        case DELETE_MESSAGE_FOR_ME:
            return {
                ...state,
                conversations: action.payload.isLast ? (state.conversations.map(conv => conv.userId === action.payload.personId ? { ...conv, messages: [ { ...conv.messages[0], type: action.payload.type } ] } : conv)) : state.conversations,
                conversationData: { ...state.conversationData, messages: state.conversationData.messages.map(m => m._id === action.payload.messageId ? { ...m, type: action.payload.type } : m) }
            };
        case DELETE_MESSAGE_FOR_EVERYONE:
            return {
                ...state,
                conversations: action.payload.isLast ? (state.conversations.map(conv => conv.userId === action.payload.personId ? { ...conv, messages: [ { ...conv.messages[0], type: action.payload.type } ] } : conv)) : state.conversations,
                conversationData: action.payload.shouldUpdateConversationData ? ({ ...state.conversationData, messages: state.conversationData.messages.map(m => m._id === action.payload.messageId ? { ...m, type: action.payload.type } : m) }) : state.conversationData
            };
        default:
            return state;
    }
};