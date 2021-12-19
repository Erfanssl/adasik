import React, { useEffect, useState, useRef } from 'react';
import './TrainingGame.scss';
import { connect } from 'react-redux';
import {
    trainingSendData,
    trainingGameWipeData
} from "../../../../../actions/trainingAction";

import createMultiLineChart from "../../Statistics/createMultiLineChart";
import Button from "../../../utils/Button/Button";
import numberFormatter from "../../../../../utility/numberFormatter";
import requireAuth from "../../../../../middlewares/requireAuth";
import NotFound from "../../../utils/NotFound/NotFound";
import wordCapitalize from "../../../../../utility/wordCapitalize";
import Spinner from "../../../utils/Spinner/Spinner";
import pageViewSocketConnection from "../../../../../utility/pageViewSocketConnection";

// indexedDB
import { writeData } from "../../../../../pwa/utility";


const gamesData = [
    {
        name : "Memory Racer",
        type : "speed",
        howToPlay : "Quickly specify if the current image matches the preceding image.",
        icon : "/images/memory-racer.da39074216e06de2ebd723f030c438b4.svg",
        information : "This game can improve brain's information processing. It makes you become faster in analyzing sensory input."
    },
    {
        name : "Mental Flex",
        type : "flexibility",
        howToPlay : "Quickly specify if the actual color of the word matches the meaning of the word.",
        icon : "/images/mental-flex.83b752c8b6f735e177856c5e9c3c5723.svg",
        information : "This game can increase the flexibility of your cognitive responses. It makes you suppress the impulsive responses and makes you faster to decide in this kind of situations."
    },
    {
        name : "Anticipation",
        type : "speed",
        howToPlay : "Quickly specify if the two leftmost images are the same. To get better result, it's better to look at the shapes that are coming to better anticipate your choice.",
        icon : "/images/anticipation.4430f085b7acc21854d8262b5b192bc6.svg",
        information : "This game can help you improve anticipation skills. It makes you quickly divide your attention to find the respond and see what's coming next."
    }
];

// Comp { match.params.challengeId } and { match.params.gameId }
const games = ['Mental Flex', 'Anticipation', 'Memory Racer'];

const TrainingGame = ({
                          match,
                          gameAnalysisData,
                          trainingSendData,
                          trainingGameWipeData
                      }) => {
    const [gameComponent, setGameComponent] = useState({ c: undefined });
    const [shouldStart, setShouldStart] = useState(false);
    const [result, setResult] = useState('');
    const [notFound, setNotFound] = useState(false);
    const [gameData, setGameData] = useState(null);
    const [choices, setChoices] = useState({ right: 0, wrong: 0 });
    const [choiceTimestamp, setChoiceTimestamp] = useState([]);
    const [maxBooster, setMaxBooster] = useState(1);
    const [newMaxBooster, setNewMaxBooster] = useState(1);
    const [score, setScore] = useState(2);
    const [averageResponseTime, setAverageResponseTime] = useState(-1);
    const [finish, setFinish] = useState(null);

    // ref
    const chart = useRef();
    const preGameLeftContainer = useRef();
    const preGameRightContainer = useRef();
    const preGameContainer = useRef();
    const lineOne = useRef();
    const lineTwo = useRef();

    useEffect(() => {
        const name = match.params.trainingName.split('-').map(training => wordCapitalize(training)).join(' ');
        const game = gamesData.find(game => game.name === name);

        if (!games.includes(name)) return setNotFound(true);

        if (game) setGameData(game);

        import(`../../../../game/${ name.split(' ').join('') }/${ name.split(' ').join('') }`).then(d => {
            setGameComponent({ c: d.default });
        });

        const pageViewSocket = pageViewSocketConnection();

        return () => {
            trainingGameWipeData();
            pageViewSocket.disconnect();
            window.onbeforeunload = (e) => {
                e.preventDefault();
                delete e['returnValue'];
            };
        };
    }, []);

    useEffect(() => {
        preGameContainer?.current?.focus();
    }, [preGameContainer.current]);

    // to specify when the time is out to send the data
    useEffect(() => {
        if (finish) {
            // the game is over
            // constructing data
            const data = {
                gameName: gameData.name,
                score,
                right: choices.right,
                wrong: choices.wrong,
                newMaxBooster
            };

            // average response time
            const averageArr = [];

            for (let i = 0; i < choiceTimestamp.length; i++) {
                if (choiceTimestamp[i + 1]) averageArr.push(choiceTimestamp[i + 1] - choiceTimestamp[i]);
            }

            // we get the average
            let average = averageArr.reduce((acc, time) => acc + time, 0) / averageArr.length;
            if (isNaN(average)) average = -1;
            setAverageResponseTime(parseInt(average.toFixed(0)));
            data.averageResponseTime = parseInt(average.toFixed(0));

            if (navigator.onLine) trainingSendData(data)
            else {
                // means the user is offline
                try {
                    (async () => {
                        if ('serviceWorker' in navigator) {
                            const sw = await navigator.serviceWorker.ready;
                            await writeData('trainings', data);
                            await sw.sync.register('sync-training-result');
                        }
                    })()
                } catch (err) {

                }
            }
        }
    }, [finish]);

    useEffect(() => {
        if (chart?.current && gameAnalysisData) {
            let scoreArr;
            if (window.innerWidth > 600) scoreArr = [ ...gameAnalysisData.last30Attempts ].reverse().map((scoreObj, i) => ({ date: i + 1, value: scoreObj.score }));
            else scoreArr = [ ...gameAnalysisData.last30Attempts.slice(-10) ].reverse().map((scoreObj, i) => ({ date: i + 1, value: scoreObj.score }));
            createMultiLineChart(scoreArr, chart.current);
        }
    }, [chart, gameAnalysisData]);

    useEffect(() => {
        if (shouldStart) {
            setFinish(false);
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
        setChoices(choiceObj => ({ ...choiceObj, [result.res]: choiceObj[result.res] + 1 }));
        setChoiceTimestamp(choicesArr => [ ...choicesArr, Date.now() ]);
    }, [result]);

    useEffect(() => {
        if (maxBooster > newMaxBooster) setNewMaxBooster(maxBooster);
    }, [maxBooster]);

    function renderInnerTrainingGame() {
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

        const GameComponentLoaded = gameComponent.c;

        if (GameComponentLoaded) {
            return (
                <GameComponentLoaded
                    shouldStart={ shouldStart }
                    setFinish={ setFinish }
                    finish={ finish }
                    handleResult={ setResult }
                    setMaxBooster={ setMaxBooster }
                    setScore={ setScore }
                />
            );
        }
    }

    function renderPreGame() {
        if (!notFound) {

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
                        <div className="challenge-game--pre-game__attention">
                            <h2>Attention</h2>
                            <p>
                                Training games' score only effect Training Score. They don't effect your Total Score nor your Rank.
                                They don't effect your brain's information in the statistics either; But these games effect your best results.
                                Training games also improve your Level.
                            </p>
                            <p>
                                These games don't count for the top scores of the game globally.
                                You can play trainings even offline and your score will be sent when you get back online.
                            </p>
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
        // show spinner till the gameAnalysisData comes
        if (!gameAnalysisData && navigator.onLine) {
            return (
                <div className="challenge-game--after-game__container">
                    <div className="challenge-game--after-game__body-container">
                        <div className="spinner--container">
                            <Spinner />
                        </div>
                    </div>
                </div>
            );
        }

        function renderTop5() {
            function createHighlightClassName() {
                if (gameAnalysisData.top5.map(t5 => t5.score).includes(score)) {
                    for (let i = gameAnalysisData.top5.length - 1; i >= 0; i--) {
                        if (gameAnalysisData.top5[i].score === score) {
                            return i;
                        }
                    }
                }

                return -1;
            }

            return (
                <ol>
                    {
                        [ ...gameAnalysisData.top5 ].map((scoreObj, i) => {
                            return (
                                <li key={ scoreObj.score.toString() + i.toString() } className={ createHighlightClassName() === i ? 'highlight' : '' }>
                                    <p>{ i + 1 }.</p>
                                    <p>{ numberFormatter(scoreObj.score) }</p>
                                </li>
                            );
                        })
                    }
                </ol>
            );
        }

        function handleTryThisGameAgain() {
            window.location.reload();
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
                            <p>{ numberFormatter(score) }</p>
                            <p>{ choices.right } of { choices.right + choices.wrong }</p>
                            <p>{ choices.right + choices.wrong === 0 ? 0 : Math.floor((choices.right / (choices.right + choices.wrong)) * 100) }%</p>
                            <p>{ (choices.right + choices.wrong) > 1 ? `${ averageResponseTime } ms` : 'Not Enough Data' }</p>
                        </div>
                    </div>
                    <div className="challenge-game--after-game__right-container">
                        <div className="head">
                            <h3>Your Top 5 Scores</h3>
                            <p>(includes only games from trainings)</p>
                        </div>
                        {
                            gameAnalysisData && !gameAnalysisData.Error && renderTop5()
                        }
                        {
                            !navigator.onLine &&
                            <div className="training-game--error">
                                <p>You need to be online to get this data</p>
                            </div>
                        }
                        {
                            gameAnalysisData && gameAnalysisData.Error &&
                            <div className="training-game--error">
                                <p>Unable to Send and Fetch data</p>
                            </div>
                        }
                    </div>
                    <div className="challenge-game--after-game__bottom-container">
                        {
                            !navigator.onLine &&
                            <div className="result--offline">
                                <p>Your result will be submitted when you get online</p>
                            </div>
                        }
                        <div className="head">
                            {
                                window.innerWidth > 600 ?
                                    <h3>Your last 30 Attempts</h3>:
                                    <h3>Your last 10 Attempts</h3>
                            }
                            <p>(includes only games from trainings)</p>
                        </div>
                        {
                            gameAnalysisData && gameAnalysisData.Error &&
                            <div className="training-game--error">
                                <p>Unable to Send and Fetch data</p>
                            </div>
                        }
                        {
                            gameAnalysisData && !gameAnalysisData.Error &&
                            <>
                                {
                                    gameAnalysisData.last30Attempts.length === 1 &&
                                    <p>Since you've played this game once, the chart is not that beautiful!</p>
                                }
                                <div className="wrapper">
                                    <div className="chart-wrapper">
                                        <div ref={ chart } />
                                    </div>
                                </div>
                            </>
                        }
                        {
                            !navigator.onLine &&
                            <div className="training-game--error">
                                <p>You need to be online to get this data</p>
                            </div>
                        }
                        <Button
                            text="Go To Training"
                            link='/training'
                        />
                        <Button
                            text="Try This Game Again"
                            onClick={ handleTryThisGameAgain }
                            form={ true }
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (notFound) return (
        <div className="challenge-game--container">
            <NotFound text="Game Not Found!" />
        </div>
    );

    return (
        <div className="challenge-game--container">
            { finish === true && renderAfterGame() }
            { gameData && renderPreGame() }
            { gameData && renderInnerTrainingGame() }
        </div>
    );
};

function mapStateToProps(state) {
    return {
        gameAnalysisData: state.trainings.gameAnalysisData
    };
}

export default requireAuth(connect(mapStateToProps, {
    trainingSendData,
    trainingGameWipeData
})(TrainingGame));
