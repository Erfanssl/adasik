import React, { useEffect, useState, useRef } from 'react';
import { Link } from "react-router-dom";
import { connect } from 'react-redux';
import './Challenges.scss';
import Input from "./Input/Input";
import history from "../../../../history";
import {
    fetchChallengeData,
    createChallenge,
    closeResult,
    rejectRequest,
    acceptRequest,
    fetchFriends,
    sendChallengeFriendRequest,
    cleanCreateChallenge
} from "../../../../actions/challengeAction";
import numberFormatter from "../../../../utility/numberFormatter";
import requireAuth from "../../../../middlewares/requireAuth";
import likesFormatter from "../../../../utility/likesFormatter";
import pageViewSocketConnection from "../../../../utility/pageViewSocketConnection";

import person2 from '../../../../assets/temp/male2.jpg';
import gun from '../../../../assets/icons/gun.svg';
import arm from '../../../../assets/icons/arm.svg';
import confirm from "../../../../assets/check.svg";
import reject from "../../../../assets/cross.svg";
import close from "../../../../assets/icons/close.svg";
import avatar from '../../../../assets/icons/user.svg';
// ChallengeFriends assets
import alone from '../../../../assets/alone.svg';

const POPUP_TYPES = {
    CREATE_NEW_CHALLENGE: 'CREATE_NEW_CHALLENGE',
    CHALLENGE_A_FRIEND: 'CHALLENGE_A_FRIEND',
    WARNING: 'WARNING'
}

const MAXIMUM_CHALLENGE_NUMBER = 20;
const MAXIMUM_REQUEST_NUMBER = 20;


const Challenges = ({
                        challengeData,
                        challengesReFetch,
                        createChallengeData,
                        fetchChallengeData,
                        createChallenge,
                        closeResult,
                        rejectRequest,
                        acceptRequest,
                        fetchFriends,
                        sendChallengeFriendRequest,
                        cleanCreateChallenge
}) => {
    // we use setInterval each 10 sec, to check for challengers to see if they're online

    const [shouldSendCreateChallengeRequest, setShouldSendCreateChallengeRequest] = useState(false);
    const [popUpConfig, setPopUpConfig] = useState({ show: false, type: '' });
    const [resultItemClose, setResultItemClose] = useState([false, '']);
    const [requestItemClose, setRequestItemClose] = useState([false, '']);
    const [shouldReject, setShouldReject] = useState({ bool: false, type: 'single', id: '' });
    const [fadeWarning, setFadeWarning] = useState({});
     // ChallengeFriend state
    const [challengeFriendSelectionList, setChallengeFriendSelectionList] = useState([]);
    const [challengeFriendInput, setChallengeFriendInput] = useState('');
    const [requestSent, setRequestSent] = useState({ showLoading: false, loaded: false });

    // ref
    const warningCardContainer = useRef();
    const newChallengeWarning = useRef();
    const newRequestWarning = useRef();

    useEffect(() => {
        document.title = 'Adasik - Challenges';
        fetchChallengeData();
        const pageViewSocket = pageViewSocketConnection();

        return () => {
            cleanCreateChallenge();
            pageViewSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (challengesReFetch && challengesReFetch[0]) {
            fetchChallengeData();
        }
    }, [challengesReFetch]);

    useEffect(() => {
        if (popUpConfig.show && popUpConfig.type === POPUP_TYPES.CREATE_NEW_CHALLENGE) {
            setShouldSendCreateChallengeRequest(false);
            setTimeout(() => {
                setShouldSendCreateChallengeRequest(true);
            }, 2000);

            return () => {
                setShouldSendCreateChallengeRequest(false);
            };
        }

        if (popUpConfig.show && popUpConfig.type === POPUP_TYPES.WARNING && warningCardContainer?.current) {
            warningCardContainer.current.classList.add('open');
        }

        if (!popUpConfig.show && popUpConfig.type === POPUP_TYPES.WARNING) {
            warningCardContainer.current.classList.remove('open');
        }

        if (popUpConfig.show && popUpConfig.type === POPUP_TYPES.CHALLENGE_A_FRIEND) {
            fetchFriends();
        }
    }, [popUpConfig]);

    useEffect(() => {
        if (shouldReject.bool && shouldReject.type === 'single') {
            setRequestItemClose([true, shouldReject.id]);

            setTimeout(() => {
                rejectRequest(shouldReject.id);
            }, 300);
        }

        else if (shouldReject.bool && shouldReject.type === 'all') {
            setRequestItemClose([true, 'all']);

            setTimeout(() => {
                rejectRequest('all');
            }, 300);
        }
    }, [shouldReject])

    useEffect(() => {
        if (shouldSendCreateChallengeRequest && popUpConfig.show) {
            createChallenge();
        }
    }, [shouldSendCreateChallengeRequest]);

    useEffect(() => {
        if (createChallengeData) {
            history.push(`/challenges/${ createChallengeData.url }`);
        }
    }, [createChallengeData]);

    function createStatusClassName(status, baseClassName) {
        let newClassName = baseClassName;
        if (status.text === 'online') newClassName += ' challenges--item__online';
        else newClassName += ' challenges--item__offline';

        return newClassName;
    }

    /* start rendering requests section */

    function handleSingleRejectRequest(id) {
        setShouldReject({ bool: false, type: 'single', id });
        setPopUpConfig({ show: true, type: POPUP_TYPES.WARNING });
    }

    function handleRejectAllRequests() {
        setPopUpConfig({ show: true, type: POPUP_TYPES.WARNING });
        setShouldReject({ bool: false, type: 'all', id: '' });
    }

    function handleAcceptRequest(id) {
        // to check if the active challenges of the user will become more that the max number
        if (challengeData && challengeData.challenges && challengeData.challenges.active.length + 1 > MAXIMUM_CHALLENGE_NUMBER) {
            if (fadeWarning && newChallengeWarning?.current) {
                newChallengeWarning.current.classList.add('active');

                setTimeout(() => {
                    newChallengeWarning.current.classList.remove('active');
                }, 3000);
            }

            return;
        }

        setRequestItemClose([true, id]);

        setTimeout(() => {
            acceptRequest(id);
        }, 300);
    }

    function renderRequestItem() {
        function generateClassName(id) {
            let className = 'challenges--request-item';
            if (requestItemClose[0] && requestItemClose[1] === 'all') className += ' close';
            else if (requestItemClose[0] && requestItemClose[1] === id) className += ' close';

            return className;
        }

        return challengeData.requests.map(({ _id, level, totalScore, username, status, avatar }) => {
            return (
                <li className={ generateClassName(_id) }>
                    <div className="challenges--request__info-container">
                        <div>
                            <p>Level</p>
                            <p>{ numberFormatter(level) }</p>
                        </div>
                        <div>
                            <p>Score</p>
                            <p>{ numberFormatter(totalScore) }</p>
                        </div>
                    </div>
                    <div className={ createStatusClassName(status, 'challenges--request__img-container') }>
                        <img src={ avatar } alt={ username } />
                    </div>
                    <div className="challenges--request__btn-container">
                        <img onClick={ handleAcceptRequest.bind(null, _id) } src={ confirm } alt="confirm" />
                        <img onClick={ handleSingleRejectRequest.bind(null, _id) } src={ reject } alt="reject" />
                    </div>
                </li>
            );
        });
    }

    function renderRequestSection() {
        return (
            <div className="challenges--requests__container">
                {
                    challengeData.requests.length <= 0 ?
                        <p className="no-result">no game request to show</p> :
                        <>
                            <h3>{ challengeData.requests.length } Challenge Request{ challengeData.requests.length > 1 ? 's' : '' }</h3>
                            <ul className="challenges--requests-group">
                                { renderRequestItem() }
                            </ul>
                            <div onClick={ handleRejectAllRequests } className="challenges--close">
                                <p>Reject All</p>
                            </div>
                        </>
                }
            </div>
        );
    }

    /* end rendering requests section */

    /* start rendering results section */

    function generateResult(result) {
        if (result === 'win') return 'WON';
        if (result === 'lose') return 'LOST';
        else return 'DRAW';
    }

    function generateEachSideResult(home, away, result, endType) {
        if (endType === 'normal') {
            const homeScore = home.gamesInRounds.reduce((acc, objInfo) => acc + objInfo.score, 0);
            const awayScore = away.gamesInRounds.reduce((acc, objInfo) => acc + objInfo.score, 0);

            if (homeScore === awayScore) return `you 1 - 1 opponent`;

            let side;
            if ((result === 'win') && (homeScore > awayScore)) side = 'home';
            else if ((result === 'win') && (homeScore < awayScore)) side = 'away';

            if ((result === 'lose') && (homeScore > awayScore)) side = 'away';
            else if ((result === 'lose') && (homeScore < awayScore)) side = 'home';

            if (side === 'home' && homeScore && awayScore) return `you ${ likesFormatter(Math.ceil(homeScore / awayScore)) } - ${ likesFormatter(Math.ceil(awayScore / homeScore)) } opponent`;
            if (side === 'away' && homeScore && awayScore) return `you ${ likesFormatter(Math.ceil( awayScore / homeScore)) } - ${ likesFormatter(Math.ceil(homeScore / awayScore)) } opponent`;

            if (side === 'home') return `you ${ likesFormatter(homeScore) } - ${ likesFormatter(awayScore) } opponent`;
            if (side === 'away') return `you ${ likesFormatter(awayScore) } - ${ likesFormatter(homeScore) } opponent`;
        }

        else if (endType === 'time') {
            if (result === 'win') return 'you won by time';
            return 'you lost on time';
        }
    }

    function handleSingleResultClose(id, e) {
        e.preventDefault();
        setResultItemClose([true, id]);

        setTimeout(() => {
            closeResult(id);
        }, 300);
    }

    function handleResultCloseAll() {
        setResultItemClose([true, 'all']);

        setTimeout(() => {
            closeResult('all');
        }, 300);
    }


    function renderResultItem(resultsArr) {
        function createResultSectionItemClassName(result, id) {
            let className = 'challenges--results__item';
            if (result === 'win') className += ' challenges--item__won';
            else if (result === 'lose') className += ' challenges--item__lost';
            else className += ' challenges--item__draw';

            if (resultItemClose[0] && resultItemClose[1] === 'all') className += ' close';
            else if (resultItemClose[0] && id === resultItemClose[1]) className += ' close';

            return className;
        }

        return resultsArr.map(({ _id, opponentInfo, home, away, result, url, endType }) => {
            return (
                <Link to={ url ? `/challenges/${ url }` : '#' } className={ createResultSectionItemClassName(result, _id) }>
                    <div className={ createStatusClassName(opponentInfo.status, 'challenges--item__image-container') }>
                        <img src={ opponentInfo.avatar } alt="opponent" />
                    </div>
                    <div className="challenges--item__meta-data">
                        <h3 className="challenges--item__name">{ opponentInfo.fullName }</h3>
                        <p>{ generateEachSideResult(home, away, result, endType) }</p>
                    </div>
                    <div className="challenges--item__status">
                        <h2>{ generateResult(result) }</h2>
                    </div>
                    <img onClick={ handleSingleResultClose.bind(null, _id) } className="challenges--item__close" src={ close } alt="close" />
                </Link>
            );
        });
    }

    function renderResultSection() {
        const resultsArr = challengeData.challenges.inactive.filter(ch => !ch.close);

        return (
            <div className="challenges--results__container">
                {
                    resultsArr.length <= 0 ?
                        <p className="no-result">no game result to show</p> :
                        <>
                            <h3>Results</h3>
                            { renderResultItem(resultsArr) }
                            <div onClick={ handleResultCloseAll.bind(null, 'all') } className="challenges--close">
                                <p>Clear All</p>
                            </div>
                        </>
                }

            </div>
        );
    }

    /* end of rendering results section */

    /* start rendering turn's sections */
    function generateEachSideResultInTurn(home, away, shouldPlay, turn) {
        let homeScore = 0;
        let awayScore = 0;

        if (home) homeScore = home.gamesInRounds.reduce((acc, objInfo) => acc + objInfo.score, 0);
        if (away) awayScore = away.gamesInRounds.reduce((acc, objInfo) => acc + objInfo.score, 0);

        if (homeScore === 0 && homeScore === awayScore) return 'you 0 - 0 opponent';
        if (homeScore === awayScore) return 'you 1 - 1 opponent';

        let side;
        if (turn === 'home' && shouldPlay) side = 'home';
        else if (turn === 'home' && !shouldPlay) side = 'away';

        if (turn === 'away' && shouldPlay) side = 'away';
        else if (turn === 'away' && !shouldPlay) side = 'home';

        if (side === 'home' && homeScore && awayScore) return `you ${ Math.ceil(homeScore / awayScore) } - ${ Math.ceil(awayScore / homeScore) } opponent`;
        if (side === 'away' && homeScore && awayScore) return `you ${ Math.ceil( awayScore / homeScore) } - ${ Math.ceil(homeScore / awayScore) } opponent`;

        if (side === 'home') return `you ${ homeScore } - ${ awayScore } opponent`;
        if (side === 'away') return `you ${ awayScore } - ${ homeScore } opponent`;
    }

    const ONE_MINUTE = 1000 * 60;
    const ONE_HOUR = ONE_MINUTE * 60;

    function generateTimePast(time) {
        if (time <= ONE_MINUTE) return 'less than a minute ago';
        if (time > ONE_MINUTE && time < ONE_HOUR) {
            if (window.innerWidth <= 500) return `${ (time / ONE_MINUTE).toFixed(0) }m ago`;
            return `${ (time / ONE_MINUTE).toFixed(0) } minutes ago`;
        }
        if (time >= ONE_HOUR) {
            if (window.innerWidth <= 500) return `about ${ (time / ONE_HOUR).toFixed(0) }h ago`;
            return `about ${ (time / ONE_HOUR).toFixed(0) } hours ago`;
        }
    }

    function generateTimeLeft(time) {
        const remainingTime = (ONE_HOUR * 6) - time;
        const hourLeft = Math.floor(remainingTime / ONE_HOUR);
        let minuteLeft = Number(((remainingTime - (hourLeft * ONE_HOUR)) / ONE_MINUTE).toFixed(0));
        if (minuteLeft === 60) minuteLeft = 59;
        let message = '';

        if (hourLeft === 1) message += '1 hour';
        if (hourLeft > 1) message += `${ hourLeft } hours`;
        if (minuteLeft <= 0) message += ' left';
        if (minuteLeft === 1) message += (message.length ? ' and 1 minute left' : '1 minute left');
        if (minuteLeft > 1) message += (message.length ? ` and ${ minuteLeft } minutes left` : `${ minuteLeft } minutes left`);
        if (message === ' left') message = 'time is almost up';

        if (window.innerWidth <= 500) return message.replace(/(minutes|hours)/gi , w => w.substring(0, w.length - 1)).replace(/( hour| minute)/gi, w => w.includes('hour') ? 'h' : 'm');
        return message;
    }

    function renderTurnItem(arr, itemClassName, side) {
        return arr.map(({ opponentInfo, home, away, shouldPlay, turn, updatedAt, pending, url }) => {
            if (pending) {
                return (
                    <Link to={ `/challenges/${ url }` }>
                        <div className={ "challenges--item " + itemClassName } >
                            <div className="challenges--item__image-container challenges--item__offline" >
                                <img src={ avatar } alt='Pending Avatar' />
                            </div>
                            <div className="challenges--item__meta-data">
                                <h3 className="challenges--item__name">Anonymous</h3>
                                <p>{ generateEachSideResultInTurn(home, away, shouldPlay, turn) }</p>
                            </div>
                            <div className="challenges--item__time">
                                <p>{ generateTimePast(new Date() - new Date(updatedAt)) }</p>
                                <p>{ generateTimeLeft(new Date() - new Date(updatedAt)) }</p>
                            </div>
                        </div>
                    </Link>
                );
            }

            function generateClassName() {
                let className = "challenges--item " + itemClassName;
                if (side === 'you' && (new Date() - new Date(updatedAt) > 5.5 * ONE_HOUR)) className += " short-time__danger";
                else if (side === 'you' && (new Date() - new Date(updatedAt) > 5 * ONE_HOUR)) className += " short-time";

                return className;
            }

            return (
                <Link to={ `/challenges/${ url }` }>
                    <div className={ generateClassName() } >
                        <div className={ createStatusClassName(opponentInfo.status, 'challenges--item__image-container') }>
                            <img src={ opponentInfo.avatar } alt={ opponentInfo.fullName } />
                        </div>
                        <div className="challenges--item__meta-data">
                            <h3 className="challenges--item__name">{ opponentInfo.fullName }</h3>
                            <p>{ generateEachSideResultInTurn(home, away, shouldPlay, turn) }</p>
                        </div>
                        <div className="challenges--item__time">
                            <p>{ generateTimePast(new Date() - new Date(updatedAt)) }</p>
                            <p>{ generateTimeLeft(new Date() - new Date(updatedAt)) }</p>
                        </div>
                    </div>
                </Link>
            );
        });
    }

    // challenges--item__your
    // challenges--item__opponent

    function renderTurnSection() {
        const yourTurnArr = challengeData.challenges.active.filter(activeChallenge => activeChallenge.shouldPlay);
        const opponentTurnArr = challengeData.challenges.active.filter(activeChallenge => !activeChallenge.shouldPlay);

        return (
            <>
                {
                    yourTurnArr.length > 0 &&
                    <div className="challenges--your-turn-container">
                        <div className="challenges--header-container">
                            <h2>Your Turn</h2>
                        </div>
                        <div className="challenges--body-container">
                            { !challengeData.pending && renderTurnItem(yourTurnArr, 'challenges--item__your', 'you') }
                        </div>
                    </div>
                }
                {
                    opponentTurnArr.length > 0 &&
                    <div className="challenges--opponent-turn-container">
                        <div className="challenges--header-container">
                            <h2>Opponent's Turn</h2>
                        </div>
                        <div className="challenges--body-container">
                            { !challengeData.pending && renderTurnItem(opponentTurnArr, 'challenges--item__opponent', 'opponent') }
                        </div>
                    </div>
                }
            </>
        );
    }


    /* end of rendering turn's sections */

    function handleCancelCreateChallengePopUp() {
        setPopUpConfig({ show: false, type: '' });
        setShouldSendCreateChallengeRequest(false);
    }

    /* PopUp Sections */
    // create new challenge pop up
    function renderNewChallengePopUp() {
        return (
            <div className="challenges--pop-up__new-challenge">
                <div className="pop-up--data">
                    <h3>Searching for an opponent...</h3>
                    <button
                        className={ shouldSendCreateChallengeRequest ? "hide" : undefined }
                        onClick={ handleCancelCreateChallengePopUp }
                    >
                        Cancel
                    </button>
                </div>
                <div className="circle circle--one" />
                <div className="circle circle--two" />
                <div className="circle circle--three" />
                <div className="circle circle--four" />
            </div>
        );
    }

    function renderWarningPopUp() {
        function handleWarningPopUpYesBtn() {
            setShouldReject(re => ({ ...re, bool: true }));
            setPopUpConfig({ show: false, type: '' });
        }

        function handleWarningPopUpNoBtn() {
            setShouldReject({ bool: false, type: '', id: '' });
            setPopUpConfig({ show: false, type: '' });
        }

        return (
            <div className="challenges--pop-up__warning-container">
                <div ref={ warningCardContainer } className="card">
                    {
                        shouldReject.type === 'single' &&
                        <p>Are you sure you want to reject the request?</p>
                    }
                    {
                        shouldReject.type === 'all' &&
                        <p>Are you sure you want to reject all the requests?</p>
                    }
                    <div className="btn--container">
                        <button onClick={ handleWarningPopUpYesBtn } className="yes">Yes</button>
                        <button onClick={ handleWarningPopUpNoBtn } className="no">No</button>
                    </div>
                </div>
            </div>
        );
    }

    function renderChallengeAFriendPopUp() {
        function handleChallengeAFriendCloseBtn() {
            setPopUpConfig({ show: false, type: '' });
            setRequestSent(false);
            setChallengeFriendSelectionList([]);
            setRequestSent({ showLoading: false, loaded: false });
        }

        function handleFriendSelection(id) {
            setChallengeFriendSelectionList(list => list.includes(id) ? list.filter(listId => listId !== id) : [...list, id]);
        }

        function generateClassName(status) {
            let className = 'inside--container';
            if (status === 'online') className += ' challenges--person__online';
            else className += ' challenges--person__offline';

            return className;
        }

        function renderFriendItem() {
            const challengeFriendArr = challengeData.friends.filter(
                friend =>
                    friend.username.toLowerCase().includes(challengeFriendInput.toLowerCase()) ||
                    friend.fullName.toLowerCase().includes(challengeFriendInput.toLowerCase())
            )
            return challengeFriendArr.map(({ _id, avatar, fullName, username, status }) => {
                return (
                    <li className="challenges--friend__item-container">
                        <div onClick={ handleFriendSelection.bind(null, _id) } className={ generateClassName(status.text) }>
                            <img src={ avatar } alt={ fullName } />
                            <div className="selection--container">
                                <img
                                    className={ challengeFriendSelectionList.includes(_id) ? "selected" : undefined }
                                    src={ confirm }
                                    alt="select"
                                />
                            </div>
                        </div>
                        <Link to={ `/profile/${ username }` } className="name--container">
                            <p>{ fullName }</p>
                        </Link>
                    </li>
                );
            });
        }

        function handleChallengeAFriendSendBtn() {
            // we check the number of active challenges and requests should not exceed the allowed size
            if (challengeData && challengeData.challenges && challengeData.challenges.active.length >= MAXIMUM_CHALLENGE_NUMBER) {
                newChallengeWarning.current.classList.add('active');

                setTimeout(() => {
                    newChallengeWarning.current.classList.remove('active');
                }, 3000);

                return;
            }

            if (challengeData && challengeData.userRequestCounter && challengeData.userRequestCounter.pending + challengeFriendSelectionList.length >= MAXIMUM_REQUEST_NUMBER) {
                newRequestWarning.current.classList.add('active');

                setTimeout(() => {
                    newRequestWarning.current.classList.remove('active');
                }, 3000);

                return;
            }

            // we want to send the request to the list of selected friends
            setRequestSent({ showLoading: true, loaded: false });
            sendChallengeFriendRequest(challengeFriendSelectionList)
                .then(() => {
                    setRequestSent({ showLoading: false, loaded: true });
                });
        }

        function renderChallengeAFriendInnerContent() {
            if (requestSent.showLoading) {
                return (
                    <div className="request--sending">
                        Sending the request{ challengeFriendSelectionList.length > 1 ? 's' : '' }...
                    </div>
                );
            }

            if (requestSent.loaded) {
                return (
                    <div className="request--sent">
                        Request{ challengeFriendSelectionList.length > 1 ? 's' : '' } was sent successfully
                    </div>
                );
            }

            if (challengeData.friends && challengeData.friends.length > 0) {
                return (
                    <>
                        <div className="challenge--friend__header-container">
                            { challengeFriendSelectionList.length > 0 ?
                                <h3>You've selected { challengeFriendSelectionList.length } friend{ challengeFriendSelectionList.length === 1 ? '' : 's' }</h3> :
                                <h3>Select friend(s) you want to send a challenge request</h3>
                            }
                            <Input
                                content={ challengeFriendInput }
                                setContent={ setChallengeFriendInput }
                            />
                        </div>
                        <ul className="challenges--friends__items-group">
                            { challengeData && challengeData.friends && renderFriendItem() }
                        </ul>
                        <button
                            onClick={ handleChallengeAFriendSendBtn }
                            disabled={ challengeFriendSelectionList.length <= 0 }
                        >
                            Send
                        </button>
                    </>
                );
            }

            if (challengeData.friends && challengeData.friends.length <= 0) {
                return (
                    <div className="no--friends">
                        <div>
                            <p>You don't have any friends</p>
                            <p>Start making some...</p>
                        </div>
                        <img src={ alone } alt="no-friends" />
                    </div>
                );
            }
        }

        return (
            <div className="challenges--pop-up__challenge-friend">
                <div className="challenge--friend__container">
                    <div onClick={ handleChallengeAFriendCloseBtn } className="close--container">
                        <img src={ close } alt="close" />
                    </div>
                    { challengeData && renderChallengeAFriendInnerContent() }
                </div>
            </div>
        );

    }

    function renderPopUp() {
        if (popUpConfig.type === POPUP_TYPES.CREATE_NEW_CHALLENGE) return renderNewChallengePopUp();
        if (popUpConfig.type === POPUP_TYPES.WARNING) return renderWarningPopUp();
        if (popUpConfig.type === POPUP_TYPES.CHALLENGE_A_FRIEND) return renderChallengeAFriendPopUp();
    }

    // useEffect(() => {
    //     if (fadeWarning && newChallengeWarning?.current) {
    //         newChallengeWarning.current.classList.add('active');
    //
    //     }
    // }, [fadeWarning]);

    function handleCreateNewChallengeClick() {
        // to check if the active challenges of the user will become more that the max number

        if (challengeData && challengeData.challenges && challengeData.challenges.active.length + 1 > MAXIMUM_CHALLENGE_NUMBER) {
            if (fadeWarning && newChallengeWarning?.current) {
                newChallengeWarning.current.classList.add('active');

                setTimeout(() => {
                    newChallengeWarning.current.classList.remove('active');
                }, 3000);
            }

            return;
        }

        setPopUpConfig({
            show: true,
            type: POPUP_TYPES.CREATE_NEW_CHALLENGE
        });
    }

    function handleChallengeAFriend() {
        setPopUpConfig({ show: true, type: POPUP_TYPES.CHALLENGE_A_FRIEND });
    }

    return (
        <div className="challenges--container" style={ popUpConfig.show ? { overflow: 'hidden', height: '93vh', padding: '1rem 0' } : {} }>
            { popUpConfig.show && renderPopUp() }
            <div className="challenges--header__btn-container--two">
                <div onClick={ handleCreateNewChallengeClick }>
                    <img src={ gun } alt="start a challenge" />
                    New Challenge
                </div>
                <div onClick={ handleChallengeAFriend }>
                    <img src={ arm } alt="challenge a friend" />
                    Challenge a Friend
                </div>
            </div>
            <div className="challenges--top-temp__container">
                { challengeData && challengeData.requests && renderRequestSection() }
                { challengeData && renderResultSection() }
            </div>
            <div ref={ newChallengeWarning } className="challenges--warning-container">
                <p>Sorry, but your active challenges are getting too much!</p>
                <p>Finish some of them and try again!</p>
            </div>
            <div ref={ newRequestWarning } className="challenges--warning-container">
                <p>Sorry, but the number of your requests are getting too much!</p>
                <p>Please try again later</p>
            </div>
            <div className="challenges--header__btn-container">
                <div onClick={ handleCreateNewChallengeClick }>
                    <img src={ gun } alt="start a challenge" />
                    New Challenge
                </div>
                <div onClick={ handleChallengeAFriend }>
                    <img src={ arm } alt="challenge a friend" />
                    Challenge a Friend
                </div>
            </div>
            { challengeData && renderTurnSection() }
        </div>
    );
};

function mapStateToProps(state) {
    return {
        challengeData: state.challenges.main,
        createChallengeData: state.challenges.create
    }
}

export default requireAuth(connect(mapStateToProps, {
    fetchChallengeData,
    createChallenge,
    closeResult,
    rejectRequest,
    acceptRequest,
    fetchFriends,
    sendChallengeFriendRequest,
    cleanCreateChallenge
})(Challenges));