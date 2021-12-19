import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import './ChallengeGame.scss';
import {
    cancelGameRedirect,
    fetchGame,
    fetchGameAnalysis,
    wipeGameAnalysis,
    wipeGameData
} from "../../../../../../actions/challengeAction";
import io from 'socket.io-client';
import createMultiLineChart from "../../../Statistics/createMultiLineChart";
import Button from "../../../../utils/Button/Button";
import numberFormatter from "../../../../../../utility/numberFormatter";
import requireAuth from "../../../../../../middlewares/requireAuth";
import NotFound from "../../../../utils/NotFound/NotFound";
import Loading from "../../../../utils/Loading/Loading";
import Spinner from "../../../../utils/Spinner/Spinner";
import pageViewSocketConnection from "../../../../../../utility/pageViewSocketConnection";
import { Link } from "react-router-dom";

// Comp { match.params.challengeId } and { match.params.gameId }

const ChallengeGame = ({
                           match,
                           gameData,
                           isOffline,
                           cancelGameRedirect,
                           fetchGame,
                           fetchGameAnalysis,
                           wipeGameAnalysis,
                           wipeGameData
                       }) => {
    const [gameComponent, setGameComponent] = useState({ c: undefined });
    const [shouldStart, setShouldStart] = useState(false);
    // const [timer, setTimer] = useState(90);
    const [result, setResult] = useState('');
    const [socket, setSocket] = useState(null);
    const [dataFromSocket, setDataFromSocket] = useState({});
    const [notAllowed, setNotAllowed] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const [gameAnalysisData, setGameAnalysisData] = useState({ completed: false, showLoading: false });
    const [gameName, setGameName] = useState(null);
    const [renderTimes, setRenderTimes] = useState(0);
    const [finish, setFinish] = useState(null);

    // ref
    const chart = useRef();
    const preGameLeftContainer = useRef();
    const preGameRightContainer = useRef();
    const preGameContainer = useRef();
    const lineOne = useRef();
    const lineTwo = useRef();

    useEffect(() => {
        fetchGame(match.params.challengeId, match.params.gameId);
        cancelGameRedirect();
        const pageViewSocket = pageViewSocketConnection();

        return () => {
            wipeGameAnalysis();
            wipeGameData();
            pageViewSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        preGameContainer?.current?.focus();
    }, [preGameContainer.current]);

    useEffect(() => {
        if (isOffline && isOffline[0]) {
            setRenderTimes(1);
        }

        if (isOffline && !isOffline[0]) {
            if (renderTimes >= 1) location.reload();
        }
    }, [isOffline, renderTimes]);

    useEffect(() => {
        if (gameAnalysisData && !gameAnalysisData.completed && gameAnalysisData.url && gameAnalysisData.scoreArrLast30) {
            setGameAnalysisData(a => ({ ...a, completed: true, showLoading: false }));
        }

        if (gameAnalysisData && !gameAnalysisData.completed && !gameAnalysisData.showLoading && !gameAnalysisData.completed && gameAnalysisData.url) {
            // means game is finished
            setGameAnalysisData(a => ({ ...a, showLoading: true }));
        }

        if (gameAnalysisData && gameAnalysisData.completed) {
            if (chart?.current) {
                let scoreArr;
                if (window.innerWidth > 600) scoreArr = [ ...gameAnalysisData.scoreArrLast30 ].reverse().map((scoreObj, i) => ({ date: i + 1, value: scoreObj.score }));
                else scoreArr = [ ...gameAnalysisData.scoreArrLast30.slice(-10) ].reverse().map((scoreObj, i) => ({ date: i + 1, value: scoreObj.score }));
                createMultiLineChart(scoreArr, chart.current);
            }
        }
    }, [gameAnalysisData]);

    useEffect(() => {
        if (shouldStart) {
            const gameSocket = io.connect('/game');

            setSocket(gameSocket);

            gameSocket.emit('gameInfo', { challengeId: match.params.challengeId, gameId: match.params.gameId, username: gameData.username, gameName });

            gameSocket.on('initialInfo', info => {
                setDataFromSocket(info);
            });

            gameSocket.on('not-allowed', () => {
                setNotAllowed(true);
            });

            gameSocket.once('gameAnalysis', (data) => {
                setGameAnalysisData(a => ({ ...a, ...data }));
                fetchGameAnalysis(match.params.gameId, data.toUsername);
            });
        }
    }, [shouldStart]);

    useEffect(() => {
        if (preGameLeftContainer && preGameLeftContainer.current) {
            setTimeout(() => {
                preGameLeftContainer.current.classList.remove('hide');
            }, 100);

            if (lineOne && lineOne.current) {
                setTimeout(() => {
                    lineOne.current.classList.remove('hide');
                }, 100);
            }
        }

        if (preGameRightContainer && preGameRightContainer.current) {
            setTimeout(() => {
                preGameRightContainer.current.classList.remove('hide');
            }, 100);
        }

        if (lineTwo && lineTwo.current) {
            setTimeout(() => {
                lineTwo.current.classList.remove('hide');
            }, 100);
        }
    }, [preGameLeftContainer.current])

    useEffect(() => {
        if (socket) socket.emit('result', result.res);
    }, [result]);


    useEffect(() => {
        if (gameData && gameData.name && !gameData.Error) {
            const name = gameData.name.split(' ').join('');
            import(`../../../../../game/${ name }/${ name }`).then(d => {
                setGameComponent({ c: d.default });
            });
        }

        if (gameData && gameData.Error) {
            setNotFound(true);
        }

        if (gameData && gameData.analysis) {
            if (gameData.analysis.Error) {
                return setGameAnalysisData({ Error: true, showLoading: false });
            }

            setGameAnalysisData(a => ({ ...a, scoreArrLast30: gameData.analysis.last30Attempts, scoreArrTop5: gameData.analysis.top5 }));
        }
    }, [gameData]);

    function renderInnerChallengeGame() {
        function renderError(text) {
            return (
                <div className="challenge-game--not-allowed__container">
                    <div className="not-allowed--inner-container">
                        <div className="bg"/>
                        <p>{ text }</p>
                    </div>
                </div>
            );
        }

        if (notFound) return renderError('Game Not Found');

        if (notAllowed) return renderError('There is another open tab playing this game. Please close that and try again.');

        if (gameData.finish) return renderError('This Game has Expired');

        const GameComponentLoaded = gameComponent.c;

        if (GameComponentLoaded) {
            return (
                <GameComponentLoaded
                    shouldStart={ shouldStart }
                    finish={ finish }
                    setFinish={ setFinish }
                    handleResult={ setResult }
                    dataFromSocket={ dataFromSocket }
                    setGameName={ setGameName }
                    gameSocket={ socket }
                    isFromSocket={ true }
                />
            );
        }
    }

    function renderPreGame() {
        if (!notAllowed && !notFound && !gameData.finish) {
            let isContinue = false;

            if (new Date(gameData.start).getFullYear() > 2020 ) isContinue = true;

            function handleStartGameClick() {
                preGameLeftContainer.current.classList.add('hide');
                preGameRightContainer.current.classList.add('hide');
                lineOne.current.classList.add('hide');
                lineTwo.current.classList.add('hide');
                preGameContainer.current.style.backgroundColor = 'transparent';
                preGameContainer.current.style.backgroundImage = 'none';
                setTimeout(() => {
                    setShouldStart(true);
                }, 400);
            }

            function renderBestPlayerItem() {
                function generateClassName(status) {
                    let className = '';

                    if (status === 'online') className += ' item__online';
                    else className += ' item__offline';

                    return className;
                }

                return gameData.bestPlayers.sort((a, b) => b.score - a.score).map(player => {
                    return (
                        <a className={ generateClassName(player.status) } href={ `/profile/${ player.username }` } target="_blank">
                            <div className="score--container">
                                <p>{ numberFormatter(player.score) }</p>
                            </div>
                            <div className="image--container">
                                <img src={ player.avatar } alt={ player.username } title={ player.username } />
                                <div className="username--container">
                                    <p>{ player.username }</p>
                                </div>
                            </div>
                        </a>
                    );
                })
            }

            function renderGameBestScores() {
                return (
                    <>
                        <h2>Top Scores</h2>
                        <div className="best--scores__group">
                            { renderBestPlayerItem() }
                        </div>
                    </>
                );
            }


            if (isContinue) {
                return (
                    <div ref={ preGameContainer } className={ "challenge-game--pre-game__container" + (shouldStart ? " hide" : "")}>
                        <div ref={ lineOne } className="line hide" />
                        <div ref={ lineTwo } className="line2 hide" />
                        <div ref={ preGameLeftContainer } className="challenge-game--pre-game__left-container hide">
                            {/*<div className="line" />*/}
                            <div className="challenge-game--pre-game__name">
                                <p>{ gameData.name }</p>
                            </div>
                            <div className="challenge-game--pre-game__information continue">
                                <h2>Continue</h2>
                                <p>Sound like your game is still on. To continue, click on the button...</p>
                                <button className="challenge-game--pre-game__button continue" onClick={ handleStartGameClick }>Continue Game</button>
                            </div>
                        </div>
                        <div ref={ preGameRightContainer } className="challenge-game--pre-game__right-container hide">
                            {/*<div className="line" />*/}
                        </div>
                    </div>
                );
            }

            function handlePreGameKeyDown(e) {
                if (e.keyCode === 13) handleStartGameClick();
            }

            return (
                <div onKeyDown={ handlePreGameKeyDown } tabIndex="0" ref={ preGameContainer } className={ "challenge-game--pre-game__container" + (shouldStart ? " hide" : "")}>
                    <div ref={ lineOne } className="line hide" />
                    <div ref={ lineTwo } className="line2 hide" />
                    <div ref={ preGameLeftContainer } className="challenge-game--pre-game__left-container hide">
                        {/*<div className="line" />*/}
                        <div className="challenge-game--pre-game__name">
                            <p>{ gameData.name }</p>
                        </div>
                        <div className="challenge-game--pre-game__information">
                            {/*{ renderGameInformation(gameData.name) }*/}
                            <h2>Game Effects on Brain</h2>
                            <p>{ gameData.information }</p>
                        </div>
                        {
                            gameData.firstAttempt &&
                            <div className="challenge-game--pre-game__no-play-warning">
                                <h2>Warning</h2>
                                <p>Since this is the first time you're playing this game, we recommend you first play this game in the training section then come here...</p>
                            </div>
                        }
                        <div className="challenge-game--pre-game__best-scores">
                            { renderGameBestScores() }
                        </div>
                    </div>
                    <div ref={ preGameRightContainer } className="challenge-game--pre-game__right-container hide">
                        {/*<div className="line" />*/}
                        {/* we go in opposite order, since it is rotated 180deg */}
                        <button className="challenge-game--pre-game__button" onClick={ handleStartGameClick }>Start Game</button>
                        <div className="challenge-game--pre-game__how-to-response">
                            <h2>How to Response</h2>
                            <p>You can response with clicking on Yes and No buttons...</p>
                            <p className="or">OR</p>
                            <p>You can hit the left and right arrow buttons on your keyboard.</p>
                        </div>
                        <div className="challenge-game--pre-game__how-to-play">
                            <h2>How to Play</h2>
                            <p>{ gameData.howToPlay }</p>
                        </div>
                    </div>
                </div>
            );
        }
    }

    function renderAfterGame() {
        if (gameAnalysisData.Error) return (
            <div className="challenge-game--after-game__container">
                <div className="challenge-game--after-game__body-container">
                    <div className="error--container">
                        <div className="challenge-game--error">
                            <p>Unable to fetch data</p>
                        </div>
                        <Button
                            text="Continue"
                            link='/challenges'
                        />
                    </div>
                </div>
            </div>
        );

        function renderTop5() {
            function createHighlightClassName(topScore) {
                if (topScore === gameAnalysisData.score) {
                    let index = -1;
                    for (let i = gameAnalysisData.scoreArrTop5.length - 1; i >= 0; i--) {
                        if (gameAnalysisData.scoreArrTop5[i].score === topScore) {
                            index = i;
                            break;
                        }
                    }

                    if (index !== -1) {
                        return 'highlight';
                    }

                    return '';
                }
            }

            return (
                <ol>
                    {
                        [ ...gameAnalysisData.scoreArrTop5 ].map((scoreObj, i) => {
                            return (
                                <li className={ createHighlightClassName(scoreObj.score) }>
                                    <p>{ i + 1 }.</p>
                                    <p>{ numberFormatter(scoreObj.score) }</p>
                                </li>
                            );
                        })
                    }
                </ol>
            );
        }

        return (
            <div className="challenge-game--after-game__container">
                <div className="header">
                    <div className="challenge-game--ribbon">
                        <span className="challenge-game--title">Game Analysis</span>
                    </div>
                </div>
                <div className="challenge-game--after-game__body-container">
                    <div className="challenge-game--after-game__left-container">
                        <div className="left">
                            <p>Score</p>
                            <p>Correct</p>
                            <p>Accuracy</p>
                            <p>Response Time Per Shape</p>
                        </div>
                        <div className="right">
                            <p>{ numberFormatter(gameAnalysisData.score) }</p>
                            <p>{ gameAnalysisData.right } of { gameAnalysisData.total }</p>
                            <p>{ gameAnalysisData.accuracy }%</p>
                            <p>{ gameAnalysisData.responseTime > 1 ? `${ gameAnalysisData.responseTime } ms` : 'Not Enough Data' }</p>
                        </div>
                    </div>
                    <div className="challenge-game--after-game__right-container">
                        <div className="head">
                            <h3>Your Top 5 Scores</h3>
                            <p>(includes only games from challenges)</p>
                        </div>
                        { renderTop5() }
                    </div>
                    <div className="challenge-game--after-game__bottom-container">
                        <div className="head">
                            {
                                window.innerWidth > 600 ?
                                    <h3>Your last 30 Attempts</h3>:
                                    <h3>Your last 10 Attempts</h3>
                            }
                            <p>(includes only games from challenges)</p>
                        </div>
                        {
                            gameAnalysisData.scoreArrLast30.length === 1 &&
                            <p>Since you've played this game once, the chart is not that beautiful!</p>
                        }
                        <div className="wrapper">
                            <div className="chart-wrapper">
                                <div ref={ chart } />
                            </div>
                        </div>
                        <Button
                            text="Continue"
                            link={ `/challenges/${ gameAnalysisData.url }` }
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (gameData && gameData.Error) return (
        <div className="challenge-game--container">
            <NotFound text="Game Not Found!" />
        </div>
    );

    if (isOffline && isOffline[0]) {
        return (
            <div className="challenge-game--container">
                <div className="challenge-game--offline__container">
                    <div className="pulse--container">
                        <p>You are Offline</p>
                        <p>You can still play Training games</p>
                        <Link to="/training">Go to Training</Link>
                        <p>Or you can wait until you get back Online</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="challenge-game--container">
            { (finish && !gameAnalysisData.completed) &&
            <div className="spinner--container">
                <Spinner />
            </div>
            }
            { (gameAnalysisData && gameAnalysisData.completed) && renderAfterGame() }
            { !gameData && <Loading /> }
            { gameData && renderPreGame() }
            { gameData && renderInnerChallengeGame() }
        </div>
    );
};

function mapStateToProps(state) {
    return {
        gameData: state.challenges.game
    };
}

export default requireAuth(connect(mapStateToProps, {
    cancelGameRedirect,
    fetchGame,
    fetchGameAnalysis,
    wipeGameAnalysis,
    wipeGameData
})(ChallengeGame));
