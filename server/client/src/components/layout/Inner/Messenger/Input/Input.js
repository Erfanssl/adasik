import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import './Input.scss';

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
    const [inputStyle, setInputStyle] = useState({});

    // refs
    const messageInputEl = useRef();

    const shiftPress = useRef(false);
    const ctrlPress = useRef(false);
    const enterPress = useRef(false);
    const spacePress = useRef(false);
    const cursorPosition = useRef(0);
    const scrollTop = useRef(0);

    useEffect(() => {
        if (messageInputEl.current) {
            onMessengerInputEl(messageInputEl);
        }
    }, [messageInputEl]);

    useEffect(() => {
        if (shouldMessageSent) {
            onHandleMessageSent(messageInput);
            setMessageInput('');
            if (messageInputEl?.current) messageInputEl.current.focus();
        }
    }, [shouldMessageSent]);

    useEffect(() => {
        if (messageInputChange?.emoji) {
            if (messageInput !== undefined && !messageInput.trim().length) {
                cursorPosition.current = 2;
                return setMessageInput(messageInputChange.emoji);
            }

            const _range = document.getSelection().getRangeAt(0);
            let range = _range.cloneRange();
            range.selectNodeContents(messageInputEl.current);
            range.setEnd(_range.endContainer, _range.endOffset);
            const position = range.toString().length;

            messageInputEl.current.firstChild.insertData(position, messageInputChange.emoji);
            const message = messageInputEl.current.textContent;
            cursorPosition.current = position + 2;
            return setMessageInput(message);
        }

        setMessageInput(messageInputChange);
    }, [messageInputChange]);

    useEffect(() => {
        if (messageInput.trim().length) onShowMic(false);
        else onShowMic(true);

        if (messageInput !== undefined) {
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


            if (messageInput && messageInput.length <= 2) {
                if (messageInput[0].charCodeAt(0) >= 1570 && messageInput[0].charCodeAt(0) <= 1740) {
                    const style = {};
                    style.direction = 'rtl';
                    style.fontFamily = 'Tahoma';
                    style.fontSize = '1.47rem';

                    setInputStyle(style);
                } else setInputStyle({});
            }
        }
    }, [messageInput]);

    useLayoutEffect(() => {
        if (messageInput) {
            let range;
            let selection;

            range = document.createRange();
            range.setStart(messageInputEl.current.firstChild, cursorPosition.current);
            range.setEnd(messageInputEl.current.firstChild, cursorPosition.current);
            selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);

            if (scrollTop?.current) {
                messageInputEl.current?.scrollTo(0, scrollTop.current);
            }
        }
    }, [messageInput]);

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
            if (messageInputEl?.current && window.innerWidth > 600) messageInputEl.current.focus();
        }
    }, [shouldClear]);

    function onMessageInputChange(e) {
        if (!e.target.textContent.trim().length) return setMessageInput('');

        let _range = document.getSelection().getRangeAt(0);
        let range = _range.cloneRange();
        range.selectNodeContents(messageInputEl.current);
        range.setEnd(_range.endContainer, _range.endOffset);
        const position = range.toString().length;
        const messageLength = messageInputEl.current.firstChild.length;
        cursorPosition.current = position;

        if ((position === messageLength) || (position === messageLength + 1)) scrollTop.current = messageInputEl.current?.scrollHeight;
        else scrollTop.current = messageInputEl.current?.scrollTop;
        const textArr = e.target.textContent.split('');
        if (textArr[textArr.length - 1] !== '\n') setMessageInput(e.target.textContent);
    }

    function handleInputKeyDown(e) {
        if (e.keyCode === 13 && enterPress.current === false) enterPress.current = true;
        if (e.keyCode === 16 && shiftPress.current === false) shiftPress.current = true;
        if (e.keyCode === 17 && ctrlPress.current === false) ctrlPress.current = true;
        if (e.keyCode === 32 && spacePress.current === false) spacePress.current = true;

        if (spacePress.current && !messageInput.trim().length) return e.preventDefault();

        if (enterPress.current && messageInput.trim().length && !shiftPress.current && !ctrlPress.current) {
            onHandleMessageSent(messageInput);
            setMessageInput('');
            e.preventDefault();
            return setFinishTyping(true);
        }

        if (enterPress.current && !messageInput.trim().length) {
            return e.preventDefault();
        }
    }

    function handleInputKeyUp(e) {
        if (e.keyCode === 13) enterPress.current = false;
        if (e.keyCode === 16) shiftPress.current = false;
        if (e.keyCode === 17) ctrlPress.current = false;
        if (e.keyCode === 32) spacePress.current = false;
    }

    function createPlaceholderClassName () {
        let className = 'placeholder';
        if (messageInput) className += ' hide';
        return className;
    }


    return (
        <div className="input__message--container">
            <div
                className="editable-input__container"
                onFocus={ e => e.target.parentNode.style.border = '.1rem solid rgba(0, 255, 0, .6)' }
                onBlur={ e => e.target.parentNode.style.border = '.1rem solid rgba(255, 255, 255, .3)' }
            >
                <div
                    contentEditable={ true }
                    className="editable-input"
                    spellCheck={ true }
                    onKeyDown={ handleInputKeyDown }
                    onKeyUp={ handleInputKeyUp }
                    onInput={ onMessageInputChange }
                    ref={ messageInputEl }
                    style={ inputStyle }
                >
                    { messageInput }
                </div>
                <div className={ createPlaceholderClassName() }>
                    {
                        window.innerWidth > 370 ?
                            "Write your message..." :
                            "Your message..."
                    }
                </div>
            </div>
        </div>
    );
};

export default React.memo(Input);
