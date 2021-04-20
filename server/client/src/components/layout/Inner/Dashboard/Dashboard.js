import React, { useState, useEffect } from 'react';
import './Dashboard.scss';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
// action
import { fetchDashboard, dashboardSendTools } from "../../../../actions/dashboardAction";
// utility functions
import { urlBase64ToUint8Array } from "../../../../pwa/utility";
import numberFormatter from "../../../../utility/numberFormatter";
import partOfDay from "../../../../utility/partOfDay";
import requireAuth from "../../../../middlewares/requireAuth";
import pageViewSocketConnection from "../../../../utility/pageViewSocketConnection";
import Button from "../../utils/Button/Button";
import BoxOne from "./BoxOne/BoxOne";
import BoxTwo from "./BoxTwo/BoxTwo";
import BoxThree from "./BoxThree/BoxThree";
import BoxFour from "./BoxFour/BoxFour";

// icons
import check from '../../../../assets/icons/check.svg';
import empty from '../../../../assets/icons/empty.svg'


const Dashboard = ({ fetchDashboard, dashboardData, statusSocket, dashboardSendTools, dashboardReFetch }) => {
    const [prompt, setPrompt] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);

    useEffect(() => {
        fetchDashboard();
        document.title = 'Adasik - Dashboard';

        const pageViewSocket = pageViewSocketConnection();

        // listener to status socket for new messenger data
        statusSocket?.on('messageReceive', ({ fullName, fromUsername, message }) => {

            // we send back the status to the socket server then to the other user
            statusSocket.emit('messageReceiveStatus', {
                fromUsername,
                message,
                status: 'delivered'
            });
        });

        return () => {
            pageViewSocket.disconnect();
        };

    }, []);

    useEffect(() => {
        if (dashboardData && Object.keys(dashboardData).length && dashboardData.assignments && !Array.isArray(dashboardData.assignments)) setDataLoaded(true);
    }, [dashboardData]);

    useEffect(() => {
        if (dashboardReFetch && dashboardReFetch[0]) {
            fetchDashboard();
        }
    }, [dashboardReFetch]);

    window.addEventListener('beforeinstallprompt', event => {
        event.preventDefault();
        setPrompt(event);

        return false;
    });

    function handleInstallBtn() {
        if (prompt) {
            prompt.prompt();

            prompt.userChoice.then(choiceResult => {
                if (choiceResult.outcome === 'accepted') {
                    dashboardSendTools('install');
                }

                if (choiceResult.outcome === 'dismissed') {

                }
            });
        }
    }

    function handleNotificationBtn() {
        Notification.requestPermission()
            .then(choice => {
                if (choice === 'granted') {
                    dashboardSendTools('notification');
                }

                if (choice !== 'granted') {
                    return alert('You will not receive any notification. If you want, Enable it.');
                }

                if ('serviceWorker' in navigator) {
                    let sw;
                    navigator.serviceWorker.ready
                        .then(swReg => {
                            sw = swReg;
                            return sw.pushManager.getSubscription();
                        })
                        .then(sub => {
                            if (sub === null) {
                                const vapidPublicKey = 'BDh5U8KiKCsjoD5HvlUgLkD6L6YfWwK0RO6Xa-xL1rr0gIHPbhngE4wLECpfh5obf4yU2R0WLXweJqrNkiWFzy4';
                                const transformedVapid = urlBase64ToUint8Array(vapidPublicKey);
                                return sw.pushManager.subscribe({
                                    userVisibleOnly: true,
                                    applicationServerKey: transformedVapid
                                });
                            } else {

                            }
                        })
                        .then(newSub => {
                            return fetch('/nnn-notification/create-subscription', {
                                method: 'POST',
                                mode: 'cors',
                                body: JSON.stringify({ newSub, userId: dashboardData.userInfo._id })
                            })
                        })
                        .then(res => {
                            // if (res.ok)
                        })
                        .catch();
                }
            })
            .catch();
    }

    function renderWhatsNewBody() {
        const inside = [];
        const { newFriendRequests, challengeRequests, challengesShouldPlay, newMessengerConversations } = dashboardData.whatsNewData;

        if (!newFriendRequests && !challengeRequests && !challengesShouldPlay && !newMessengerConversations) {
            return (
                <div className="nothing--new">
                    <p>Nothing New</p>
                    <img src={ empty } alt="empty" />
                </div>
            );
        }

        if (newFriendRequests) {
            inside.push(
                <div>
                    <p>You have { newFriendRequests } friend request{ newFriendRequests > 1 ? 's' : '' } </p>
                    <Link to="/friends">Go to Friends -></Link>
                </div>
            );
        }

        if (challengeRequests) {
            inside.push(
                <div>
                    <p>You have { challengeRequests } challenge request{ challengeRequests > 1 ? 's' : '' }</p>
                    <Link to="/challenges">Go to Challenges -></Link>
                </div>
            );
        }

        if (challengesShouldPlay) {
            inside.push(
                <div>
                    <p>You have { challengesShouldPlay } challenge{ challengesShouldPlay > 1 ? 's' : '' } to play</p>
                    <Link to="/challenges">Go to Challenges -></Link>
                </div>
            );
        }

        if (newMessengerConversations) {
            inside.push(
                <div>
                    <p>You have { newMessengerConversations } conversation{ newMessengerConversations > 1 ? 's' : '' } to see</p>
                    <Link to="/messenger">Go to Messenger -></Link>
                </div>
            );
        }

        return (
            <>
                { inside }
            </>
        );
    }

    function renderTraining() {
        function createClassName() {
            let className = "dashboard--plan__training-container";
            if (dashboardData.assignments.training && dashboardData.assignments.training.length && dashboardData.assignments.training.every(item => item.completed)) className += " done";

            return className;
        }

        function renderTrainingItems() {
            return dashboardData.assignments.training.map(training => {
                return (
                    <Link key={ training.link } to={ `/training${ training.link }` } className={ training.completed ? "done" : "" }>
                        <img src={ training.icon } alt={ training.link.substring(1) } />
                        <img className="done" src={ check } alt="check" />
                    </Link>
                );
            });
        }

        return (
            <div className={ createClassName() }>
                <h3>Training</h3>
                <p className="description">Play These Games</p>
                <div className="items--container">
                    { renderTrainingItems() }
                </div>
                <p className="done--text">Done!</p>
            </div>
        );
    }

    function renderChallenge() {
        function createClassName() {
            let className = "dashboard--plan__challenge-container";
            if (dashboardData.assignments.challenge.every(item => item.completed)) className += " done";

            return className;
        }

        function renderChallengeItems() {
            return dashboardData.assignments.challenge.map((challenge, i) => {
                function createClassName() {
                    if (challenge.completed) return "done";
                    if (challenge.started) return "start";
                    return "";
                }

                return (
                    <div key={ challenge.link } className={ createClassName() }>
                        <p>{ i + 1 }</p>
                        <img className="done" src={ check } alt="check" />
                    </div>
                );
            });
        }

        return (
            <div className={  createClassName() }>
                <h3>Challenge</h3>
                <p className="description">Start and Finish 3 Challenges</p>
                <div className="items--container">
                    { renderChallengeItems() }
                </div>
                <p className="done--text">Done!</p>
            </div>
        );
    }

    function renderTest() {
        function createClassName() {
            let className = "dashboard--plan__test-container";
            if (dashboardData.assignments.test && dashboardData.assignments.test.length && dashboardData.assignments.test.every(item => item.completed)) className += " done";

            return className;
        }

        function renderTestItems() {
            return dashboardData.assignments.test.map(test => {
                return (
                    <Link key={ test.link } to={ `/tests${ test.link }` } className={ test.completed ? "done" : "" }>
                        <img src={ test.icon } alt={ test.link.substring(1) } />
                        <img className="done" src={ check } alt="check" />
                    </Link>
                );
            });
        }

        if (!dashboardData.assignments.test.length) {
            return (
                <div className={ createClassName() }>
                    <h3>Test</h3>
                    <p className="no--test">No Test For Today</p>
                </div>
            );
        }

        return (
            <div className={ createClassName() }>
                <h3>Test</h3>
                <p className="description">Take { dashboardData.assignments.test.length > 1 ? 'These' : 'This' } Test</p>
                <div className="items--container">
                    { renderTestItems() }
                </div>
                <p className="done--text">Done!</p>
            </div>
        );
    }

    return (
        <div className="dashboard--container">
            <div className="dashboard--greeting">
                {
                    !dataLoaded ?
                        <p>Updating Data...</p> :
                        <p>Good { partOfDay(new Date().getHours()) } <span className="dashboard--username">{ dashboardData.userInfo?.fullName.split(' ')[0] }</span></p>
                }
            </div>
            <div className="dashboard--box-container">
                <div className="box--bucket">
                    { dataLoaded && <BoxOne score={ dashboardData.userInfo.whole.totalScore } /> }
                    { dataLoaded && <BoxTwo score={ dashboardData.userInfo.whole.trainingScore } /> }
                </div>
                <div className="box--bucket">
                    { dataLoaded && <BoxThree score={ dashboardData.userInfo.whole.rank } /> }
                    {
                        dataLoaded &&
                        <BoxFour
                            progress={ dashboardData.userInfo.whole.level.progress }
                            destination={ dashboardData.userInfo.whole.level.destination }
                            level={ dashboardData.userInfo.whole.level.level }
                        />
                    }
                </div>
            </div>
            <div className="dashboard--middle-container">
                <div className="dashboard--whats-new-container">
                    <div className="dashboard--whats-new__header-container">
                        <div className="dashboard--live-icon" />
                        <h2>What's New?</h2>
                    </div>
                    <div className="dashboard--whats-new__body-container">
                        { dataLoaded && renderWhatsNewBody() }
                    </div>
                </div>
            </div>
            <div className="dashboard--plan-container">
                <div className="dashboard--plan__header-container">
                    <h2>Daily Assignment</h2>
                </div>
                <div className="dashboard--plan__body-container">
                    <div className="box--bucket">
                        { dataLoaded && renderTraining() }
                        { dataLoaded && renderChallenge() }
                    </div>
                   <div className="box--bucket">
                       { dataLoaded && renderTest() }
                       <div className="dashboard--plan__group-container">
                           <h3>Group</h3>
                           <p>Coming Soon...</p>
                       </div>
                   </div>
                </div>
            </div>
            {
                dataLoaded && (!dashboardData.userInfo.install || !dashboardData.userInfo.notification) &&
                <div className="dashboard--tools-container">
                    <div className="header--container">
                        <h2>Experience Adasik Better</h2>
                        <p>In order to use all of Adasik's features, we recommend you to do following{ (!dashboardData.userInfo.notification && !dashboardData.userInfo.notification) ? 's' : '' }:</p>
                    </div>
                    {
                        !dashboardData.userInfo.install &&
                        <div className="feature--one">
                            <h2>Install Adasik</h2>
                            <p className="info">You can Install Adasik on your Computer or Phone. It's an in-browser installation; so, you're not actually installing it as a separate app.</p>
                            <Button
                                onClick={ handleInstallBtn }
                                text="Install Adasik"
                                form={ true }
                            />
                        </div>
                    }
                    {
                        !dashboardData.userInfo.notification &&
                        <div className="feature--two">
                            <h2>Enable Notification</h2>
                            <p className="info">You can also Enable the notification to be aware whenever a you have a new message, challenge's request, friend request or if it's your turn to play in a challenge.</p>
                            <p className="info">You can disable it in your settings, privacy section.</p>
                            <Button
                                onClick={ handleNotificationBtn }
                                text="Enable Notification"
                                form={ true }
                            />
                        </div>
                    }
                </div>
            }
        </div>
    );
};

function mapStateToProps(state) {
    return {
        dashboardData: state.dashboard,
        statusSocket: state.sockets.status
    };
}

export default requireAuth(
    connect(mapStateToProps, { fetchDashboard, dashboardSendTools })(Dashboard)
)