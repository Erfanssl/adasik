import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import './ChallengeInside.scss';
import {
    fetchChallengeInsideData,
    createGame
} from "../../../../../actions/challengeAction";
import numberFormatter from "../../../../../utility/numberFormatter";
import history from "../../../../../history";
import textCutter from "../../../../../utility/textCutter";
import requireAuth from "../../../../../middlewares/requireAuth";
import NotFound from "../../../utils/NotFound/NotFound";
import pageViewSocketConnection from "../../../../../utility/pageViewSocketConnection";

// import surrender from '../../../../../assets/icons/surrender.svg';
import play from '../../../../../assets/icons/play.svg';
import hourglass from '../../../../../assets/icons/hourglass.svg';
import finish from '../../../../../assets/icons/finish.svg';
import question from '../../../../../assets/question.svg';
import goldMedal from '../../../../../assets/icons/gold-medal.svg';
import silverMedal from '../../../../../assets/icons/silver-medal.svg';
import draw from '../../../../../assets/icons/draw.svg';

const ChallengeInside = ({
                             match,
                             challengeInsideData,
                             fetchChallengeInsideData,
                             challengeInsideReFetch,
                             createGame
                         }) => {
    useEffect(() => {
        document.title = 'Adasik - Challenge Match';
        fetchChallengeInsideData(match.params.id);
        const pageViewSocket = pageViewSocketConnection();

        return () => {
            pageViewSocket.disconnect();
        };
    }, []);

    useEffect(() => {
        if (challengeInsideReFetch && challengeInsideReFetch[0]) {
            fetchChallengeInsideData(match.params.id);
        }
    }, [challengeInsideReFetch]);

    useEffect(() => {
        if (challengeInsideData && challengeInsideData.redirect) {
            history.push(`/challenges/${ challengeInsideData.redirect }`);
        }
    }, [challengeInsideData]);

    function generateHomeTubeWidth(homeScore, awayScore) {
        const sum = homeScore + awayScore;
        return (homeScore / sum) * 100;
    }

    function generateTotalScorePercentage(home, away) {
        if (!home || !home.gamesInRounds.filter(game => game.finish).length || !away || !away.gamesInRounds.filter(game => game.finish).length) return 50;
        let homeScore = home.gamesInRounds.filter(game => game.finish).reduce((acc, gameObj) => acc + gameObj.score, 0);
        let awayScore = away.gamesInRounds.filter(game => game.finish).reduce((acc, gameObj) => acc + gameObj.score, 0);

        return generateHomeTubeWidth(homeScore, awayScore);
    }

    function generateTotalScore(side) {
        return side.gamesInRounds.reduce((acc, gameObj) => acc + gameObj.score, 0);
    }

    function renderBadge(result) {
        if (result === 'win') return goldMedal;
        if (result === 'lose') return silverMedal;
        return draw;
    }

    function renderChallengeHeader() {
        const { challengeInfo: { home, away, endType } } = challengeInsideData;
        const homePercentage = generateTotalScorePercentage(home, away);

        if (challengeInsideData && !challengeInsideData.challengeInfo.away.userInfo) {
            challengeInsideData.challengeInfo.away.userInfo = {
                avatar: "/images/user.4a895b672114f74207a1dd182ad35838.svg",
                level: 0,
                status: { text: "offline", date: "2021-01-31T09:35:15.574Z" },
                totalScore: 0,
                username: 'Anonymous'
            };
        }

        function renderLostOnTime() {
            if (endType && endType === 'time') {
                const loserUsername = home.result === 'lose' ? home.userInfo.username : away.userInfo.username;

                return (
                    <div className="challenge--lost-on-time__container">
                        { loserUsername } lost on time
                    </div>
                );
            }
        }

        return (
            <div className="challenge--header-container"
                 style={{ backgroundImage: `linear-gradient(45deg, #6b0f1a 0%, #b91372 ${ homePercentage }%, #ffdd00 ${ homePercentage }%, #fbb034 100%)` }}
            >
                {/*{*/}
                {/*    !challengeInsideData.challengeInfo.result ?*/}
                {/*        <div className="challenge--surrender-container">*/}
                {/*            <img src={ surrender } alt="surrender" />*/}
                {/*        </div> :*/}
                {/*        undefined*/}
                {/*}*/}
                {
                    endType && renderLostOnTime()
                }
                <div className="challenge--header__left-container">
                    <div className="challenge--header__avatar-container challenge--item__online">
                        <Link to={ `/profile/${ home.userInfo.username }` }>
                            <img src={ home.userInfo.avatar } alt={ home.userInfo.username } />
                        </Link>
                    </div>
                    <div className="challenge--username-container" style={ challengeInsideData.challengeInfo.result ? { padding: '1.3rem 4rem 1rem 4.5rem' } : {} }>
                        <Link to={ `/profile/${ home.userInfo.username }` }>
                            {
                                challengeInsideData.challengeInfo.result ?
                                    <p
                                        className="increment"
                                        style={ home.increment < 0 ? { color: '#f1acfa' } : { color: '#05ff05' } }
                                    >
                                        { home.increment >= 0 ? '+' + home.increment : home.increment }
                                    </p> :
                                    undefined
                            }
                            <p>{ textCutter(home.userInfo.username, 10) }</p>
                        </Link>
                    </div>
                    {
                        challengeInsideData.challengeInfo.result ?
                            <div className="challenge--badge-container">
                                <img src={ renderBadge(home.result) } alt={ home.result } />
                            </div> :
                            undefined
                    }
                    <div className="challenge--level-container">
                        <p>{ numberFormatter(home.userInfo.level) }</p>
                    </div>
                    <div className="challenge--total-score-container">
                        <p>{ numberFormatter(home.userInfo.totalScore) }</p>
                    </div>
                    <div className="challenge--score-container">
                        <p>{ numberFormatter(generateTotalScore(home)) }</p>
                    </div>
                </div>
                <div className="challenge--header__right-container">
                    <div className="challenge--username-container" style={ challengeInsideData.challengeInfo.result ? { padding: '1.3rem 4.5rem 1rem 4rem' } : {} }>
                        <Link to={ `/profile/${ away.userInfo.username === 'Anonymous' ? '#' : away.userInfo.username }` }>
                            {
                                challengeInsideData.challengeInfo.result ?
                                    <p
                                        className="increment"
                                        style={ away.increment < 0 ? { color: '#f1acfa' } : { color: '#05ff05' } }
                                    >
                                        { away.increment >= 0 ? '+' + away.increment : away.increment }
                                    </p> :
                                    undefined
                            }
                            <p>{ textCutter(away.userInfo.username, 10) }</p>
                        </Link>
                    </div>
                    {
                        challengeInsideData.challengeInfo.result ?
                            <div className="challenge--badge-container">
                                <img src={ renderBadge(away.result) } alt={ away.result } />
                            </div> :
                            undefined
                    }
                    <div className="challenge--level-container">
                        <p>{ numberFormatter(away.userInfo.level) }</p>
                    </div>
                    <div className="challenge--total-score-container">
                        <p>{ numberFormatter(away.userInfo.totalScore) }</p>
                    </div>
                    <div className="challenge--score-container" style={ { left: (62 - (numberFormatter(generateTotalScore(away)).length * 2.4) - 5 + '%') } }>
                        <p>{ numberFormatter(generateTotalScore(away)) }</p>
                    </div>
                    <div className="challenge--header__avatar-container challenge--item__offline">
                        <Link to={ `/profile/${ away.userInfo.username === 'Anonymous' ? '#' : away.userInfo.username }` }>
                            <img src={ away.userInfo.avatar } alt={ away.userInfo.username } />
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    function renderChallengeItem() {
        const renderArr = [];
        const { challengeInfo: { home, away } } = challengeInsideData;

        for (let i = 0; i < 3; i++) {
            let left;
            let right;
            let center;

            if (!home.gamesInRounds[i] || !home.gamesInRounds[i].finish) {
                left = (
                    <>
                        <div className="challenge--item__score-container inactive">
                            <p>-</p>
                        </div>
                        <div className="challenge--item__left inactive" style={{ width: '50rem' }} />
                    </>
                );
            }

            if (!away.gamesInRounds[i] || !away.gamesInRounds[i].finish) {
                right = (
                    <>
                        <div className="challenge--item__right inactive" style={{ width: '50rem' }} />
                        <div className="challenge--item__score-container inactive">
                            <p>-</p>
                        </div>
                    </>
                );
            }

            if (!home.gamesInRounds[i] && !home.gamesInRounds[i]) {
                center = (
                    <div className="challenge--item__center inactive">
                        <div>
                            <img src={ question } alt="unknown game" />
                            <p>Unknown</p>
                        </div>
                    </div>
                );
            }

            if (home.gamesInRounds[i] || away.gamesInRounds[i]) {
                center = (
                    <div className="challenge--item__center">
                        <div>
                            <img src={ home.gamesInRounds[i].gameInfo.icon } alt={ home.gamesInRounds[i].gameInfo.name } />
                            <p>{ textCutter(home.gamesInRounds[i].gameInfo.name, 16) }</p>
                        </div>
                    </div>
                );
            }

            if (home.gamesInRounds[i] && home.gamesInRounds[i].finish && away.gamesInRounds[i] && !away.gamesInRounds[i].finish) {
                left = (
                    <>
                        <div className="challenge--item__score-container">
                            <p>{ numberFormatter(home.gamesInRounds[i].score) }</p>
                        </div>
                        <div className="challenge--item__left" style={{ width: '50rem' }} />
                    </>
                );
            }

            if (home.gamesInRounds[i] && home.gamesInRounds[i].finish && away.gamesInRounds[i] && away.gamesInRounds[i].finish) {
                const homeTubeWidth = generateHomeTubeWidth(home.gamesInRounds[i].score, away.gamesInRounds[i].score);
                left = (
                    <>
                        <div className="challenge--item__score-container">
                            <p>{ numberFormatter(home.gamesInRounds[i].score) }</p>
                        </div>
                        <div className="challenge--item__left" style={{ width: homeTubeWidth.toString() + 'rem' }} />
                    </>
                );

                right = (
                    <>
                        <div className="challenge--item__right" style={{ width: (100 - homeTubeWidth).toString() + 'rem' }} />
                        <div className="challenge--item__score-container">
                            <p>{ numberFormatter(away.gamesInRounds[i].score) }</p>
                        </div>
                    </>
                );
            }

            renderArr.push(
                <div className="challenge--item-container">
                    { left }
                    { center }
                    { right }
                </div>
            );
        }

        return renderArr;
    }

    function handlePlayClick() {
        createGame(match.params.id, challengeInsideData.challengeInfo.username);
    }

    function renderChallengeButton() {
        const { challengeInfo } = challengeInsideData;
        if (challengeInfo.result) {
            return (
                <div className="challenge--btn challenge--btn__finish">
                    <img src={ finish } alt="finish" />
                </div>
            );
        }

        if (challengeInfo.shouldPlay) {
            return (
                <div onClick={ handlePlayClick } className="challenge--btn challenge--btn__play">
                    <span>Play</span>
                    <img src={ play } alt="play" />
                </div>
            );
        }

        if (!challengeInfo.shouldPlay && !challengeInfo.visitor) {
            return (
                <div className="challenge--btn challenge--btn__waiting">
                    <span>Opponent's Turn</span>
                    <img src={ hourglass } alt="hourglass" />
                </div>
            );
        }

        return (
            <div className="challenge--btn challenge--btn__watching">
                <span>Challenge Is In Progress</span>
                <img src={ hourglass } alt="watching" />
            </div>
        );
    }

    return (
        <div className="challenge--container">
            { challengeInsideData && challengeInsideData.challengeInfo && !challengeInsideData.Error && renderChallengeHeader() }
            {
                (challengeInsideData && challengeInsideData.Error) &&
                <NotFound text="Challenge Not Found!" />
            }
            <div className="challenge--body-container">
                { challengeInsideData && challengeInsideData.challengeInfo && !challengeInsideData.Error && renderChallengeItem() }
                <div className="challenge--btn-container">
                    { challengeInsideData && challengeInsideData.challengeInfo && !challengeInsideData.Error && renderChallengeButton() }
                </div>
            </div>
        </div>
    );
};

function mapStateToProps(state) {
    return {
        challengeInsideData: state.challenges.inside
    };
}

export default requireAuth(connect(mapStateToProps, {
    fetchChallengeInsideData,
    createGame
})(ChallengeInside));