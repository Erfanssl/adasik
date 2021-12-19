import React, { useState, useRef, useEffect } from 'react';
import './Messenger.scss';
import Picker from 'emoji-picker-react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';
import {
    fetchMessages,
    fetchIndividualConversation,
    updateMessageStatus,
    submitNewMessage,
    submitNewMessageFromSocket,
    messengerStart,
    updateMessageText,
    updateMessageTextFromSocket,
    deleteMessageForMe,
    deleteMessageForEveryone,
    deleteMessageFromSocket,
    wipeTempMessage,
    messengerUpdateUserStatus,
    wipeIndividualConversation
} from "../../../../actions/messengerAction";
import { fetchMessengerSocket } from "../../../../actions/socketsAction";
import Input from "./Input/Input";
import AudioPlayer from "./AudioPlayer/AudioPlayer";
import Loading from "../../utils/Loading/Loading";
import textCutter from "../../../../utility/textCutter";
import requireAuth from "../../../../middlewares/requireAuth";
import timePastFormatter from "../../../../utility/timePastFormatter";
import groupMessageDateFormatter from "../../../../utility/groupMessageDateFormatter";
import pageViewSocketConnection from "../../../../utility/pageViewSocketConnection";
import Spinner from "../../utils/Spinner/Spinner";

import {
    receiveNotificationMessenger
} from "../../../../actions/innerAction";

import send from '../../../../assets/icons/send.svg';
import check from '../../../../assets/icons/check.svg';
import happy from '../../../../assets/icons/happy.svg';
import microphone from '../../../../assets/icons/microphone.svg';
import rightArrow from '../../../../assets/icons/right-arrow.svg';
import writing from '../../../../assets/icons/writing.svg';
import closeReply from '../../../../assets/icons/close-reply.svg';
import pending from '../../../../assets/icons/pending.svg';
import stopBtn from '../../../../assets/icons/stop.svg';
import close from '../../../../assets/icons/close.svg';
import back from '../../../../assets/icons/back.svg';

const Messenger = ({
                       userId,
                       userInfo,
                       identifier,
                       fetchMessages,
                       fetchIndividualConversation,
                       updateMessageStatus,
                       submitNewMessage,
                       fetchMessengerSocket,
                       submitNewMessageFromSocket,
                       updateMessageText,
                       updateMessageTextFromSocket,
                       deleteMessageForMe,
                       deleteMessageForEveryone,
                       deleteMessageFromSocket,
                       wipeTempMessage,
                       wipeIndividualConversation,
                       receiveNotificationMessenger,
                       messengerUpdateUserStatus,
                       messengerStart,
                       conversations,
                       conversationData,
                       statusSocket
                   }) => {
    const [socket, setSocket] = useState('');
    const [emojiContainerShow, setEmojiContainerShow] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [selectedReply, setSelectedReply] = useState('');
    const [selectedTools, setSelectedTools] = useState(-1);
    const [selectedConversation, setSelectedConversation] = useState(-1);
    const [conversationPersonId, setConversationPersonId] = useState('');
    const [selectedConversationFullName, setSelectedConversationFullName] = useState('');
    const [messageType, setMessageType] = useState('regular');
    const [selectedMessageToReply, setSelectedMessageToReply] = useState({});
    const [selectedMessageToEdit, setSelectedMessageToEdit] = useState({});
    const [configurationPopUpResult, setConfigurationPopUpResult] = useState(false);
    const [popUpOpen, setPopUpOpen] = useState({});
    const [messageToDelete, setMessageToDelete] = useState({});
    const [shouldMessageSent, setShouldMessageSent] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [messageInputEl, setMessageInputEl] = useState('');
    const [showMic, setShowMic] = useState(true);
    const [speechRecognitionStart, setSpeechRecognitionStart] = useState(false);
    const [recognitionObj, setRecognitionObj] = useState({});
    const [circlesInterval, setCirclesInterval] = useState(null);
    const [recorderStart, setRecorderStart] = useState(null);
    const [recorderInterval, setRecorderInterval] = useState(null);
    const [recorderTimer, setRecorderTimer] = useState({ minutes: 0, seconds: 0 });
    const [recorderStream, setRecorderStream] = useState('');
    const [mediaRecorder, setMediaRecorder] = useState({ mediaRecorder: null, chunks: [] });
    const [stopRecording, setStopRecording] = useState(false);
    const [reRender, setReRender] = useState(false);
    const [conversationInfo, setConversationInfo] = useState({});
    const [socketConfig, setSocketConfig] = useState({ changed: false, type: '', data: null });
    const [typingStatus, setTypingStatus] = useState([]);
    const [recordingStatus, setRecordingStatus] = useState([]);
    const [shouldClear, setShouldClear] = useState([false]);
    const [sendingAudio, setSendingAudio] = useState(false);
    const [showConversationSpinner, setShowConversationSpinner] = useState(false);
    const [newMessageCountWithScrollUp, setNewMessageCountWithScrollUp] = useState(0);


    // refs
    const mainContainer = useRef();
    const circle1 = useRef();
    const circle2 = useRef();
    const circle3 = useRef();
    const circle4 = useRef();
    const circle5 = useRef();
    const analyzerCanvas = useRef();
    const messengerMainContainer = useRef();
    const messengerSideContainer = useRef();
    const goBottomContainer = useRef();

    const scrolled = useRef(false);
    const isFirstDown = useRef(false);
    const newPost = useRef(false);

    // for connecting and disconnecting to the socket
    useEffect(() => {
        document.title = 'Adasik - Messenger';

        fetchMessages().then(() => {
            setDataLoaded(true);
        });

        const pageViewSocket = pageViewSocketConnection();

        // a re-render for the app every one minute for changes in the last conversation message created time
        const interval = setInterval(() => {
            setReRender(r => !r);
        }, 1000 * 60);

        const messengerSocket = io.connect('/messenger'/*{ transports: ['websocket'], upgrade: false }*/);

        setSocket(messengerSocket);
        fetchMessengerSocket(messengerSocket);

        messengerSocket.on('userOnline', username => {
            messengerUpdateUserStatus(username, 'online');
        });

        messengerSocket.on('userOffline', username => {
            messengerUpdateUserStatus(username, 'offline');

            setTypingStatus(state => state.filter(obj => obj.username !== username));
            setRecordingStatus(state => state.filter(obj => obj.username !== username));
        });

        messengerSocket.on('typing', ({ fromUsername, isTyping, fullName }) => {
            // we first check if this username is already in the array
            setTypingStatus(state => {
                if (!state.length || !state.find(obj => obj.username === fromUsername)) return [ ...state, { username: fromUsername, isTyping, fullName } ];

                return state.map(obj => obj.username === fromUsername ? { username: fromUsername, isTyping, fullName } : obj);
            });
        });

        messengerSocket.on('recording', ({ fromUsername, isRecording, fullName }) => {
            // we first check if this username is already in the array
            setRecordingStatus(state => {
                if (!state.length || !state.find(obj => obj.username === fromUsername)) return [ ...state, { username: fromUsername, isRecording, fullName } ];

                return state.map(obj => obj.username === fromUsername ? { username: fromUsername, isRecording, fullName } : obj);
            });
        });

        messengerSocket.on('messageReceive', (response) => {
            if (!response) return;

            const { message, fromUsername, userInfo } = response;
            message.side = 'guest';
            if (message.isBuf) message.message = message.messageBuf.receiverMessage;
            setSocketConfig({ changed: true, type: 'messageReceive', data: { message, fromUsername, userInfo } });
            // updateMessageStatus(message.toMessageId, 'delivered', message.to);
        });

        messengerSocket.on('messageUpdatedReceive', (response) => {
            if (!response) return;

            const { message, isLast } = response;
            setSocketConfig({ changed: true, type: 'messageUpdatedReceive', data: { message, isLast } });
        });

        messengerSocket.on('messageDeletedReceive', (response) => {
            if (!response) return;

            const { message, isLast } = response;
            setSocketConfig({ changed: true, type: 'messageDeletedReceive', data: { message, isLast } });
        });

        messengerSocket.on('messageDeliveredStatus', ({ messageId, personId, status }) => {
            updateMessageStatus(messageId, status, personId);
        });

        // to update status of a message to seen if the user is looking at that conversation
        messengerSocket.on('messageSeenServer', ({ personId, messageId }) => {
            updateMessageStatus(messageId, 'seen', personId);
        });

        // to check for sent messages and change them to delivered (for the user)
        messengerStart();

        // setting up speech recognition
        try {
            const SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;

            if (typeof SpeechRecognition !== 'undefined') {
                const recognition = new SpeechRecognition();
                recognition.continuous = true;
                recognition.interimResults = true;

                recognition.addEventListener('result', onResult);

                function onResult(event) {
                    let text = ''
                    for (const res of event.results) {
                        setMessageInput(res['0'].transcript);
                        text += (' ' + res['0'].transcript);
                    }
                    setMessageInput(text);
                }

                recognition.addEventListener('end', () => {
                    setSpeechRecognitionStart(false);
                });

                setRecognitionObj(recognition);
            }
        } catch (err) {

        }

        return () => {
            messengerSocket.disconnect();
            pageViewSocket.disconnect();
            fetchIndividualConversation(null, null, null, null, true, null);
            clearInterval(interval);
            wipeTempMessage();
        };
    }, []);

    useEffect(() => {
        if (socket && identifier && Object.keys(identifier).length) {
            socket.emit('data', identifier);
        }
    }, [socket, identifier]);

    useEffect(() => {
        if (socketConfig.changed) {
            // when user receives a message
            if (socketConfig.type === 'messageReceive') {
                const { message, fromUsername, userInfo } = socketConfig.data;
                submitNewMessageFromSocket(message, message.from, conversationPersonId === message.from, userInfo);

                // if the use is reading old messages
                if ((conversationData && conversationData.username.toLowerCase() === fromUsername.toLowerCase() && mainContainer?.current && mainContainer.current.scrollTop + mainContainer.current.offsetHeight) < (mainContainer?.current?.scrollHeight - 100)) {
                    setNewMessageCountWithScrollUp(count => count + 1);
                }

                socket.emit('messageReceiveStatus', {
                    fromUsername,
                    message,
                    status: 'delivered'
                });

                if (conversationPersonId === message.from) {
                    socket.emit('messageSeenClient', {
                        username: fromUsername,
                        personId: message.to,
                        messageId: message._id
                    });
                }

                setSocketConfig({ changed: false, type: '', data: null });
            }

            if (socketConfig.type === 'messageUpdatedReceive') {
                const { message, isLast } = socketConfig.data;
                if (message) updateMessageTextFromSocket(message.message, message.from, message.toMessageId, isLast, message.type, conversationPersonId === message.from);

                setSocketConfig({ changed: false, type: '', data: null });
            }

            if (socketConfig.type === 'messageDeletedReceive') {
                const { message, isLast } = socketConfig.data;
                deleteMessageFromSocket(message.from, message.toMessageId, isLast, conversationPersonId === message.from);

                setSocketConfig({ changed: false, type: '', data: null });
            }
        }
    }, [conversationPersonId, socketConfig]);

    // useEffect(() => {
    //     if (messengerMainContainer && messengerMainContainer.current) {
    //         messengerMainContainer.current.classList.add('hide');
    //     }
    // }, [messengerMainContainer]);

    useEffect(() => {
        if (conversationData && conversationData.isFromProfile) {
            if (messengerSideContainer && messengerSideContainer.current && window.innerWidth <= 1300) {
                messengerSideContainer.current.style.display = 'none';
            }

            if (messengerMainContainer && messengerMainContainer.current && window.innerWidth <= 1300) {
                messengerMainContainer.current.style.display = 'flex';
            }
            const index = conversations.sort((c1, c2) => new Date(c2.messages[0].createdAt) - new Date(c1.messages[0].createdAt)).findIndex(conv => conv.userId.toString() === conversationData.userId.toString());
            const conversationId = conversations.find(conv => conv.userId === conversationData.userId);
            if (conversationId) {
                handleConversationClick(conversationId._id, conversationData.userId, conversationData.fullName, conversationData.messengerStatus, index, conversationId.username);
            } else setConversationPersonId(conversationData.userId);
        }

        if (conversationData && conversationData.shouldConversationReload) {
            fetchMessages();
        }

        if (conversationData) setShowConversationSpinner(false);
    }, [conversationData, conversations]);

    useEffect(() => {
        const elements = {
            'circle1': circle1,
            'circle2': circle2,
            'circle3': circle3,
            'circle4': circle4,
            'circle5': circle5,
        }

        if (speechRecognitionStart && recognitionObj.start) {
            recognitionObj.start();
            let count = 5;

            const interval = setInterval(() => {
                Object.values(elements).forEach(el => el.current.classList.remove('show-bg'));
                const elementName = 'circle' + count;
                if (elements[elementName]) elements[elementName].current.classList.add('show-bg');
                if (count <= 0) count = 6;
                count--;
            }, 250);

            setCirclesInterval(interval);
        } else if (!speechRecognitionStart && recognitionObj.stop) {
            recognitionObj.stop();
            if (circlesInterval) {
                Object.values(elements).forEach(el => el.current.classList.remove('show-bg'));
                clearInterval(circlesInterval);
                setCirclesInterval(null);
            }
        }
    }, [speechRecognitionStart]);

    useEffect(() => {
        if (stopRecording) {
            if (recorderStream) recorderStream.getTracks().forEach(track => track.stop());
            setStopRecording(false);
        }
    }, [stopRecording]);

    useEffect(() => {
        if (userInfo && conversationData) {
            if (recorderStart) {
                socket.emit('recording', { fromUsername: userInfo.username, toUsername: conversationData.username, isRecording: true, fullName: userInfo.fullName });
            } else if (recorderStart === false) {
                socket.emit('recording', { fromUsername: userInfo.username, toUsername: conversationData.username, isRecording: false, fullName: userInfo.fullName });
            }
        }
    }, [recorderStart, userInfo, conversationData]);

    useEffect(() => {
        if (recorderStart) {
            navigator.mediaDevices.getUserMedia({ audio: true }).then(onSuccess, onError);

            function onSuccess(stream) {
                const canvasCtx = analyzerCanvas.current.getContext('2d');
                const chunks = [];
                let audioCtx;
                setRecorderStream(stream);

                const mediaRecorder = new MediaRecorder(stream);
                setMediaRecorder(media => ({ ...media, mediaRecorder }));

                mediaRecorder.ondataavailable = (e) => {
                    chunks.push(e.data);
                };

                mediaRecorder.start();

                mediaRecorder.onstop = () => {
                    const blob = new Blob(chunks, {
                        type: 'audio/ogg; codecs=opus'
                    });

                    blob.arrayBuffer().then(buf => {
                        const data = {
                            type: 'regular',
                            from: userId,
                            to: conversationPersonId,
                            createdAt: new Date().toISOString()
                        }

                        if (messageType === 'reply') {
                            data.reply = selectedMessageToReply.id;
                            data.tempReply = selectedMessageToReply.toMessageId;
                            data.type = 'reply';
                        }

                        submitNewMessage(data, conversationPersonId, socket, statusSocket, buf, userInfo).then(setSelectedConversation.bind(null, 0));
                        newPost.current = true;
                        setRecorderStart(false);
                        setSendingAudio(true);
                        setTimeout(() => {
                            setSendingAudio(false);
                        }, 2000);
                    });
                };

                const interval = setInterval(() => {
                    setRecorderTimer(prevTime => {
                        if (prevTime.seconds + 1 >= 60) return { minutes: prevTime.minutes + 1, seconds: 0 };
                        return { ...prevTime, seconds: prevTime.seconds + 1 };
                    });
                }, 1000);

                setRecorderInterval(interval);

                visualize(stream);

                function visualize(stream) {
                    if(!audioCtx) {
                        audioCtx = new AudioContext();
                    }

                    const source = audioCtx.createMediaStreamSource(stream);

                    const analyser = audioCtx.createAnalyser();
                    analyser.fftSize = 2048;
                    const bufferLength = analyser.frequencyBinCount;
                    const dataArray = new Uint8Array(bufferLength);

                    source.connect(analyser);

                    draw();

                    function draw() {
                        const WIDTH = analyzerCanvas.current.width
                        const HEIGHT = analyzerCanvas.current.height;

                        requestAnimationFrame(draw);

                        analyser.getByteTimeDomainData(dataArray);

                        // canvasCtx.fillStyle = 'rgb(200, 200, 200)';
                        canvasCtx.fillStyle = '#3e3b38';
                        canvasCtx.fillRect(0, 0, WIDTH, HEIGHT);

                        canvasCtx.lineWidth = 2;
                        canvasCtx.strokeStyle = 'yellow';

                        canvasCtx.beginPath();

                        let sliceWidth = WIDTH * 1.0 / bufferLength;
                        let x = 0;


                        for(let i = 0; i < bufferLength; i++) {

                            let v = dataArray[i] / 128.0;
                            let y = v * HEIGHT/2;

                            if(i === 0) {
                                canvasCtx.moveTo(x, y);
                            } else {
                                canvasCtx.lineTo(x, y);
                            }

                            x += sliceWidth;
                        }

                        canvasCtx.lineTo(analyzerCanvas.current.width, analyzerCanvas.current.height/2);
                        canvasCtx.stroke();

                    }
                }

            }

            function onError(err) {
                setRecorderStart(false);
            }

        } else {
            clearInterval(recorderInterval);
            setRecorderInterval(null);
            setRecorderTimer({ minutes: 0, seconds: 0 });
            if (mediaRecorder?.mediaRecorder) mediaRecorder.mediaRecorder.onstop = () => {};
            if (recorderStream) recorderStream.getTracks().forEach(track => track.stop());
        }
    }, [recorderStart]);

    function onEC(e, em) {
        if (messageInputEl?.current) {
            setMessageInput({ emoji: em.emoji });
        }
    }

    function onEmojiShow() {
        setEmojiContainerShow(bool => !bool);
        messageInputEl.current.focus();
    }

    function handleMessageSent(messageInput) {
        if (messageInput.trim().length === 0) return;

        // constructing data
        const data = {
            message: messageInput,
            type: 'regular',
            from: userId,
            to: conversationPersonId,
            createdAt: new Date().toISOString()
        };

        if (messageType === 'reply') {
            data.reply = selectedMessageToReply.id;
            data.tempReply = selectedMessageToReply.toMessageId;
            data.type = 'reply';
        }

        if (messageType === 'update' || messageType === 'replyUpdate') updateMessageText(messageInput, conversationPersonId, selectedMessageToEdit.id, selectedMessageToEdit.isLast, messageType, socket, data, selectedMessageToEdit.toMessageId);
        else submitNewMessage(data, conversationPersonId, socket, statusSocket, false, userInfo).then(setSelectedConversation.bind(null, 0));
        newPost.current = true;

        setShouldMessageSent(false);
        setMessageType('regular');
        setSelectedMessageToReply({});
        setSelectedMessageToEdit({});
        setSpeechRecognitionStart(false);
    }

    useEffect(() => {
        if (conversationData) {
            const messagesToUpdateStatusToSeen = conversationData.messages.filter(m => (m.side === 'guest' && m.status !== 'seen')).map(m => m._id);
            messagesToUpdateStatusToSeen.forEach(messageId => {
                if (conversationData.unseen) {
                    updateMessageStatus(messageId, 'seen', conversationPersonId);
                    if (socket && conversations.length) {
                        const message = conversationData.messages.find(m => m._id === messageId);
                        socket.emit('messageSeenClient', {
                            username: conversations.find(c => c.userId === conversationData.userId).username,
                            personId: message.side === 'host' ? message.from : message.to,
                            messageId: message.toMessageId
                        });
                    }
                }
            });

            if (isFirstDown && isFirstDown.current === false && !conversationData.fromSocket) {
                moveScrollDown();
            }

            if (newPost && newPost.current === true) {
                moveScrollDown();
                newPost.current = false;
            }

            if (mainContainer?.current && conversationData.fromSocket && !scrolled.current) {
                moveScrollDown();
            }
        }
    }, [conversationData]);

    function handleConversationClick(conversationId, conversationPersonId, fullName, messengerStatus, index, username, unseen) {
        if (conversationData && conversationData.userId === conversationPersonId) return;

        fetchIndividualConversation(conversationId, fullName, messengerStatus, true, undefined, username);
        setShowConversationSpinner(true);

        isFirstDown.current = false;

        if (unseen) {
            receiveNotificationMessenger('decrement');
        }

        if (conversationData && conversationData.userId !== conversationPersonId) {
            setShouldClear([true]);
            setRecorderStart(false);
        }
        setConversationInfo({ conversationId, fullName, messengerStatus, username });
        setSelectedReply('');
        setSelectedTools(-1);
        setSelectedConversation(index);
        setConversationPersonId(conversationPersonId);
        setSelectedConversationFullName(fullName);
        setNewMessageCountWithScrollUp(0);

        if (messengerSideContainer && messengerSideContainer.current && window.innerWidth <= 1300) {
            messengerSideContainer.current.style.display = 'none';
        }

        if (messengerMainContainer && messengerMainContainer.current && window.innerWidth <= 1300) {
            messengerMainContainer.current.style.display = 'flex';
        }

        // we need to tell database that the messages now are seen
        // we handle this in useEffect
    }

    function renderMessageInConversationsList(conv) {
        function messageStyle(message) {
            const style = {};

            if (message[0].charCodeAt(0) >= 1570 && message[0].charCodeAt(0) <= 1740) {
                style.direction = 'rtl';
                style.fontFamily = 'Tahoma';
                style.fontSize = '1.3rem';
            }

            return style;
        }

        const typingStatusExists = typingStatus.length && typingStatus.find(obj => obj.username === conv.username);
        const recordingStatusExists = recordingStatus.length && recordingStatus.find(obj => obj.username === conv.username);

        if (typingStatusExists && typingStatusExists.isTyping) {
            return <p className="typing">{ textCutter(typingStatusExists.fullName.split(' ')[0], 10) } is typing...</p>;
        }

        if (recordingStatusExists && recordingStatusExists.isRecording) {
            return <p className="typing">{ textCutter(recordingStatusExists.fullName.split(' ')[0], 10) } is recording Audio...</p>;
        }

        if (conv.messages[0].type === 'deleteForMe' || conv.messages[0].type === 'deleteForEveryone') {
            return <em>message was deleted!</em>;
        } else if (!conv.messages[0].isBuf) {
            return <p style={ messageStyle(conv.messages[0]?.message) } className="messenger--item__message">{ textCutter(conv.messages[0]?.message) }</p>;
        } else if (conv.messages[0].isBuf) {
            return (
                <div className="messenger--item__voice-container">
                    <img src={ microphone } alt="microphone" />
                    <p className="messenger--item__message">voice message</p>
                </div>
            );
        }
    }

    function renderItemRight(conv, i) {
        const typingStatusExists = typingStatus.length && typingStatus.find(obj => obj.username === conv.username);
        const recordingStatusExists = recordingStatus.length && recordingStatus.find(obj => obj.username === conv.username);

        if ((typingStatusExists && typingStatusExists.isTyping) || (recordingStatusExists && recordingStatusExists.isRecording)) return <p className="messenger--item__time">now</p>;

        return (
            <>
                <p className="messenger--item__time">{ timePastFormatter(conv.messages[0].createdAt) }</p>
                { selectedConversation !== i && conv.unseen !== 0 && <p className="messenger--item__unseen">{ conv.unseen }</p> }
            </>
        );
    }

    function renderConversations() {
        // we sort the conversations base on the newest to oldest
        conversations.sort((c1, c2) => new Date(c2.messages[0].createdAt) - new Date(c1.messages[0].createdAt));

        return conversations.map((conv, i) => {
            return (
                <li
                    key={ conv._id }
                    onClick={ handleConversationClick.bind(null, conv._id, conv.userId, conv.fullName, conv.messengerStatus, i, conv.username, conv.unseen) }
                    className={ "messenger--side__item" + (selectedConversation === i ? " selected" : "") }
                >
                    <div className="messenger--item__left-container">
                        <div className={ conv.messengerStatus.text === 'online' ? 'messenger--status__online' : 'messenger--status__offline' }>
                            <img src={ conv.avatar } alt={ conv.fullName } />
                        </div>
                        <div className="messenger--item__left-name">
                            <p className="messenger--item__name">{ conv.fullName }</p>
                            { renderMessageInConversationsList(conv) }
                        </div>
                    </div>
                    <div className="messenger--item__right-container">
                        { renderItemRight(conv, i) }
                    </div>
                </li>
            )
        });
    }

    function renderStatusInMain() {
        const typingStatusExists = typingStatus.length && typingStatus.find(obj => obj.username === conversationData.username);
        const recordingStatusExists = recordingStatus.length && recordingStatus.find(obj => obj.username === conversationData.username);

        if (typingStatusExists && typingStatusExists.isTyping) {
            return <p className="typing">{ textCutter(typingStatusExists.fullName.split(' ')[0], 10) } is typing...</p>;
        }

        if (recordingStatusExists && recordingStatusExists.isRecording) {
            return <p className="typing">{ textCutter(recordingStatusExists.fullName.split(' ')[0], 10) } is recording Audio...</p>;
        }

        if (conversationData.messengerStatus.text === 'online') return <p className="online">online</p>;
        if (conversationData.messengerStatus.text === 'offline') return <p className="offline">last seen { timePastFormatter(conversationData.messengerStatus.date) }</p>;
    }

    function renderMessageStatus(status) {
        switch (status) {
            case 'pending':
                return (
                    <div className="messenger--message__pending">
                        <img src={ pending } alt="pending" />
                    </div>
                );
            case 'sent':
                return (
                    <div className="messenger--message__sent">
                        <img src={ check } alt="check" />
                    </div>
                );
            case 'delivered':
                return (
                    <div className="messenger--message__delivered">
                        <img src={ check } alt="check" />
                        <img src={ check } alt="check" />
                    </div>
                );
            case 'seen':
                return (
                    <div className="messenger--message__seen">
                        <img src={ check } alt="check" />
                        <img src={ check } alt="check" />
                    </div>
                );
        }
    }

    // helper function

    function moveScrollDown(elementCount) {
        if (mainContainer?.current) {
            const container = mainContainer.current;
            // const randomElHeight = document.querySelector('.messenger--main__body-host-container').offsetHeight;
            // const co = document.querySelector('.mm');
            // co.style.minHeight = `${ elementCount * randomElHeight * 2 }px`;
            container.scrollTo(0, container.scrollHeight);
        }
    }

    function scrollToElement(elementId) {
        const element = document.querySelector(`[data-id="${ elementId }"]`);
        mainContainer.current.scrollTo(0, element.offsetTop - (element.offsetHeight * 3));
    }

    /* End of helpers */

    function handleReplyHeaderClick(replyId, e) {
        scrollToElement(replyId);
        setSelectedReply(replyId);
    }

    function renderReplyHeader(replyId) {
        const message = conversationData.messages.find(message => message._id === replyId);
        const text = message?.message;
        const side = message?.side;
        if (message && message.isBuf) {
            return (
                <div className="messenger--message__reply-container" onClick={ handleReplyHeaderClick.bind(null, replyId) }>
                    <p className="reply--name">{ side === 'host' ? 'You' : conversationData.fullName }</p>
                    <div className="messenger--item__voice-container">
                        <img src={ microphone } alt="microphone" />
                        <p className="messenger--item__message">voice message</p>
                    </div>
                </div>
            );
        }

        const style = {};

        if (text && text.charCodeAt(0) >= 1570 && text.charCodeAt(0) <= 1740) {
            style.direction = 'rtl';
            style.fontFamily = 'Tahoma';
            style.fontSize = '1.3rem';
        }

        return (
            <div className="messenger--message__reply-container" onClick={ handleReplyHeaderClick.bind(null, replyId) }>
                <p className="reply--name">{ side === 'host' ? 'You' : conversationData.fullName }</p>
                <p style={ style }>{ textCutter(text) }</p>
            </div>
        );
    }

    function handleToolsIconClick(e) {
        let ele = e.target;
        if (!ele.className) ele = ele.parentElement;

        setSelectedTools(parseInt(ele.dataset.show));
    }

    function handleReplyClick(message, side, id, isBuf, toMessageId) {
        setSelectedMessageToReply({ message, side, id, isBuf, toMessageId });
        setSelectedMessageToEdit({});
        setMessageType('reply');
        messageInputEl?.current.focus();
    }

    function handleEditClick(message, side, id, type, isLast, toMessageId) {
        setSelectedMessageToEdit({ message, side, id, isLast, toMessageId });
        setSelectedMessageToReply({});

        if (type === 'reply') setMessageType('replyUpdate');
        else if (type === 'regular') setMessageType('update');
        else if (type === 'update') setMessageType('update');
        else if (type === 'replyUpdate') setMessageType('replyUpdate');

        setMessageInput(message);
    }

    useEffect(() => {
        if (configurationPopUpResult) {
            const { id, personId, from, toMessageId, isLast } = messageToDelete;
            if (popUpOpen.type === 'forMe') {
                deleteMessageForMe(id, personId, isLast);
                setConfigurationPopUpResult(false);
            } else {
                deleteMessageForEveryone(id, personId, isLast, from, toMessageId, socket);
                setConfigurationPopUpResult(false);
            }
        }
    }, [configurationPopUpResult]);

    function handleDeleteForMeClick(id, personId, isLast) {
        // open the pop up
        setPopUpOpen({
            show: true,
            popUpTop: mainContainer.current.scrollTop + (mainContainer.current.offsetHeight / 3),
            mainBgTop: mainContainer.current.scrollTop,
            type: 'forMe'
        });

        setMessageToDelete({
            id,
            personId,
            isLast
        });
    }

    function handleDeleteForEveryoneClick(id, personId, message, isLast) {
        // open the pop up
        setPopUpOpen({
            show: true,
            popUpTop: mainContainer.current.scrollTop + (mainContainer.current.offsetHeight / 3),
            mainBgTop: mainContainer.current.scrollTop,
            type: 'forEveryone'
        });

        setMessageToDelete({
            id,
            personId,
            isLast,
            ...message
        });
    }

    function formatTimeStamp(localeTimeString) {
        const arr1 = localeTimeString.split(' ');
        const arr2 = arr1[0].split(':');
        arr2.pop();

        return [arr2.join(':'), arr1[1]].join(' ');
    }

    function renderMessagesInMain() {
        function makeMessageClassName(i, type, isLast) {
            let className = "messenger--message__tools-container";

            if (isLast && selectedTools === i && type !== 'deleteForMe' && i !== 1) {
                className += " show-end";
            }

            else if (selectedTools === i && type !== 'deleteForMe') {
                className += " show";
            }

            return className;
        }

        const messagesHolder = {};

        if (conversationData.messages.length) {
            conversationData.messages.forEach(m => {
                const createdAt = new Date(m.createdAt).toDateString();
                messagesHolder[createdAt] = messagesHolder[createdAt] ? [...messagesHolder[createdAt], m] : [m];
            });
        }

        const messagesArr = [];

        for (let key in messagesHolder) {
            messagesArr.push({ date: key }, ...messagesHolder[key]);
        }

        return messagesArr.map(({ side, message, createdAt, status, _id, type, reply, to, isBuf, date, from, toMessageId }, i) => {
            function messageStyle() {
                const style = {};
                if (!message.isBuf && message.length === 2 && message.charCodeAt(0) >= 55000) {
                    style.fontSize = '6rem';
                    style.textAlign = 'center';
                }

                if (!message.isBuf && message[0].charCodeAt(0) >= 1570 && message[0].charCodeAt(0) <= 1740) {
                    style.direction = 'rtl';
                    style.fontFamily = 'Tahoma';
                    style.fontSize = '1.47rem';
                }

                return style;
            }

            if (!side) {
                return (
                    <div
                        key={ date }
                        className="messenger--main__body-date-container"
                        style={ (popUpOpen.show || speechRecognitionStart || showConversationSpinner) ? { filter: 'blur(.3rem)' } : {} }
                    >
                        <p>{ groupMessageDateFormatter(date) }</p>
                    </div>
                );
            }
            const isLast = messagesArr.length - 1 === i;
            if (type === 'deleteForMe') return;
            // style object fo conditional styling
            const style = {};
            // if (isBuf) style.minHeight = '12rem';
            if (popUpOpen.show || speechRecognitionStart || showConversationSpinner) style.filter = 'blur(.3rem)';
            if (messagesArr[i + 1] && messagesArr[i + 1].side !== side) style.marginBottom = '1.5rem';
            return (
                <div
                    key={ _id }
                    data-id={ _id }
                    className={ side === 'host' ? "messenger--main__body-host-container" : "messenger--main__body-guest-container" }
                    style={ style }
                >
                    <div className={ selectedReply === _id ? "messenger--message__selected-reply" : undefined } />
                    <div data-show={ i } onClick={ handleToolsIconClick } className="messenger--message__tools-icon-container">
                        <div />
                        <div />
                        <div />
                    </div>
                    {
                        status !== 'pending' &&
                        <div className={ makeMessageClassName(i, type, isLast) }>
                            <ul>
                                {
                                    type !== 'deleteForEveryone' &&
                                    <li onClick={ handleReplyClick.bind(null, message, side, _id, isBuf, toMessageId) }>Reply</li>
                                }
                                {
                                    (side === 'host' && type !== 'deleteForEveryone' && !isBuf) &&
                                    <li onClick={ handleEditClick.bind(null, message, side, _id, type, isLast, toMessageId) }>Edit</li>
                                }
                                <li onClick={ handleDeleteForMeClick.bind(null, _id, conversationPersonId, isLast) }>Delete for me</li>
                                {
                                    (side === 'host' && type !== 'deleteForEveryone') &&
                                    <li onClick={ handleDeleteForEveryoneClick.bind(null, _id, conversationPersonId, { from, toMessageId }, isLast) }>Delete for everyone</li>
                                }
                            </ul>
                        </div>
                    }
                    { (type === 'reply' || type === 'replyUpdate') && renderReplyHeader(reply) }
                    { (type === 'deleteForEveryone' && side === 'host') && <em className="delete">You deleted this message</em> }
                    { (type === 'deleteForEveryone' && side === 'guest') && <em className="delete">{ selectedConversationFullName } deleted this message</em> }
                    {
                        (type !== 'deleteForMe' && type !== 'deleteForEveryone' && !isBuf) &&
                        <p style={ messageStyle() }
                        >
                            { message }
                        </p>
                    }
                    {
                        (type !== 'deleteForMe' && type !== 'deleteForEveryone' && isBuf) &&
                        <AudioPlayer
                            source={ message ? '/api/messenger/v/v1/' + message : null }
                            shouldStop={ shouldClear }
                        />
                    }
                    { (type === 'update' || type === 'replyUpdate') && <em>edited</em> }
                    <div className="messenger--main__body-meta-container">
                        <span>{ formatTimeStamp(new Date(createdAt).toLocaleTimeString()) }</span>
                        { side === 'host' && renderMessageStatus(status) }
                    </div>
                </div>
            );
        });
    }

    function handleReplyClose() {
        setSelectedMessageToReply({});
        setMessageType('regular');
    }

    function handleEditClose() {
        setSelectedMessageToEdit({});
        setMessageType('regular');
        setMessageInput('');
    }

    function handleReplyBottomClick() {
        setSelectedReply(selectedMessageToReply.id);
        scrollToElement(selectedMessageToReply.id);
    }

    function renderReplySection() {
        if (selectedMessageToReply.isBuf) {
            return (
                <div className="messenger--main__reply-container">
                    <div className="reply--title">
                        Reply to
                    </div>
                    <div className="reply--container" onClick={ handleReplyBottomClick }>
                        <div className="reply--header">{ selectedMessageToReply.side === 'host' ? 'You' : selectedConversationFullName }</div>
                        <div className="reply--message">
                            <div className="messenger--item__voice-container">
                                <img src={ microphone } alt="microphone" />
                                <p className="messenger--item__message">voice message</p>
                            </div>
                        </div>
                    </div>
                    <div className="icon" onClick={ handleReplyClose }>
                        <img src={ closeReply } alt="close" />
                    </div>
                </div>
            );
        }

        const style = {};
        const style2 = {};

        if (selectedMessageToReply?.message && selectedMessageToReply.message.charCodeAt(0) >= 1570 && selectedMessageToReply.message.charCodeAt(0) <= 1740) {
            style.direction = 'rtl';
            style.fontFamily = 'Tahoma';
            style.fontSize = '1.3rem';
            style2.direction = 'rtl';
        }

        return (
            <div className="messenger--main__reply-container">
                <div className="reply--title">
                    Reply to
                </div>
                <div className="reply--container" onClick={ handleReplyBottomClick }>
                    <div className="reply--header" style={ style2 }>{ selectedMessageToReply.side === 'host' ? 'You' : selectedConversationFullName }</div>
                    <div className="reply--message" style={ style }>{ !!selectedMessageToReply && !!selectedMessageToReply.message && textCutter(selectedMessageToReply?.message, 50) }</div>
                </div>
                <div className="icon" onClick={ handleReplyClose }>
                    <img src={ closeReply } alt="close" />
                </div>
            </div>
        );
    }

    function handleEditBottomClick() {
        setSelectedReply(selectedMessageToEdit.id);
        scrollToElement(selectedMessageToEdit.id);
    }

    const style = {};
    const style2 = {};

    if (selectedMessageToEdit?.message && selectedMessageToEdit.message.charCodeAt(0) >= 1570 && selectedMessageToEdit.message.charCodeAt(0) <= 1740) {
        style.direction = 'rtl';
        style.fontFamily = 'Tahoma';
        style.fontSize = '1.3rem';
        style2.direction = 'rtl';
    }

    function renderEditSection() {
        return (
            <div className="messenger--main__edit-container">
                <div className="reply--title edit--title">
                    Editing
                </div>
                <div className="reply--container" onClick={ handleEditBottomClick }>
                    <div className="reply--header" style={ style2 }>{ selectedMessageToEdit.side === 'host' ? 'You' : selectedConversationFullName }</div>
                    <div className="reply--message" style={ style }>{ !!selectedMessageToEdit && !!selectedMessageToEdit.message && textCutter(selectedMessageToEdit?.message, 50) }</div>
                </div>
                <div className="icon" onClick={ handleEditClose }>
                    <img src={ closeReply } alt="close" />
                </div>
            </div>
        );
    }

    function handleMainBgClick() {
        setPopUpOpen(p => ({ ...p, show: false }));
    }

    function handleCancelPopUp() {
        setPopUpOpen(p => ({ ...p, show: false }));
    }

    function handleAcceptPopUp() {
        setPopUpOpen(p => ({ ...p, show: false }));
        setConfigurationPopUpResult(true);
    }

    /* Helpers */
    function formatRecorderTimer (num) {
        return ("00" + num.toString()).substr(-2);
    }

    /* End */

    function handleMicClick() {
        setRecorderStart(true);
        setMessageInput('');
    }

    function handleMainContainerScroll() {
        if (mainContainer?.current) {
            if (mainContainer.current.scrollTop <= 1) {
                const { conversationId, fullName, messengerStatus, username } = conversationInfo;
                fetchIndividualConversation(conversationId, fullName, messengerStatus, false, undefined, username);
                setShowConversationSpinner(true);
            }

            if ((mainContainer.current.scrollTop + mainContainer.current.offsetHeight) < (mainContainer.current.scrollHeight - 100)) {
                if (goBottomContainer?.current) {
                    goBottomContainer.current.classList.add('active');
                    scrolled.current = true;
                }
            } else {
                if (goBottomContainer?.current) {
                    goBottomContainer.current.classList.remove('active');
                    setNewMessageCountWithScrollUp(0);
                    scrolled.current = false;
                }
            }

            if ((mainContainer.current.scrollTop + mainContainer.current.offsetHeight) >= mainContainer.current.scrollHeight) {
                isFirstDown.current = true;
            }
        }
    }

    function handleMessengerBackButtonClick() {
        if (messengerSideContainer && messengerSideContainer.current && window.innerWidth <= 1300) {
            messengerSideContainer.current.style.display = 'block';
        }

        if (messengerMainContainer && messengerMainContainer.current && window.innerWidth <= 1300) {
            messengerMainContainer.current.style.display = 'none';
        }

        wipeIndividualConversation();
        setSelectedConversation(-1);
    }

    function handleGoBottomClick() {
        if (mainContainer?.current) {
            mainContainer.current.scrollTo(0, mainContainer.current.scrollHeight);
            setTimeout(() => {
                setNewMessageCountWithScrollUp(0);
                scrolled.current = false;
            }, 1000);
        }
    }

    function handleMainBodyContainerClick() {
        setEmojiContainerShow(false);
    }

    function renderMainContainer() {
        return (
            <>
                <div className="messenger--main__header-container">
                    <div onClick={ handleMessengerBackButtonClick } className="messenger--main__header--back-container">
                        <img src={ back } alt="back" />
                    </div>
                    <div className="messenger--main__header">
                        <div className="messenger--main__header--text-group">
                            <Link target="_blank" to={ `/profile/${ conversationData.username }` } className="full-name">{ conversationData.fullName }</Link>
                            { renderStatusInMain() }
                        </div>
                    </div>
                </div>
                <div
                    ref={ mainContainer }
                    onScroll={ handleMainContainerScroll }
                    onClick={ handleMainBodyContainerClick }
                    className="messenger--main__body-container"
                    style={ (popUpOpen.show || speechRecognitionStart)? { overflowY: 'hidden' } : {} }
                >
                    { showConversationSpinner && <div className="spinner--container" style={{ top: mainContainer.current?.scrollHeight - mainContainer.current?.offsetHeight + 'px' }}><Spinner /></div> }
                    { conversationData && renderMessagesInMain() }
                    <div className={ "messenger--main__body--pop-up-container" + (popUpOpen.show ? " show" : "")  } style={{ top: popUpOpen.popUpTop + 'px' }}>
                        <p>Are you sure you want to delete this message for { popUpOpen.type === 'forMe' ? 'yourself' : 'everyone' }?</p>
                        <div className="button--container">
                            <button className="yes" onClick={ handleAcceptPopUp }>Yes</button>
                            <button className="cancel" onClick={ handleCancelPopUp }>Cancel</button>
                        </div>
                    </div>
                    <div
                        className={ "messenger--main__body--circles-container" + (speechRecognitionStart ? " show" : "") }
                        style={ mainContainer?.current ? { top: mainContainer.current.scrollTop + 'px' } : {}}
                    >
                        <div className="circles--one" ref={ circle1 } />
                        <div className="circles--two" ref={ circle2 } />
                        <div className="circles--three" ref={ circle3 } />
                        <div className="circles--four" ref={ circle4 }>
                            <p>Listening</p>
                            <p>Speak Now</p>
                        </div>
                        <div className="circles--five" onClick={ setSpeechRecognitionStart.bind(null, false) } ref={ circle5 }>
                            <img src={ stopBtn } alt="Stop Button" />
                        </div>
                    </div>
                    { popUpOpen.show && <div onClick={ handleMainBgClick } className="bg" style={{ top: popUpOpen.mainBgTop + 'px' }} /> }
                    { speechRecognitionStart && <div onClick={ handleMainBgClick } className="bg" style={{ top: mainContainer?.current.scrollTop + 'px' }} /> }
                </div>
                <div onClick={ handleGoBottomClick } ref={ goBottomContainer } className="on--scroll-container">
                    {
                        newMessageCountWithScrollUp > 0 &&
                        <div className="new--message">
                            { newMessageCountWithScrollUp }
                        </div>
                    }
                    <div className="go--bottom">
                        <img src={ back } alt="down" />
                        <img src={ back } alt="down" />
                    </div>
                </div>
                <div className="messenger--main__bottom-container">
                    { Object.keys(selectedMessageToReply).length ? renderReplySection() : undefined }
                    { Object.keys(selectedMessageToEdit).length ? renderEditSection() : undefined }
                    {
                        !recorderStart &&
                        <div className="messenger--main__input-container">
                            {
                                emojiContainerShow &&
                                <div className="messenger--main__emoji-container">
                                    <Picker onEmojiClick={ onEC } />
                                </div>
                            }
                            <div onClick={ onEmojiShow } className="messenger--main__emoji-btn">
                                <img src={ happy } alt="emoji" className={ emojiContainerShow ? 'emoji--selected' : undefined } />
                            </div>
                            <Input
                                shouldMessageSent={ shouldMessageSent }
                                messageInputChange={ messageInput }
                                onMessengerInputEl={ setMessageInputEl }
                                onHandleMessageSent={ handleMessageSent }
                                onShowMic={ setShowMic }
                                messengerSocket={ socket }
                                fromUsername={ userInfo.username }
                                toUsername={ conversationData.username }
                                fullName={ userInfo.fullName }
                                shouldClear={ shouldClear }
                            />
                            {
                                showMic ?
                                    <div className="messenger--main__mic-container" onClick={ handleMicClick }>
                                        <img src={ microphone } alt="Microphone" />
                                    </div>
                                    :
                                    <button onClick={ setShouldMessageSent.bind(null, true) }>
                                        <img src={ send } alt="send" />
                                    </button>
                            }
                            {
                                speechRecognitionStart ?
                                    <div onClick={ setSpeechRecognitionStart.bind(null, false) } className="messenger--main__stop-container">
                                        <img src={ stopBtn } alt="Stop Button" />
                                    </div>
                                    :
                                    <div className="messenger--main__speech-container" onClick={ () => setSpeechRecognitionStart(true) }>
                                        <img src={ microphone } alt="Microphone" />
                                        <div>
                                            <img src={ rightArrow } alt="right arrow" />
                                            <img src={ rightArrow } alt="right arrow" />
                                        </div>
                                        <img src={ writing } alt="text" />
                                    </div>
                            }
                        </div>
                    }
                    {
                        recorderStart &&
                        <div className="messenger--main__voice-container">
                            <div className="analyser--container">
                                <canvas ref={ analyzerCanvas } />
                            </div>
                            <div className="voice--right">
                                <div className="decline--icon-container icon--container" onClick={ setRecorderStart.bind(null, false) }>
                                    <img src={ close } alt="cross" />
                                </div>
                                <div className="timer">
                                    <div className="sign" />
                                    { formatRecorderTimer(recorderTimer.minutes) }:{ formatRecorderTimer(recorderTimer.seconds) }
                                </div>
                                <div className="accept--icon-container icon--container" onClick={ handleRecorderFinish }>
                                    <img src={ check } alt="check" />
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </>
        );
    }

    function handleRecorderFinish() {
        if (mediaRecorder?.mediaRecorder) {
            mediaRecorder.mediaRecorder.stop();

            setShouldMessageSent(false);
            setMessageType('regular');
            setSelectedMessageToReply({});
            setSelectedMessageToEdit({});
            setSpeechRecognitionStart(false);
        }
    }

    function handleMessengerMainContainerClick(e) {
        let ele = e.target;
        if (!ele.className) ele = ele.parentElement;

        if (ele.className.includes('messenger--message__tools-icon-container')) {
            return;
        }

        setSelectedTools(-1);
    }

    return (
        <div className="messenger--container">
            { !conversations && <Loading /> }
            <div ref={ messengerMainContainer } onClick={ handleMessengerMainContainerClick } className="messenger--main-container">
                { !conversationData && showConversationSpinner && <div className="spinner--container"><Spinner /></div> }
                { conversationData && renderMainContainer() }
            </div>
            <div ref={ messengerSideContainer } className="messenger--side-container">
                {/*<div className="messenger--side__header-container">*/}
                {/*    <input type="text" placeholder="Search in your chats or Search users with @" />*/}
                {/*</div>*/}
                <div className="messenger--side__body-container">
                    <ul className="messenger--side__items">
                        { dataLoaded && renderConversations() }
                    </ul>
                </div>
            </div>
        </div>
    );
};

function mapStateToProps(state) {
    return {
        userId: state.messenger.userId,
        conversations: state.messenger.conversations,
        conversationData: state.messenger.conversationData,
        userInfo: state.messenger.userInfo,
        mainSocket: state.sockets.main,
        statusSocket: state.sockets.status,
        identifier: state.identifier
    }
}

export default requireAuth(connect(mapStateToProps, {
    fetchMessages,
    fetchIndividualConversation,
    updateMessageStatus,
    submitNewMessage,
    fetchMessengerSocket,
    submitNewMessageFromSocket,
    updateMessageTextFromSocket,
    deleteMessageForMe,
    deleteMessageForEveryone,
    deleteMessageFromSocket,
    messengerStart,
    updateMessageText,
    wipeTempMessage,
    messengerUpdateUserStatus,
    receiveNotificationMessenger,
    wipeIndividualConversation
})(React.memo(Messenger)));
