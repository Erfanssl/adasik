import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import './Friends.scss';
import {
    fetchFriendsData,
    acceptFriendRequest,
    rejectFriendRequest,
    deleteFriend
} from "../../../../actions/friendAction";
import numberFormatter from "../../../../utility/numberFormatter";
import requireAuth from "../../../../middlewares/requireAuth";
import history from "../../../../history";
import pageViewSocketConnection from "../../../../utility/pageViewSocketConnection";
import Loading from "../../utils/Loading/Loading";
import textCutter from "../../../../utility/textCutter";
import likesFormatter from "../../../../utility/likesFormatter";
import Spinner from "../../utils/Spinner/Spinner";

import person from '../../../../assets/temp/male2.jpg';
import confirm from '../../../../assets/check.svg';
import reject from '../../../../assets/cross.svg';
import alone from '../../../../assets/alone.svg';
import emptyFolder from '../../../../assets/icons/empty.svg';

const Friends = ({
                     friendsData,
                     fetchFriendsData,
                     friendsReFetch,
                     acceptFriendRequest,
                     rejectFriendRequest,
                     deleteFriend
                 }) => {
    const [notification, setNotification] = useState({ type: '' });
    const [popUpConfig, setPopUpConfig] = useState({ show: false, type: '', payload: {} });
    const [input, setInput] = useState('');
    const [showRequestSpinner, setShowRequestSpinner] = useState(false);
    const [showDeleteSpinner, setShowDeleteSpinner] = useState(false);

    // refs
    const requestItem1 = useRef();
    const requestItem2 = useRef();
    const requestItem3 = useRef();
    const requestItem4 = useRef();
    const requestItem5 = useRef();
    const popUpCard = useRef();

    useEffect(() => {
        document.title = 'Adasik - Friends';
        fetchFriendsData();
        const pageViewSocket = pageViewSocketConnection();

        return () => {
            pageViewSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (friendsReFetch && friendsReFetch[0]) {
            fetchFriendsData();
        }
    }, [friendsReFetch]);

    useEffect(() => {
        if (popUpConfig.show) {
            if (popUpCard && popUpCard.current) {
                popUpCard.current.classList.add('active');
            }
        }

        if (!popUpConfig.show) {
            if (popUpCard && popUpCard.current) {
                popUpCard.current.classList.remove('active');
            }
        }
    }, [popUpConfig]);

    useEffect(() => {
        if (friendsData && (friendsData.requestAccepted)) {
            setShowRequestSpinner(false);
            fetchFriendsData();
            setNotification({ type: 'requestAccepted' });
            setTimeout(() => {
                setNotification({ type: '' });
            }, 1300);
        }

        if (friendsData && (friendsData.requestRejected)) {
            setShowRequestSpinner(false);
            fetchFriendsData();
            setNotification({ type: 'requestRejected' });
            setTimeout(() => {
                setNotification({ type: '' });
            }, 1300);
        }

        if (friendsData && (!friendsData.requestAccepted || !friendsData.requestRejected)) {
            const requestItemsObj = {
                requestItem1,
                requestItem2,
                requestItem3,
                requestItem4,
                requestItem5
            };

            for (let i = 1; i < 6; i++) {
                const el = requestItemsObj[`requestItem${ i }`];
                if (el && el.current) {
                    el.current.style.transform = 'translate(-50%, -50%)';
                }
            }
        }

        if (friendsData && friendsData.requestError) {
            setNotification({ type: 'requestError' });
            setTimeout(() => {
                setNotification({ type: '' });
            }, 1300);
        }

        if (friendsData && friendsData.friendDeleted) {
            fetchFriendsData();
            setNotification({ type: 'friendDeleted' });
            setShowDeleteSpinner(false);
            setTimeout(() => {
                setNotification({ type: '' });
            }, 1300);
        }

        if (friendsData && friendsData.friendError) {
            setNotification({ type: 'friendError' });
            setTimeout(() => {
                setNotification({ type: '' });
            }, 1300);
        }
    }, [friendsData]);

    const requestDropper = useCallback(function requestDropper(fn, id) {
        const requestItemsObj = {
            requestItem1,
            requestItem2,
            requestItem3,
            requestItem4,
            requestItem5
        };

        for (let i = 1; i < 6; i++) {
            const el = requestItemsObj[`requestItem${ i }`];
            if (el && el.current) {
                el.current.style.transition = 'all .4s';
                el.current.style.transform = 'translate(-50%, -42.5%)';
                if (i === 1) {
                    el.current.style.opacity = '0';
                    el.current.style.visibility = 'hidden';
                    el.current.style.transform = 'translate(-50%, 10%)';
                }
            }
        }

        setTimeout(() => {
            fn(id);
        }, 300);
    }, []);

    function renderFriendItem({ _id, status, avatar, username, fullName }) {
        function generateClassName(status) {
            let className = "friends--main__img-container";
            if (status === 'online') className += " friends--item__online";
            else className += " friends--item__offline";

            return className;
        }

        function handleFriendDeletion(id) {
            setPopUpConfig({ show: true, type: 'friend', payload: { id } });
        }

        function handleAvatarClick() {
            history.push(`/profile/${ username }`);
        }

        return (
            <li className="friends--main__item">
                <div className={ generateClassName(status.text) + " hover" }>
                    <img src={ avatar } alt={ fullName } />
                    <div className="hover--container">
                        <Link to={`/profile/${ username }`}>{ fullName }</Link>
                        <img onClick={ handleFriendDeletion.bind(null, _id) } src={ reject } alt="delete" />
                    </div>
                </div>
                <div className="friends--main__hover-none">
                    <div className="title--container">
                        <Link to={`/profile/${ username }`}>{ fullName }</Link>
                    </div>
                    <div className={ generateClassName(status.text) }>
                        <img onClick={ handleAvatarClick } className="image" src={ avatar } alt={ fullName } />
                    </div>
                    <div className="btn--container">
                        <img onClick={ handleFriendDeletion.bind(null, _id) } src={ reject } alt="delete" />
                    </div>
                </div>
            </li>
        );
    }

    function renderFriendsGroupSection() {
        if (!friendsData.friends.length) {
            return (
                <div className="friends--main__no-friends--container">
                    <div>
                        <p>It Seems you have no friends!</p>
                        <p>Start making some...</p>
                    </div>
                    <img src={ alone } alt="no-friends" />
                </div>
            );
        }

        const filteredFriendData = friendsData.friends.filter(
            friend =>
                friend.username.toLowerCase().includes(input.toLowerCase()) ||
                friend.fullName.toLowerCase().includes(input.toLowerCase())
        );

        return (
            <>
                {
                    showDeleteSpinner &&
                    <div className="spinner--container">
                        <Spinner />
                    </div>
                }
                <ul className="friends--main-group">
                    { notification && notification.type === 'friendError' && <p className="friends--friend__notification error">Operation Failed!</p> }
                    { notification && notification.type === 'friendDeleted' && <p className="friends--friend__notification successful">Successfully deleted from you friends!</p> }
                    {
                        filteredFriendData.map(friend => {
                            return renderFriendItem(friend)
                        })
                    }
                </ul>
            </>
        );
    }

    function renderFriendsSection() {
        function handleInputChange(e) {
            setInput(e.target.value);
        }

        return (
            <div className="friends--main-container">
                <div className="friends--ribbon-container">
                    <h2 className="friends--ribbon">
                        <p className="friends--ribbon-content">
                            You Have { friendsData.friends.length === 0 ? 'no' : friendsData.friends.length } Friend{ friendsData.friends.length >= 2 ? 's' : '' }
                        </p>
                    </h2>
                </div>
                {
                    !!friendsData.friends.length &&
                    <input
                        type="text"
                        className="friends--main__input"
                        placeholder="Search among your friends by their username or name"
                        value={ input }
                        onChange={ handleInputChange }
                    />
                }
                { renderFriendsGroupSection() }
            </div>
        );
    }

    function renderRequestItem() {
        function generateClassName(status) {
            let className = "friends--item__img-container";
            if (status.text === 'online') className += " friends--item__online";
            else className += " friends--item__offline";

            return className;
        }

        function handleRequestAccept(id) {
            requestDropper(acceptFriendRequest, id);
            setShowRequestSpinner(true);
        }

        function handleRequestReject(id) {
            setPopUpConfig({ show: true, type: 'request', payload: { id } });
        }

        return friendsData.pending.map(({ _id, avatar, username, fullName, status, whole: { games, level, rank, totalScore, trainingScore } }, i) => {
            const requestItemRefName = 'requestItem' + (i + 1);

            const requestItemsObj = {
                requestItem1,
                requestItem2,
                requestItem3,
                requestItem4,
                requestItem5
            };

            return (
                <li key={ _id } ref={ requestItemsObj[requestItemRefName] } className="friends--request-item">
                    <Link to={ `/profile/${ username }` } className={ generateClassName(status) }>
                        <img src={ avatar } alt="person" />
                    </Link>
                    <div className="friends--item__meta-data-container">
                        <div>
                            <Link to={ `/profile/${ username }` }>{ textCutter(fullName, 14) }</Link>
                            <p>{ numberFormatter(games.total) } Challenge{ games.total >= 2 ? 's' : '' }</p>
                        </div>
                        <div>
                            <p><span>Total Score:</span> { totalScore < 0 ? '-' + likesFormatter(totalScore.toString().substring(1)) : likesFormatter(totalScore) }</p>
                            <p><span>Training Score:</span> { trainingScore < 0 ? '-' + likesFormatter(trainingScore.toString().substring(1)) : likesFormatter(trainingScore) }</p>
                            <p><span>Rank:</span> { likesFormatter(rank) }</p>
                            <p><span>Level:</span> { numberFormatter(level.level) }</p>
                        </div>
                    </div>
                    <div className="friends--item__icon-container">
                        <img onClick={ handleRequestAccept.bind(null, _id) } src={ confirm } alt="confirm" />
                        <img onClick={ handleRequestReject.bind(null, _id) } src={ reject } alt="reject" />
                    </div>
                </li>
            );
        });
    }

    function renderRequestsGroupSection() {
        if (friendsData && !friendsData.pending.length) {
            return (
                <div className="friends--requests__no-request--container">
                    <p>You currently don't have any friend Requests</p>
                    <img src={ emptyFolder } alt="empty-folder" />
                </div>
            );
        }

        return (
            <ul className="friends--requests-group">
                { renderRequestItem() }
            </ul>
        );
    }

    function renderRequestsSection() {
        return (
            <div className="friends--requests-container">
                <h2 className="friends--ribbon">
                    <p className="friends--ribbon-content">{ friendsData.pending.length === 0 ? 'No' : friendsData.pending.length } Friend Request{ friendsData.pending.length >= 2 ? 's' : '' }</p>
                </h2>
                {
                    showRequestSpinner &&
                    <div className="spinner--container">
                        <Spinner />
                    </div>
                }
                { notification && notification.type === 'requestError' && <p className="friends--requests__notification error">Operation Failed!</p> }
                { notification && notification.type === 'requestAccepted' && <p className="friends--requests__notification successful">Successfully added to your friends!</p> }
                { notification && notification.type === 'requestRejected' && <p className="friends--requests__notification successful">Successfully rejected!</p> }
                { renderRequestsGroupSection() }
            </div>
        );
    }

    function renderPopUp() {
        function renderInsideCard() {
            if (popUpConfig.type === 'request') {
                function handleRequestYesBtn() {
                    requestDropper(rejectFriendRequest, popUpConfig.payload.id);
                    setPopUpConfig({ show: false, type: '', payload: {} });
                    setShowRequestSpinner(true);
                }

                function handleRequestNoBtn() {
                    setPopUpConfig({ show: false, type: '', payload: {} });
                }

                return (
                    <>
                        <p>Are you sure you want to reject this request?</p>
                        <div>
                            <button onClick={ handleRequestYesBtn } className="yes--btn">Yes</button>
                            <button onClick={ handleRequestNoBtn } className="no--btn">No</button>
                        </div>
                    </>
                );
            }

            if (popUpConfig.type === 'friend') {
                function handleFriendYesBtn() {
                    deleteFriend(popUpConfig.payload.id);
                    setPopUpConfig({ show: false, type: '', payload: {} });
                    setShowDeleteSpinner(true);
                }

                function handleFriendNoBtn() {
                    setPopUpConfig({ show: false, type: '', payload: {} });
                }

                return (
                    <>
                        <p>Are you sure you want to delete this person from your friends?</p>
                        <div>
                            <button onClick={ handleFriendYesBtn } className="yes--btn">Yes</button>
                            <button onClick={ handleFriendNoBtn } className="no--btn">No</button>
                        </div>
                    </>
                );
            }
        }

        return (
            <div className="friends--pop-up__container">
                <div ref={ popUpCard } className="card">
                    { renderInsideCard() }
                </div>
            </div>
        );
    }

    return (
        <div className="friends--container" style={ popUpConfig.show ? { height: '93vh', overflow: 'hidden' } : {} }>
            { (!friendsData || !friendsData.pending) && <Loading /> }
            { popUpConfig.show && renderPopUp() }
            { friendsData && friendsData.pending && renderRequestsSection() }
            { friendsData && friendsData.friends && renderFriendsSection() }
        </div>
    );
};

function mapStateToProps(state) {
    return {
        friendsData: state.friends
    };
}

export default requireAuth(connect(mapStateToProps, {
    fetchFriendsData,
    acceptFriendRequest,
    rejectFriendRequest,
    deleteFriend
})(Friends));
