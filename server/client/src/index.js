import "core-js/stable";
import "regenerator-runtime/runtime";
import './sass/main.scss';
import './sass/_variables.scss';
import React, { useEffect, useState, lazy, Suspense } from 'react';
import ReactDOM from 'react-dom';
import { Router, Route, Switch, Link, NavLink, Redirect } from "react-router-dom";
import { createStore, applyMiddleware, compose } from 'redux';
import { connect } from 'react-redux';
import { setStatus } from "./actions/profileAction";
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import reducers from './reducers';
import history from "./history";
import io from 'socket.io-client';
import { fetchMainSocket, fetchStatusSocket } from "./actions/socketsAction";
import { setIdentifier } from "./actions/identifierAction";
import Inner from "./components/layout/Inner/Inner";

const Main = lazy(() => import('./components/layout/Main/Main'));
const ChallengeGame = lazy(() => import('./components/layout/Inner/Challenges/ChallengeInside/ChallengeGame/ChallengeGame'));
const TrainingGame = lazy(() => import('./components/layout/Inner/Training/TrainingGame/TrainingGame'));
const MentalFlex = lazy(() => import('./components/game/MentalFlex/MentalFlex'));
const Anticipation = lazy(() => import('./components/game/Anticipation/Anticipation'));
const MemoryRacer = lazy(() => import('./components/game/MemoryRacer/MemoryRacer'));
const SignOut = lazy(() => import('./components/layout/Inner/SignOut/SignOut'));



/* TODO: TEMP */
// import './assets/mental-flex.svg';
// import './assets/anticipation.svg';
// import './assets/memory-racer.svg';
// import './assets/personality-general.svg';

import Loading from "./components/layout/utils/Loading/Loading";

const composeEnhancer = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;
const store = createStore(reducers, composeEnhancer(applyMiddleware(thunk)));

const App = ({ setStatus }) => {
    const [isOffline, setIsOffline] = useState([false]);

    useEffect(() => {
        const mainSocket = io.connect('http://127.0.0.1:4500',  {transports: ['websocket'], upgrade: false} );
        let OuterStatusSocket;


        mainSocket.on('connect', async () => {
            await store.dispatch(fetchMainSocket(mainSocket));

            fetch('/api/get').then(res => {
                return res.json();
            }).then(data => {
                mainSocket.emit('encryptedMessage', data);
                const statusSocket = io.connect('http://127.0.0.1:4500/status');
                OuterStatusSocket = statusSocket;
                store.dispatch(setIdentifier(data));


                statusSocket.on('connect', () => {
                    store.dispatch(fetchStatusSocket(statusSocket));
                });

                statusSocket.emit('data', data);

                statusSocket.on('userOnline', async username => {
                    try {
                        await store.dispatch(setStatus(username, 'online'));
                    } catch (err) {

                    }
                });

                statusSocket.on('userOffline', async username => {
                    try {
                        await store.dispatch(setStatus(username, 'offline'));
                    } catch (err) {

                    }
                });
            });
        });

        // handle offline events
        window.onoffline = () => {
            setIsOffline([true]);
        };

        window.ononline = () => {
            setIsOffline([false]);
        };

        if (!navigator.onLine) setIsOffline([true]);

        return () => {
            mainSocket.disconnect();
            if (OuterStatusSocket) OuterStatusSocket.disconnect();
        };
    }, []);

    return (
        <div>
            <Switch>
                <Route path="/inner" exact render={ props => <Inner { ...props } /> } />
                <Route path="/dashboard" exact render={ (props) => <Inner { ...props } type="dashboard" isOffline={ isOffline } /> } />
                <Route path="/profile/:username" exact render={ (props) => <Inner { ...props } type="usersProfile" isOffline={ isOffline } /> } />
                <Route path="/profile" exact render={ (props) => <Inner { ...props } type="profile" isOffline={ isOffline } /> } />
                <Route path="/messenger" exact render={ (props) => <Inner { ...props } type="messenger" isOffline={ isOffline } /> } />
                <Route path="/training/:trainingName" exact render={ (props) => <Suspense fallback={ <Loading /> }><TrainingGame { ...props } /></Suspense> } />
                <Route path="/training" exact render={ (props) => <Inner { ...props } type="training" isOffline={ isOffline } /> } />
                <Route path="/tests/:testName" exact render={ (props) => <Inner { ...props } type="testInside" isOffline={ isOffline } /> } />
                <Route path="/tests" exact render={ (props) => <Inner { ...props } type="tests" /> } />
                <Route path="/challenges/:challengeId/:gameId" exact render={ (props) => <Suspense fallback={ <Loading /> }><ChallengeGame { ...props } isOffline={ isOffline } /></Suspense> } />
                <Route path="/challenges/:id" exact render={ (props) => <Inner { ...props } type="challengeInside" isOffline={ isOffline } /> } />
                <Route path="/challenges" exact render={ (props) => <Inner { ...props } type="challenges" isOffline={ isOffline } /> } />
                <Route path="/group" exact render={ (props) => <Inner { ...props } type="group" isOffline={ isOffline } /> } />
                <Route path="/friends" exact render={ (props) => <Inner { ...props } type="friends" isOffline={ isOffline } /> } />
                <Route path="/statistics" exact render={ (props) => <Inner { ...props } type="statistics" isOffline={ isOffline } /> } />
                <Route path="/settings/profile" exact render={ (props) => <Inner { ...props } type="settings/profile" isOffline={ isOffline } /> } />
                <Route path="/settings/messenger" exact render={ (props) => <Inner { ...props } type="settings/messenger" isOffline={ isOffline } /> } />
                <Route path="/settings/privacy" exact render={ (props) => <Inner { ...props } type="settings/privacy" isOffline={ isOffline } /> } />
                <Route path="/settings/other" exact render={ (props) => <Inner { ...props } type="settings/other" isOffline={ isOffline } /> } />
                <Route path="/settings" exact>
                    <Redirect to="/settings/profile" />
                </Route>
                <Route path="/sign-in" exact render={ (props) => <Suspense fallback={ <Loading /> }><Main { ...props } signIn={ true } /></Suspense> } />
                <Route path="/sign-up" exact render={ (props) => <Suspense fallback={ <Loading /> }><Main { ...props } signUp={ true } /></Suspense> } />
                <Route path="/sign-out" exact render={ props => <Suspense fallback={ <Loading /> }><SignOut { ...props } /></Suspense> } />
                <Route path="/mental" exact render={ props => <Suspense fallback={ <Loading /> }><MentalFlex { ...props } /></Suspense> } />
                <Route path="/ant" exact render={ props => <Suspense fallback={ <Loading /> }><Anticipation { ...props } /></Suspense> } />
                <Route path="/memory" exact render={ props => <Suspense fallback={ <Loading /> }><MemoryRacer { ...props } /></Suspense> } />
                <Route path="/" exact render={ (props) => <Suspense fallback={ <Loading /> }><Main { ...props } /></Suspense> } />
                {/*<Route path="/" exact render={ (props) => <Main { ...props } /> } />*/}
                <Route>
                    <h2>NOT FOUND</h2>
                </Route>
            </Switch>
        </div>
    );
};

const NewApp = connect(null, { setStatus })(App);

ReactDOM.render(
    <Provider store={ store }>
        <Router history={ history }>
            <NewApp />
        </Router>
    </Provider>
    , document.getElementById('root'));

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
        .then()
        .catch();
}