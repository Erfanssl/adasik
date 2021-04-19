import React, { useState, useEffect, useRef } from 'react';

const Input = ({
                   shouldMessageSent,
                   messageInputChange,
                   onMessengerInputEl,
                   onHandleMessageSent,
                   onShowMic,
                   messengerSocket,
                   fromUsername,
                   toUsername,
                   fullName,
                   shouldClear
}) => {
    const [messageInput, setMessageInput] = useState('');
    const [finishTyping, setFinishTyping] = useState(false);
    const [typingTimer, setTypingTimer] = useState(null);
    const [startTyping, setStartTyping] = useState(true);

    // refs
    const messageInputEl = useRef();

    useEffect(() => {
        if (messageInputEl.current) {
            onMessengerInputEl(messageInputEl);
        }
    }, [messageInputEl]);

    useEffect(() => {
        if (shouldMessageSent) {
            onHandleMessageSent(messageInput);
            setMessageInput('');
        }
    }, [shouldMessageSent]);

    useEffect(() => {
        setMessageInput(messageInputChange);
    }, [messageInputChange]);

    useEffect(() => {
        if (messageInput.trim().length) onShowMic(false);
        else onShowMic(true);

        if (messageInput) {
            if (typingTimer) {
                clearTimeout(typingTimer);
                setTypingTimer(null);
            }

            if (startTyping) {
                messengerSocket.emit('typing', { fromUsername, toUsername, isTyping: true, fullName });
                setStartTyping(false);
            }

            const timer = setTimeout(() => {
                setFinishTyping(true);
            }, 2000);

            setTypingTimer(timer);
        }
    }, [messageInput])

    useEffect(() => {
        if (finishTyping) {
            messengerSocket.emit('typing', { fromUsername, toUsername, isTyping: false, fullName });
            clearTimeout(typingTimer);
            setTypingTimer(null);
            setStartTyping(true);
            setFinishTyping(false);
        }
    }, [finishTyping]);

    useEffect(() => {
        if (shouldClear && shouldClear.length) {
            if (shouldClear[0]) setMessageInput('');
        }
    }, [shouldClear]);

    function onMessageInputChange(e) {
        if (!e.target.value.trim().length) return setMessageInput('');
        setMessageInput(e.target.value);
    }

    function handleInputKeyDown(e) {
        if (e.keyCode === 13) {
            onHandleMessageSent(messageInput);
            setMessageInput('');
            setFinishTyping(true);
        }
    }

    return (
        <input
            type="text"
            ref={ messageInputEl }
            onKeyDown={ handleInputKeyDown }
            onChange={ onMessageInputChange }
            value={ messageInput }
        />
    );
};

export default Input;