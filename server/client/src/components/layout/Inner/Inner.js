import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import './Inner.scss';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import Connections from "../utils/Connections/Connections";
import Loading from "../utils/Loading/Loading";

import {
    fetchAppNotification,
    receiveNotificationChallengesRequest,
    receiveNotificationChallengesTurn,
    receiveNotificationFriends,
    receiveNotificationMessenger
} from "../../../actions/innerAction";

const Nav = lazy(() => import('./Nav/Nav'));
const Dashboard = lazy(() => import('./Dashboard/Dashboard'));
const Messenger = lazy(() => import('./Messenger/Messenger'));
const Profile = lazy(() => import('./Profile/Profile'));
const UsersProfile = lazy(() => import('./Profile/UsersProfile/UsersProfile'));
const Training = lazy(() => import('./Training/Training'));
const Challenges = lazy(() => import('./Challenges/Challenges'));
const Group = lazy(() => import('./Group/Group'));
const Friends = lazy(() => import('./Friends/Friends'));
const Statistics = lazy(() => import('./Statistics/Statistics'));
const ChallengeInside = lazy(() => import('./Challenges/ChallengeInside/ChallengeInside'));
const Settings = lazy(() => import('./Settings/Settings'));
const Tests = lazy(() => import('./Tests/Tests'));
const TestInside = lazy(() => import('./Tests/TestInside/TestInside'));

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { error: null };
    }

    static getDerivedStateFromError(err) {
        if (err) {
            return { error: err };
        }
    }

    render() {
        return this.props.children;
    }
}

const Inner = ({
                   statusSocket,
                   appNotificationData,
                   isOffline,
                   identifier,
                   fetchAppNotification,
                   receiveNotificationChallengesRequest,
                   receiveNotificationChallengesTurn,
                   receiveNotificationFriends,
                   receiveNotificationMessenger,
                   ...props
}) => {
    const [showPopUP, setShowPopUp] = useState({ show: false, type: '' });
    const [popUpRes, setPopUpRes] = useState({ res: '' });
    const [dashboardReFetch, setDashboardReFetch] = useState([false]);
    const [challengesReFetch, setChallengesReFetch] = useState([false]);
    const [challengeInsideReFetch, setChallengeInsideReFetch] = useState([false]);
    const [friendsReFetch, setFriendsReFetch] = useState([false]);

    // refs
    const inner = useRef();
    const cardEl = useRef();

    const messageSendersList = useRef([]);
    const friendSendersList = useRef([]);
    const challengeSendersList = useRef([]);
    const currentNotification = useRef('initial');

    useEffect(() => {
        fetchAppNotification();
    },[]);

    useEffect(() => {
        if (statusSocket) {
            statusSocket.on('new-message', ({ id }) => {
                setTimeout(() => {
                    setDashboardReFetch([true]);
                    currentNotification.current = 'messenger';

                    if (!messageSendersList.current.includes(id)) {
                        messageSendersList.current.push(id);
                        receiveNotificationMessenger();
                    }
                }, 400);
            });

            statusSocket.on('friend-request', ({ id }) => {
                setTimeout(() => {
                    setDashboardReFetch([true]);
                    currentNotification.current = 'friends';

                    if (!friendSendersList.current.includes(id)) {
                        friendSendersList.current.push(id);
                        receiveNotificationFriends();
                    }

                    if (props.match.path === '/friends') {
                        setFriendsReFetch([true]);
                    }
                }, 700);
            });

            statusSocket.on('challenge-request', ({ id }) => {
                setTimeout(() => {
                    setDashboardReFetch([true]);
                    currentNotification.current = 'challenges';

                    if (!challengeSendersList.current.includes(id)) {
                        challengeSendersList.current.push(id);
                        receiveNotificationChallengesRequest();
                    }

                    if (props.match.path === '/challenges') {
                        setChallengesReFetch([true]);
                    }
                }, 900);
            });

            statusSocket.on('challenge-turn', () => {
                setTimeout(() => {
                    receiveNotificationChallengesTurn();
                    currentNotification.current = 'challenges';

                    setDashboardReFetch([true]);

                    if (props.match.path === '/challenges') {
                        setChallengesReFetch([true]);
                    }

                    if (props.match.path.split('/').length === 3) {
                        setChallengeInsideReFetch([true]);
                    }
                }, 900);
            });
        }
    }, [statusSocket]);

    useEffect(() => {
        if (cardEl && cardEl.current) {
            cardEl.current.classList.add('active');
        }

        return () => {
            if (cardEl && cardEl.current) {
                cardEl.current.classList.remove('active');
            }
        };
    }, [showPopUP]);

    function renderComponent() {
        if (props.type === 'training') {
            return (
                <Suspense fallback={ <Loading /> }>
                    <Training { ...props } />
                </Suspense>
            );
        }

        if (isOffline && isOffline[0]) return (
            <div className="inner--offline__container">
                <div className="pulse--container">
                    <p>You are Offline</p>
                    <p>You can still play Training games</p>
                    <Link to="/training">Go to Training</Link>
                    <p>Or you can wait until you get back Online</p>
                </div>
            </div>
        );

        switch (props.type) {
            case 'dashboard':
                return (
                    <Suspense fallback={ <Loading /> }>
                        <Dashboard { ...props } dashboardReFetch={ dashboardReFetch } />
                    </Suspense>
                );
            case 'profile':
                return (
                    <Suspense fallback={ <Loading /> }>
                        <Profile { ...props } />
                    </Suspense>
                );
            case 'usersProfile':
                return (
                    <Suspense fallback={ <Loading /> }>
                        <UsersProfile { ...props } />
                    </Suspense>
                );
            case 'messenger':
                return (
                    <Suspense fallback={ <Loading /> }>
                        <ErrorBoundary>
                            <Messenger { ...props } />
                        </ErrorBoundary>
                    </Suspense>
                );
            case 'training':
                return (
                    <Suspense fallback={ <Loading /> }>
                        <Training { ...props } />
                    </Suspense>
                );
            case 'tests':
                return (
                    <Suspense fallback={ <Loading /> }>
                        <Tests { ...props } />
                    </Suspense>
                );
            case 'testInside':
                return (
                    <Suspense fallback={ <Loading /> }>
                        <TestInside { ...props } />
                    </Suspense>
                );
            case 'challenges':
                return (
                    <Suspense fallback={ <Loading /> }>
                        <Challenges { ...props } challengesReFetch={ challengesReFetch } />
                    </Suspense>
                );
            case 'group':
                return (
                    <Suspense fallback={ <Loading /> }>
                        <Group { ...props } />
                    </Suspense>
                );
            case 'friends':
                return (
                    <Suspense fallback={ <Loading /> }>
                        <Friends { ...props } friendsReFetch={ friendsReFetch } />
                    </Suspense>
                );
            case 'statistics':
                return (
                    <Suspense fallback={ <Loading /> }>
                        <Statistics { ...props } />
                    </Suspense>
                );
            case 'challengeInside':
                return (
                    <Suspense fallback={ <Loading /> }>
                        <ChallengeInside { ...props } challengeInsideReFetch={ challengeInsideReFetch } isOffline={ isOffline } />
                    </Suspense>
                );
            case 'settings':
                return (
                    <Suspense fallback={ <Loading /> }>
                        <Settings { ...props } />
                    </Suspense>
                );
            case 'settings/profile':
                return (
                    <Suspense fallback={ <Loading /> }>
                        <Settings { ...props } type="profile" />
                    </Suspense>
                );
            case 'settings/messenger':
                return (
                    <Suspense fallback={ <Loading /> }>
                        <Settings { ...props } type="messenger" />
                    </Suspense>
                );
            case 'settings/privacy':
                return (
                    <Suspense fallback={ <Loading /> }>
                        <Settings { ...props } type="privacy" />
                    </Suspense>
                );
            case 'settings/other':
                return (
                    <Suspense fallback={ <Loading /> }>
                        <Settings { ...props } type="other" />
                    </Suspense>
                );
            default:
                return (
                    <Suspense fallback={ <Loading /> }>
                        <Dashboard { ...props } />
                    </Suspense>
                );
        }
    }

    function handleNoBtnClick() {
        setShowPopUp({ show: false, type: '' });
    }

    function handleYesBtnClick() {
        setPopUpRes({ res: 'accept' });
        setShowPopUp({ show: false, type: '' });
    }

    return (
        <div className="inner">
            <div ref={ inner } className="inner--bg__connection">
                <Connections
                    cont={ inner }
                />
            </div>
            <div className="inner--container">
                {
                    identifier && identifier.text &&
                    <div className="inner--left-container">
                        <Suspense fallback={ <Loading /> }>
                            <Nav
                                setShowPopUp={ setShowPopUp }
                                popUpRes={ popUpRes }
                                notificationData={ appNotificationData }
                                isOffline={ isOffline }
                                currentNotification={ currentNotification }
                            />
                        </Suspense>
                    </div>
                }
                {
                    showPopUP.show && showPopUP.type === 'sign-out' &&
                    <div className="inner--pop-up__container">
                        <div ref={ cardEl } className="inner--pop-up__card-container">
                            <p>Are you sure you want to Sign out?</p>
                            <div className="btn--collection">
                                <button onClick={ handleYesBtnClick } className="yes--btn">Yes</button>
                                <button onClick={ handleNoBtnClick } className="no--btn">No</button>
                            </div>
                        </div>
                    </div>
                }
                <div className="inner--right-container">
                    { renderComponent() }
                </div>
            </div>
        </div>
    );
};

function mapStateToProps(state) {
    return {
        appNotificationData: state.appNotification,
        statusSocket: state.sockets.status,
        identifier: state.identifier
    };
}

export default connect(mapStateToProps, {
    fetchAppNotification,
    receiveNotificationChallengesRequest,
    receiveNotificationChallengesTurn,
    receiveNotificationFriends,
    receiveNotificationMessenger
})(React.memo(Inner));
