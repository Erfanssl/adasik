import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from "react-router-dom";
import './Nav.scss';
import { connect } from 'react-redux';
import {
    authSignOutSendData,
    authSignOutWipeData
} from "../../../../actions/authAction";
import { wipeIdentifier } from "../../../../actions/identifierAction";
import Logo from "../../utils/Logo/Logo";
import history from "../../../../history";

import dashboard from '../../../../assets/icons/home.svg';
import profile from '../../../../assets/icons/profile.svg';
import messenger from '../../../../assets/icons/messages.svg';
import training from '../../../../assets/icons/training.svg';
import challenges from '../../../../assets/icons/challenges.svg';
import group from '../../../../assets/icons/group.svg';
import friends from '../../../../assets/icons/friends.svg';
import statistics from '../../../../assets/icons/statistics.svg';
import signOut from '../../../../assets/icons/signout.svg';
import settings from '../../../../assets/icons/settings.svg';
import test from '../../../../assets/icons/test.svg';

const Nav = ({
                 popUpRes,
                 sockets,
                 setShowPopUp,
                 signOutData,
                 currentNotification,
                 notificationData,
                 authSignOutSendData,
                 authSignOutWipeData,
                 wipeIdentifier,
                 isOffline
}) => {
    const [signOutError, setSignOutError] = useState({ show: false });

    // refs
    const messengerNotification = useRef();
    const challengesNotification = useRef();
    const friendsNotification = useRef();

    useEffect(() => {
        function notificationActiveStyle(element) {
            element.style.opacity = '1';
            element.style.visibility = 'visible';
            element.classList.add('receive');
            currentNotification.current = '';

            setTimeout(() => {
                element.classList.remove('receive');
            }, 500);
        }

        function notificationInActiveStyle(element) {
            element.style.opacity = '0';
            element.style.visibility = 'hidden';
        }

        if (notificationData) {
            if (notificationData.newMessengerConversations > 0 && messengerNotification?.current) {
                if (currentNotification.current === 'initial' || currentNotification.current === 'messenger') notificationActiveStyle(messengerNotification.current);
            } else {
                notificationInActiveStyle(messengerNotification.current);
            }

            if ((notificationData.challengesShouldPlay + notificationData.challengeRequests) > 0 && challengesNotification?.current) {
                if (currentNotification.current === 'initial' || currentNotification.current === 'challenges') notificationActiveStyle(challengesNotification.current);
            } else {
                notificationInActiveStyle(challengesNotification.current);
            }

            if (notificationData.newFriendRequests > 0 && friendsNotification?.current) {
                if (currentNotification.current === 'initial' || currentNotification.current === 'friends') notificationActiveStyle(friendsNotification.current);
            } else {
                notificationInActiveStyle(friendsNotification.current);
            }
        }

    }, [notificationData]);

    useEffect(() => {
        if (signOutData && signOutData.Error) {
            setSignOutError({ show: true });

            setTimeout(() => {
                setSignOutError({ show: false });
            }, 3000);
        }

        if (signOutData  && signOutData.done) {
            authSignOutWipeData();
            wipeIdentifier();

            const { main, status, messenger } = sockets;

            if (main && main.connected) main.disconnect();
            if (status && status.connected) status.disconnect();
            if (messenger && messenger.connected) messenger.disconnect();
            const bypass = localStorage.getItem('bypass');
            if (bypass) localStorage.removeItem('bypass');

            history.push('/');
        }
    }, [signOutData]);

    useEffect(() => {
        if (popUpRes && popUpRes.res === 'accept') {
            authSignOutSendData();
        }
    }, [popUpRes]);

    function handleSignOutClick() {
        setShowPopUp({ show: true, type: 'sign-out' });
    }

    return (
        <div className="nav--container">
            <div className="nav--logo-container">
                {
                    isOffline && isOffline[0] ?
                        <div className="offline--logo">
                            <p>Offline</p>
                        </div>:
                        <Logo extraClass="inner--logo" />
                }
            </div>
            <div className="nav--separator-line" />
            <div className="nav--items-container">
                <ul>
                    <li className={ isOffline && isOffline[0] ? "nav--items__dashboard offline" : "nav--items__dashboard" }>
                        <NavLink to="/dashboard" activeClassName="nav--item__active-link">
                            <div className="nav--item__active-bg" />
                            <img src={ dashboard } alt="dashboard" />
                            <p>Dashboard</p>
                        </NavLink>
                    </li>
                    <li className={ isOffline && isOffline[0] ? "nav--items__profile offline" : "nav--items__profile" }>
                        <NavLink to="/profile" activeClassName="nav--item__active-link">
                            <div className="nav--item__active-bg" />
                            <img src={ profile } alt="profile" />
                            <p>Profile</p>
                        </NavLink>
                    </li>
                    <li className={ isOffline && isOffline[0] ? "nav--items__messenger offline" : "nav--items__messenger" }>
                        <NavLink to="/messenger" activeClassName="nav--item__active-link">
                            <div className="nav--item__active-bg" />
                            <div ref={ messengerNotification } className="notification">
                                <p>{ notificationData && !!notificationData.newMessengerConversations && notificationData.newMessengerConversations }</p>
                            </div>
                            <img src={ messenger } alt="messenger" />
                            <p>Messenger</p>
                        </NavLink>
                    </li>
                    <li className="nav--items__training">
                        <NavLink to="/training" activeClassName="nav--item__active-link">
                            <div className="nav--item__active-bg" />
                            <img src={ training } alt="training" />
                            <p>Training</p>
                        </NavLink>
                    </li>
                    <li className={ isOffline && isOffline[0] ? "nav--items__training offline" : "nav--items__training" }>
                        <NavLink to="/tests" activeClassName="nav--item__active-link">
                            <div className="nav--item__active-bg" />
                            <img src={ test } alt="training" />
                            <p>Tests</p>
                        </NavLink>
                    </li>
                    <li className={ isOffline && isOffline[0] ? "nav--items__challenges offline" : "nav--items__challenges" }>
                        <NavLink to="/challenges" activeClassName="nav--item__active-link">
                            <div className="nav--item__active-bg" />
                            <div ref={ challengesNotification } className="notification">
                                <p>{ notificationData && !!(notificationData.challengesShouldPlay || notificationData.challengeRequests) && (notificationData.challengesShouldPlay + notificationData.challengeRequests) }</p>
                            </div>
                            <img src={ challenges } alt="challenges" />
                            <p>Challenges</p>
                        </NavLink>
                    </li>
                    <li className={ isOffline && isOffline[0] ? "nav--items__group offline" : "nav--items__group" }>
                        <NavLink to="/group" activeClassName="nav--item__active-link">
                            <div className="nav--item__active-bg" />
                            <img src={ group } alt="group" />
                            <p>Group</p>
                        </NavLink>
                    </li>
                    <li className={ isOffline && isOffline[0] ? "nav--items__friends offline" : "nav--items__friends" }>
                        <NavLink to="/friends" activeClassName="nav--item__active-link">
                            <div className="nav--item__active-bg" />
                            <div ref={ friendsNotification } className="notification">
                                <p>{ notificationData && !!notificationData.newFriendRequests && notificationData.newFriendRequests }</p>
                            </div>
                            <img src={ friends } alt="friends" />
                            <p>Friends</p>
                        </NavLink>
                    </li>
                    <li className={ isOffline && isOffline[0] ? "nav--items__statistics offline" : "nav--items__statistics" }>
                        <NavLink to="/statistics" activeClassName="nav--item__active-link">
                            <div className="nav--item__active-bg" />
                            <img src={ statistics } alt="statistics" />
                            <p>Statistics</p>
                        </NavLink>
                    </li>
                    <li className={ isOffline && isOffline[0] ? "nav--items__settings offline" : "nav--items__settings" }>
                        <NavLink to="/settings" activeClassName="nav--item__active-link">
                            <NavLink to="/settings/profile">
                                <div className="nav--item__active-bg" />
                                <img src={ settings } alt="settings" />
                                <p>Settings</p>
                            </NavLink>
                        </NavLink>
                    </li>
                    <li className={ isOffline && isOffline[0] ? "nav--items__sign-out offline" : "nav--items__sign-out" } onClick={ handleSignOutClick }>
                        <div className="sign-out--container">
                            <div className="nav--item__active-bg" />
                            <img src={ signOut } alt="sign out" />
                            <p>Sign Out</p>
                        </div>
                        {
                            signOutError.show &&
                            <div className="sign-out--error">
                                Unable to Sign Out
                            </div>
                        }
                    </li>
                </ul>
            </div>
        </div>
    );
};

function mapStateToProps(state) {
    return {
        signOutData: state.auth.signOut,
        sockets: state.sockets
    };
}

export default connect(mapStateToProps, {
    authSignOutSendData,
    authSignOutWipeData,
    wipeIdentifier
})(Nav);
