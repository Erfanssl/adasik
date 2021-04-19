import React, { useState, useRef, useEffect, memo } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './UsersProfile.scss';
import requireAuth from "../../../../../middlewares/requireAuth";
import history from "../../../../../history";
import Spinner from "../../../utils/Spinner/Spinner";
import UsersSearch from "../UsersSearch/UsersSearch";
import Loading from "../../../utils/Loading/Loading";
import NotFound from "../../../utils/NotFound/NotFound";
// action
import {
    usersProfileFetchData,
    usersProfileSendFriendRequest,
    usersProfileSendChallengeRequest,
    usersProfileSendLike,
    usersProfileSendBlock,
    usersProfileSendReport,
    usersProfileWipeData
} from "../../../../../actions/usersProfileAction";
import { tempMessageSendData } from "../../../../../actions/tempMessageAction";
// chart generators
import createRadar from "../../Statistics/Radar/createRadar";
import renderPieChart from "../../Statistics/createPieChart";
// helper functions
import numberFormatter from "../../../../../utility/numberFormatter";
import likesFormatter from "../../../../../utility/likesFormatter";
import pageViewSocketConnection from "../../../../../utility/pageViewSocketConnection";
import wordCapitalize from "../../../../../utility/wordCapitalize";

// assets
// social icons
import twitter from '../../../../../assets/icons/twitter.svg';
import instagram from '../../../../../assets/icons/instagram.svg';
import facebook from '../../../../../assets/icons/facebook.svg';
import youtube from '../../../../../assets/icons/youtube.svg';
// action icons
import like from '../../../../../assets/icons/like-profile.svg';
import challenge from '../../../../../assets/icons/challenge-profile.svg';
import addFriend from '../../../../../assets/icons/add-friend-profile.svg';
import chat from '../../../../../assets/icons/message-profile.svg';
import report from '../../../../../assets/icons/report-profile.svg';
import block from '../../../../../assets/icons/block-profile.svg';
import unlock from '../../../../../assets/icons/unlock.svg';
// other icons
import badge from '../../../../../assets/icons/badge.svg';
import timePastFormatter from "../../../../../utility/timePastFormatter";
import textCutter from "../../../../../utility/textCutter";

const pieDims = { height: 280, width: 280, radius: 140 };

const UsersProfile = ({
                          usersProfileData,
                          usersProfileFetchData,
                          usersProfileSendFriendRequest,
                          usersProfileSendChallengeRequest,
                          usersProfileSendLike,
                          tempMessageSendData,
                          usersProfileSendBlock,
                          usersProfileSendReport,
                          usersProfileWipeData,
                          match
                      }) => {
    const [brainData, setBrainData] = useState([[]]);
    const [personalityData, setPersonalityData] = useState([[]]);
    const [gamesData, setGamesData] = useState({ total: 0, data: [] });
    const [popUpConfig, setPopUpConfig] = useState({ show: false, type: '', text: '' });
    const [spinnerConfig, setSpinnerConfig] = useState({ show: false, type: '' });
    const [errorConfig, setErrorConfig] = useState({ show: false, text: '' });
    const [successConfig, setSuccessConfig] = useState({ show: false, text: '' });
    const [likeResultConfig, setLikeResultConfig] = useState({ show: false, type: '' });
    const [usernameChange, setUsernameChange] = useState('');
    const [showLoading, setShowLoading] = useState(false);
    const [scrollY, setScrollY] = useState(0);

    const canvas = useRef();
    const canvas2 = useRef();
    const canvas3 = useRef();
    const popUpCardContainer = useRef();

    useEffect(() => {
        document.title = `Adasik - ${ wordCapitalize(match.params.username) }`;
        usersProfileFetchData(match.params.username);
        const pageViewSocket = pageViewSocketConnection();

        return () => {
            usersProfileWipeData();
            pageViewSocket.disconnect();
        }
    }, []);

    useEffect(() => {
        if (usernameChange) {
            setShowLoading(true);
            usersProfileFetchData(usernameChange);
        }
    }, [usernameChange]);

    function handleRadarDiagramData(data, type) {
        const outerArr = [];
        const innerArr = [];
        for (let key in data) {
            innerArr.push({
                axis: key.replace(/[A-Z]/, w => ' ' + w).replace(/^.+?/, w => w.toUpperCase()),
                value: data[key]
            })
        }

        outerArr.push(innerArr);

        if (type === 'brain') return setBrainData(outerArr);
        setPersonalityData(outerArr);
    }

    function handlePieChartData(data) {
        if (gamesData.total === data.total) return;

        const arr = [];
        for (let key in data) {
            if (key !== 'total') {
                arr.push({
                    name: key.replace(/^.+?/, w => w.toUpperCase()),
                    orders: data[key]
                })
            }
        }

        setGamesData({ total: data.total, data: arr });
    }

    useEffect(() => {
        if (!usersProfileData || !Object.keys(usersProfileData).length) setShowLoading(true);
        if (!usersProfileData.Error && Object.keys(usersProfileData).length) {
            // if (usersProfileData.redirect) history.push('/profile');
            setShowLoading(false);

            // we check to see if there is no personality or brain data and there is a diagram for prev user, we want to delete it
            if (!usersProfileData.info.specific.detailed || !usersProfileData.info.specific.detailed.brain) {
                if (canvas && canvas.current && canvas.current.children[0]) canvas.current.children[0].parentNode.removeChild(canvas.current.children[0]);
            }

            if (!usersProfileData.info.specific.detailed || !usersProfileData.info.specific.detailed.personality) {
                if (canvas2 && canvas2.current && canvas2.current.children[0]) canvas2.current.children[0].parentNode.removeChild(canvas2.current.children[0]);
            }

            if (usersProfileData.info.specific.whole.games.total === 0) {
                if (canvas3 && canvas3.current && canvas3.current.children[0]) {
                    canvas3.current.children.forEach(el => {
                        el.parentNode.removeChild(el);
                    });
                }
            }

            if (usersProfileData.info.specific.detailed && usersProfileData.info.specific.detailed.brain) handleRadarDiagramData(usersProfileData.info.specific.detailed.brain, 'brain');
            if (usersProfileData.info.specific.detailed && usersProfileData.info.specific.detailed.personality) handleRadarDiagramData(usersProfileData.info.specific.detailed.personality, 'personality');
            handlePieChartData(usersProfileData.info.specific.whole.games);

            // handle state changes for actions
            // friendRequest
            if (usersProfileData.friendRequest) {
                if (usersProfileData.friendRequest.Error) {
                    setSpinnerConfig({ show: false, type: '' });
                    setErrorConfig({ show: true, text: 'Unable to send the request. Try again' });
                } else setErrorConfig({ show: false, text: '' });


                if (usersProfileData.friendRequest.done) {
                    setSpinnerConfig({ show: false, type: '' });
                    setSuccessConfig({ show: true, text: 'Your request was sent successfully' });
                } else setSuccessConfig({ show: false, text: '' });
            }

            // challengeRequest
            if (usersProfileData.challengeRequest) {
                if (usersProfileData.challengeRequest.ChallengeError) {
                    setSpinnerConfig({ show: false, type: '' });
                    setErrorConfig({ show: true, text: 'Your challenges reached the limit (20)' });
                } else setErrorConfig({ show: false, text: '' });

                if (usersProfileData.challengeRequest.RequestError) {
                    setSpinnerConfig({ show: false, type: '' });
                    setErrorConfig({ show: true, text: 'Your Requests reached the limit (50)' });
                } else setErrorConfig({ show: false, text: '' });

                if (usersProfileData.challengeRequest.Error) {
                    setSpinnerConfig({ show: false, type: '' });
                    setErrorConfig({ show: true, text: 'Unable to send challenge request. Try again' });
                } else setErrorConfig({ show: false, text: '' });

                if (usersProfileData.challengeRequest.done) {
                    setSpinnerConfig({ show: false, type: '' });
                    setSuccessConfig({ show: true, text: 'Your request was sent successfully' });
                } else setSuccessConfig({ show: false, text: '' });
            }

            // like
            if (usersProfileData.like) {
                if (usersProfileData.like.Error) {
                    setSpinnerConfig({ show: false, type: '' });
                    setLikeResultConfig({ show: true, type: 'error' });
                } else setLikeResultConfig({ show: false, type: '' });

                if (usersProfileData.like.done) {
                    setSpinnerConfig({ show: false, type: '' });
                    setLikeResultConfig({ show: true, type: 'success' });
                } else setLikeResultConfig({ show: false, type: '' });
            }

            // block
            if (usersProfileData.block) {
                if (usersProfileData.block.Error) {
                    setSpinnerConfig({ show: false, type: '' });
                    setErrorConfig({ show: true, text: 'Operation Failed. Try again' });
                } else setErrorConfig({ show: false, text: '' });

                if (usersProfileData.block.done) {
                    const blockStatus = usersProfileData.userBlocked ? 'blocked' : 'unblocked';
                    setSpinnerConfig({ show: false, type: '' });
                    setSuccessConfig({ show: true, text: `You successfully ${ blockStatus } ${ match.params.username }` });
                } else setSuccessConfig({ show: false, text: '' });
            }

            // report
            if (usersProfileData.report) {
                if (usersProfileData.report.Error) {
                    setSpinnerConfig({ show: false, type: '' });
                    setErrorConfig({ show: true, text: 'Could not make the report. Try again' });
                } else setErrorConfig({ show: false, text: '' });

                if (usersProfileData.report.done) {
                    setSpinnerConfig({ show: false, type: '' });
                    setSuccessConfig({ show: true, text: 'Your report was sent successfully' });
                } else setSuccessConfig({ show: false, text: '' });
            }
        }
    }, [usersProfileData]);

    useEffect(() => {
        if (Object.keys(usersProfileData).length && usersProfileData.info.specific.detailed && usersProfileData.info.specific.detailed.brain) {
            createRadar(canvas, brainData, 'small');
        }
    }, [canvas, brainData]);

    useEffect(() => {
        if (Object.keys(usersProfileData).length && usersProfileData.info.specific.detailed && usersProfileData.info.specific.detailed.personality) {
            createRadar(canvas2, personalityData, 'small');
        }
    }, [canvas2, personalityData]);

    useEffect(() => {
        if (Object.keys(usersProfileData).length && usersProfileData.info.specific.whole.games.total !== 0) {
            renderPieChart(canvas3, gamesData.data, pieDims);
        }
    }, [canvas3, gamesData]);

    useEffect(() => {
        if (popUpConfig.show && popUpCardContainer && popUpCardContainer.current) {
            popUpCardContainer.current.classList.add('active');
        }

        if (!popUpConfig.show) {
            document.querySelector('.inner--right-container').scrollTo(0, scrollY);
            setScrollY(0);
        }

        if (!popUpConfig.show && popUpCardContainer && popUpCardContainer.current) {
            popUpCardContainer.current.classList.remove('active');
        }
    }, [popUpConfig]);

    function renderStatus() {
        if (!usersProfileData.Error && usersProfileData.status && usersProfileData.status.text === 'online') {
            return <p>{ usersProfileData.status.text }</p>;
        } else if (!!Object.keys(usersProfileData).length && usersProfileData.status && usersProfileData.status.text === 'offline') {
            return <p>last seen { timePastFormatter(usersProfileData.status.date) }</p>;
        }
    }

    function renderSocial() {
        return usersProfileData.info.general.social.map(el => {
            switch (el.name) {
                case 'Twitter':
                    return (
                        <div key={ el._id } className="users-profile--right__social-icon twitter">
                            <a href={ el.link }>
                                <img src={ twitter } alt="twitter" />
                            </a>
                        </div>
                    );
                case 'Instagram':
                    return (
                        <div key={ el._id } className="users-profile--right__social-icon instagram">
                            <a href={ el.link }>
                                <img src={ instagram } alt="instagram" />
                            </a>
                        </div>
                    );
                case 'Facebook':
                    return (
                        <div key={ el._id } className="users-profile--right__social-icon facebook">
                            <a href={ el.link }>
                                <img src={ facebook } alt="facebook" />
                            </a>
                        </div>
                    );
                case 'Youtube':
                    return (
                        <div key={ el._id } className="users-profile--right__social-icon youtube">
                            <a href={ el.link }>
                                <img src={ youtube } alt="youtube" />
                            </a>
                        </div>
                    );
            }
        });
    }

    function renderFriends() {
        if (Object.keys(usersProfileData).length) {
            return usersProfileData.friends.map(({ username, status, avatar }) => {
                return (
                    <li key={ username } className={ "users-profile--friends__item " + (status === 'online' ? "users-profile--person__online" : "users-profile--person__offline") }>
                        <Link to={ `/profile/${ username }` }>
                            <img src={ avatar } alt={ username } />
                        </Link>
                    </li>
                );
            });
        }
    }

    function renderEducationText(text) {
        if (text.toLowerCase().includes('professional degree')) return 'Professional degree';
        return text;
    }

    function renderDisabledFeature() {
        return (
            <div className="users-profile--disabled">
                <p>Disabled by { usersProfileData.info.general.name.split(' ')[0] }</p>
            </div>
        );
    }

    function renderActionButtons() {
        const name = usersProfileData.info.general.name.split(' ')[0];

        function handleChatClick() {
            setScrollY(document.querySelector('.inner--right-container').scrollTop);
            setPopUpConfig({ show: true, type: 'chat', text: `Do you want to start a conversation with ${ name }?` });
        }

        function handleAddFriendClick() {
            setScrollY(document.querySelector('.inner--right-container').scrollTop);
            setPopUpConfig({ show: true, type: 'add-friend', text: `Do you want to send ${ name } a friend request?` });
        }

        function handleChallengeClick() {
            setScrollY(document.querySelector('.inner--right-container').scrollTop);
            setPopUpConfig({ show: true, type: 'challenge', text: `Do you want to send ${ name } a challenge request?` });
        }

        function handleBlockClick() {
            setScrollY(document.querySelector('.inner--right-container').scrollTop);
            if (!usersProfileData.userBlocked) return setPopUpConfig({ show: true, type: 'block', text: `Are you sure you want to block ${ name }?` });
            setPopUpConfig({ show: true, type: 'unblock', text: `Are you sure you want to unblock ${ name }?` });
        }

        function handleReportClick() {
            setScrollY(document.querySelector('.inner--right-container').scrollTop);
            setPopUpConfig({ show: true, type: 'report', text: `Are you sure you want to report ${ name } to moderators?` });
        }

        return (
            <div className="users-profile--right__row actions">
                <div className="result--container">
                    { errorConfig.show && <p className="result--error">{ errorConfig.text }</p> }
                    { successConfig.show && <p className="result--success">{ successConfig.text }</p> }
                </div>
                <div onClick={ handleChatClick } className="action--chat">
                    {
                        spinnerConfig.show && spinnerConfig.type === 'chat' &&
                        <div className="spinner--container">
                            <Spinner />
                        </div>
                    }
                    { (!spinnerConfig.show || spinnerConfig.type !== 'chat') && <img src={ chat } alt="chat" title="Chat" /> }
                </div>
                {
                    !!Object.keys(usersProfileData).length && !usersProfileData.isFriend &&
                    <div onClick={ handleAddFriendClick } className="action--add-friend">
                        {
                            spinnerConfig.show && spinnerConfig.type === 'add-friend' &&
                            <div className="spinner--container">
                                <Spinner />
                            </div>
                        }
                        { (!spinnerConfig.show || spinnerConfig.type !== 'add-friend') && <img src={ addFriend } alt="Add Friend" title="Add Friend" /> }
                    </div>
                }
                <div onClick={ handleChallengeClick } className="action--challenge">
                    {
                        spinnerConfig.show && spinnerConfig.type === 'challenge' &&
                        <div className="spinner--container">
                            <Spinner />
                        </div>
                    }
                    { (!spinnerConfig.show || spinnerConfig.type !== 'challenge') && <img src={ challenge } alt="Challenge" title="Challenge" /> }
                </div>
                {
                    !!Object.keys(usersProfileData).length && !usersProfileData.isFriend &&
                    <div onClick={ handleBlockClick } className="action--block">
                        {
                            spinnerConfig.show && spinnerConfig.type === 'block' &&
                            <div className="spinner--container">
                                <Spinner />
                            </div>
                        }
                        { (!spinnerConfig.show || spinnerConfig.type !== 'block') && !usersProfileData.userBlocked && <img src={ block } alt="Block" title="Block" /> }
                        {
                            (!spinnerConfig.show || spinnerConfig.type !== 'block') && usersProfileData.userBlocked &&
                            <div>
                                <img src={ block } alt="Block" title="Unblock" style={ { filter: 'saturate(0.6)' } } />
                                <img className="action--block__unlock" title="Unblock" src={ unlock } alt="unlock" />
                            </div>
                        }
                    </div>
                }
                <div onClick={ handleReportClick } className="action--report">
                    {
                        spinnerConfig.show && spinnerConfig.type === 'report' &&
                        <div className="spinner--container">
                            <Spinner />
                        </div>
                    }
                    { (!spinnerConfig.show || spinnerConfig.type !== 'report') && <img src={ report } alt="Report" title="Report" /> }
                </div>
            </div>
        );
    }

    function handleWarningPopUpYesBtn() {
        // add friend
        if (popUpConfig.type === 'add-friend') {
            usersProfileSendFriendRequest(usersProfileData._id);
            setSpinnerConfig({ show: true, type: 'add-friend' });
            setPopUpConfig({ show: false, type: '', text: '' });
        }

        // challenge
        if (popUpConfig.type === 'challenge') {
            usersProfileSendChallengeRequest(usersProfileData._id);
            setSpinnerConfig({ show: true, type: 'challenge' });
            setPopUpConfig({ show: false, type: '', text: '' });
        }

        // chat
        if (popUpConfig.type === 'chat') {
            // constructing data
            const data = {
                fullName: usersProfileData.info.general.name,
                messageBucket: 1,
                messages: [],
                messengerStatus: usersProfileData.messengerStatus,
                unseen: 0,
                userId: usersProfileData._id,
                _id: Date.now(),
                username: match.params.username
            };

            tempMessageSendData(data);
            history.push('/messenger');
            setSpinnerConfig({ show: true, type: 'chat' });
            setPopUpConfig({ show: false, type: '', text: '' });
        }

        // block
        if (popUpConfig.type === 'block' || popUpConfig.type === 'unblock') {
            usersProfileSendBlock(usersProfileData._id);
            setSpinnerConfig({ show: true, type: 'block' });
            setPopUpConfig({ show: false, type: '', text: '' });
        }

        // report
        if (popUpConfig.type === 'report') {
            usersProfileSendReport(usersProfileData._id);
            setSpinnerConfig({ show: true, type: 'report' });
            setPopUpConfig({ show: false, type: '', text: '' });
        }
    }

    function handleWarningPopUpNoBtn() {
        setPopUpConfig({ show: false, type: '', text: '' });
    }

    function handleLikeClick() {
        setSpinnerConfig({ show: true, type: 'like' });
        usersProfileSendLike(usersProfileData._id);
    }

    function handleLikeNumberClick(e) {
        e.stopPropagation();
    }

    if (usersProfileData && usersProfileData.Error && usersProfileData.Error === 'Not Found') {
        return (
            <div className="users-profile--container" style={ popUpConfig.show ? { height: '93vh', overflow: 'hidden' } : {} }>
                <NotFound text="User Not Found" />
            </div>
        );
    }

    else return (
        <div className="users-profile--container" style={ popUpConfig.show || showLoading ? { height: '93vh', overflow: 'hidden' } : {} }>
            { (!usersProfileData || !Object.keys(usersProfileData).length || showLoading) && <Loading /> }
            {
                popUpConfig.show &&
                <div className="users-profile--pop-up__container">
                    <div ref={ popUpCardContainer } className="card">
                        <p>{ popUpConfig.text }</p>
                        { popUpConfig.type === 'block' && <p className="block">By blocking, the user can not send you message, friend request or challenge request</p> }
                        <div className="btn--container">
                            <button onClick={ handleWarningPopUpYesBtn } className="yes--btn">Yes</button>
                            <button onClick={ handleWarningPopUpNoBtn } className="no--btn">No</button>
                        </div>
                    </div>
                </div>
            }
            <UsersSearch
                setUsernameChange={ setUsernameChange }
            />
            <div className="users-profile--verbal-container">
                <div className="users-profile--verbal__left">
                    <div className="users-profile--verbal__avatar-container">
                        <div className={ "users-profile--verbal__avatar " + (usersProfileData.status?.text === 'online' ? "users-profile--person__online" : "users-profile--person__offline") }>
                            { !!Object.keys(usersProfileData).length && <img src={ usersProfileData.info?.general?.avatar } alt="user" /> }
                        </div>
                    </div>
                    <div className="users-profile--verbal__user-info">
                        <div className="users-profile--user__name">
                            {
                                !!Object.keys(usersProfileData).length && usersProfileData.isFriend &&
                                <div className="users-profile--friend-badge__container">
                                    <p>Friend</p>
                                    <img src={ badge } alt="friend badge" />
                                </div>
                            }
                            <p>{ !!Object.keys(usersProfileData).length && usersProfileData.username }</p>
                        </div>
                        <div className="users-profile--user__last-seen">
                            { !!Object.keys(usersProfileData).length && renderStatus() }
                        </div>
                        {
                            !!Object.keys(usersProfileData).length &&
                            <div className="users-profile--user__like-holder">
                                <div onClick={ handleLikeClick } className={ "users-profile--user__like-container" + (usersProfileData.userLiked ? " liked" : "") }>
                                    <img src={ like } alt="like" />
                                    {
                                        spinnerConfig.show && spinnerConfig.type === 'like' &&
                                        <div className="like--spinner-container">
                                            <Spinner />
                                        </div>
                                    }
                                    { usersProfileData.userLiked ? 'Liked' : 'Like' }
                                    <div onClick={ handleLikeNumberClick } className="like--score-container">{ likesFormatter(usersProfileData.info.general.likes) }</div>
                                </div>
                                { likeResultConfig.show && likeResultConfig.type === 'success' && <div className="users-profile--like__result-container success">Done!</div> }
                                { likeResultConfig.show && likeResultConfig.type === 'error' && <div className="users-profile--like__result-container error">Operation Failed. Try again</div> }
                            </div>
                        }
                    </div>
                </div>
                <div className="users-profile--verbal__right">
                    <div className="users-profile--right__row">
                        <p><span>Name:</span> { !!Object.keys(usersProfileData).length && usersProfileData.info.general.name }</p>
                        <p><span>Total Score:</span> { !!Object.keys(usersProfileData).length && numberFormatter(usersProfileData.info.specific.whole.totalScore) }</p>
                        <p><span>Universal Rank:</span> { !!Object.keys(usersProfileData).length && numberFormatter(usersProfileData.info.specific.whole.rank) }</p>
                    </div>
                    <div className="users-profile--right__row">
                        <p><span>Level:</span> { !!Object.keys(usersProfileData).length && numberFormatter(usersProfileData.info.specific.whole.level.level) }</p>
                        <p><span>Training Score:</span> { !!Object.keys(usersProfileData).length && numberFormatter(usersProfileData.info.specific.whole.trainingScore) }</p>
                        <p><span>Member Since:</span> { !!Object.keys(usersProfileData).length && new Date(usersProfileData.info.general.memberSince).toDateString().split(' ').map((el, i) => i % 2 !== 0 ? el : ' ') }</p>
                    </div>
                    <div className="users-profile--right__row">
                        {/*<p><span>Group:</span> { !!Object.keys(usersProfileData).length && usersProfileData.info.specific.whole.group.name }</p>*/}
                        { !!Object.keys(usersProfileData).length && usersProfileData.info.general.age && <p><span>Age:</span> { usersProfileData.info.general.age }</p> }
                        { !!Object.keys(usersProfileData).length && typeof usersProfileData.friends !== 'string' && <p><span>Friends:</span> { numberFormatter(usersProfileData.friends.length) }</p> }
                        <p><span>Challenges:</span> { !!Object.keys(usersProfileData).length && numberFormatter(usersProfileData.info.specific.whole.games.total) }</p>
                    </div>
                    <div className="users-profile--right__row">
                        <p><span>Trainings:</span> { !!Object.keys(usersProfileData).length && numberFormatter(usersProfileData.info.specific.whole.trainings) }</p>
                        { !!Object.keys(usersProfileData).length && usersProfileData.info.general.job && <p><span>Job:</span> { usersProfileData.info.general.job }</p> }
                        { !!Object.keys(usersProfileData).length && usersProfileData.info.general.education && <p><span>Education:</span> { renderEducationText(usersProfileData.info.general.education) }</p> }
                    </div>
                    <div className="users-profile--right__row">
                        { !!Object.keys(usersProfileData).length && usersProfileData.info.general.location && <p><span>Country:</span> { textCutter(usersProfileData.info.general.location.country) }</p> }
                    </div>
                    { !!Object.keys(usersProfileData).length && !usersProfileData.redirect && renderActionButtons() }
                    <div className="users-profile--line-separator" />
                    <div className="users-profile--right__bottom-container">
                        <div className="users-profile--right__data-container">
                            <div className="users-profile--right__philosophy-container">
                                {
                                    !!Object.keys(usersProfileData).length && usersProfileData.info.general.philosophy &&
                                    <>
                                        <h3><span>Philosophy:</span></h3>
                                        <p>{ usersProfileData.info.general.philosophy }</p>
                                    </>
                                }
                            </div>
                            <div className="users-profile--right__bio-container">
                                {
                                    !!Object.keys(usersProfileData).length && usersProfileData.info.general.bio &&
                                    <>
                                        <h3><span>Bio:</span></h3>
                                        <p>{ usersProfileData.info.general.bio }</p>
                                    </>
                                }
                            </div>
                        </div>
                        <div className="users-profile--right__social-container">
                            { !!Object.keys(usersProfileData).length && renderSocial() }
                        </div>
                    </div>
                </div>
                <div className="profile--verbal__right--two">
                    <div className="items--container">
                            <p><span>Name:</span> { !!Object.keys(usersProfileData).length && usersProfileData.info.general.name }</p>
                            <p><span>Total Score:</span> { !!Object.keys(usersProfileData).length && numberFormatter(usersProfileData.info.specific.whole.totalScore) }</p>
                            <p><span>Universal Rank:</span> { !!Object.keys(usersProfileData).length && numberFormatter(usersProfileData.info.specific.whole.rank) }</p>
                            <p><span>Level:</span> { !!Object.keys(usersProfileData).length && numberFormatter(usersProfileData.info.specific.whole.level.level) }</p>
                            <p><span>Training Score:</span> { !!Object.keys(usersProfileData).length && numberFormatter(usersProfileData.info.specific.whole.trainingScore) }</p>
                            <p><span>Member Since:</span> { !!Object.keys(usersProfileData).length && new Date(usersProfileData.info.general.memberSince).toDateString().split(' ').map((el, i) => i % 2 !== 0 ? el : ' ') }</p>
                            {/*<p><span>Group:</span> { !!Object.keys(usersProfileData).length && usersProfileData.info.specific.whole.group.name }</p>*/}
                            { !!Object.keys(usersProfileData).length && usersProfileData.info.general.age && <p><span>Age:</span> { usersProfileData.info.general.age }</p> }
                            { !!Object.keys(usersProfileData).length && typeof usersProfileData.friends !== 'string' && <p><span>Friends:</span> { numberFormatter(usersProfileData.friends.length) }</p> }
                            <p><span>Challenges:</span> { !!Object.keys(usersProfileData).length && numberFormatter(usersProfileData.info.specific.whole.games.total) }</p>
                            <p><span>Trainings:</span> { !!Object.keys(usersProfileData).length && numberFormatter(usersProfileData.info.specific.whole.trainings) }</p>
                            { !!Object.keys(usersProfileData).length && usersProfileData.info.general.job && <p><span>Job:</span> { usersProfileData.info.general.job }</p> }
                            { !!Object.keys(usersProfileData).length && usersProfileData.info.general.education && <p><span>Education:</span> { renderEducationText(usersProfileData.info.general.education) }</p> }
                            { !!Object.keys(usersProfileData).length && usersProfileData.info.general.location && <p><span>Country:</span> { textCutter(usersProfileData.info.general.location.country) }</p> }
                            { !!Object.keys(usersProfileData).length && !usersProfileData.redirect && renderActionButtons() }
                    </div>
                    <div className="profile--line-separator" />
                    <div className="users-profile--right__bottom-container">
                        <div className="users-profile--right__data-container">
                            <div className="users-profile--right__philosophy-container">
                                {
                                    !!Object.keys(usersProfileData).length && usersProfileData.info.general.philosophy &&
                                    <>
                                        <h3><span>Philosophy:</span></h3>
                                        <p>{ usersProfileData.info.general.philosophy }</p>
                                    </>
                                }
                            </div>
                            <div className="users-profile--right__bio-container">
                                {
                                    !!Object.keys(usersProfileData).length && usersProfileData.info.general.bio &&
                                    <>
                                        <h3><span>Bio:</span></h3>
                                        <p>{ usersProfileData.info.general.bio }</p>
                                    </>
                                }
                            </div>
                        </div>
                        <div className="users-profile--right__social-container">
                            { !!Object.keys(usersProfileData).length && renderSocial() }
                        </div>
                    </div>
                </div>
            </div>
            <div className="users-profile--visual-container">
                <h2 className="users-profile--h2">Statistics</h2>
                <div className="users-profile--visual__chart-group">
                    <div className="users-profile--visual__chart-container">
                        {
                            !!Object.keys(usersProfileData).length &&
                            (!usersProfileData.info.specific.detailed || !usersProfileData.info.specific.detailed.brain) &&
                            renderDisabledFeature()
                        }
                        <h3>Brain</h3>
                        <div ref={ canvas } className="users-profile--visual__first-radar" />
                    </div>
                    <div className="users-profile--visual__chart-container">
                        {
                            !!Object.keys(usersProfileData).length &&
                            (!usersProfileData.info.specific.detailed || !usersProfileData.info.specific.detailed.personality) &&
                            renderDisabledFeature()
                        }
                        <h3>Personality</h3>
                        <div ref={ canvas2 } className="users-profile--visual__second-radar" />
                    </div>
                    <div className="users-profile--visual__chart-container">
                        {
                            !!Object.keys(usersProfileData).length &&  !gamesData.data.reduce((acc, gData) => gData.orders + acc, 0) &&
                            <div className="no--games">
                                <p>{ usersProfileData.info.general.name.split(' ')[0] } has Completed no Challenges!</p>
                            </div>
                        }
                        <h3>Challenges</h3>
                        <div ref={ canvas3 } className="users-profile--visual__first-pie" />
                    </div>
                </div>
            </div>
            <div className="users-profile--friends-container">
                <h2 className="users-profile--h2">Friends</h2>
                <div className="users-profile--friends__body-container">
                    {
                        !!Object.keys(usersProfileData).length &&  !usersProfileData.friends.length && usersProfileData.friends !== 'Not Allowed' &&
                        <div className="no--friends">
                            <p>{ usersProfileData.info.general.name.split(' ')[0] } has no friends</p>
                        </div>
                    }
                    <ul className="users-profile--friends__items">
                        { !!Object.keys(usersProfileData).length && usersProfileData.friends === 'Not Allowed' && renderDisabledFeature() }
                        { !!Object.keys(usersProfileData).length && Array.isArray(usersProfileData.friends) && renderFriends() }
                    </ul>
                </div>
            </div>

        </div>
    );
};

function mapStateToProps(state) {
    return {
        usersProfileData: state.usersProfile
    };
}

export default requireAuth(connect(mapStateToProps, {
    usersProfileFetchData,
    usersProfileSendFriendRequest,
    usersProfileSendChallengeRequest,
    usersProfileSendLike,
    tempMessageSendData,
    usersProfileSendBlock,
    usersProfileSendReport,
    usersProfileWipeData
})(memo(UsersProfile)));