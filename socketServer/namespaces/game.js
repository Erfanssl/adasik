const makeRequest = require('../utils/makeRequest');
const store = require('../utils/store');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

const ADDRESS = 'http://127.0.0.1:3000';

async function onGameSocketConnect(socket) {
    socket.on('gameInfo', clientInfo => {
        // we construct the authorization
        const messageJwt = jwt.sign({ username: clientInfo.username }, keys.JWT_SOCKET_SECRET);
        const authorization = 'Bearer ' + messageJwt;

        makeRequest(`${ ADDRESS }/api/challenge/gameSocket/${ clientInfo.challengeId }/${ clientInfo.gameId }`, 'GET', {
            headers: {
                'Authorization': authorization
            }
        })
            .then(DBInfo => gameSocketLogic(JSON.parse(DBInfo), clientInfo, socket, authorization))
            .catch(err => {

            });
    });
}

function gameSocketLogic(DBInfo, clientInfo, socket, authorization) {
    // check if the game has already started
    const {
        game: {
            start,
            round,
            gameId,
            score: scoreFromDB,
            right: rightFromDB,
            wrong: wrongFromDB,
            consecutiveTrue: consecutiveTrueFromDB,
            booster: boosterFromDB,
            averageResponseTime: averageResponseTimeFromDB,
            finish: finishFromDB,
            maxBooster: maxBoosterFromDB,
            oneTab
        },
        url,
        turn
    } = DBInfo;

    const { username, challengeId, gameId: gameEncryptedData, gameName } = clientInfo;

    if (oneTab) return socket.emit('not-allowed');
    if (!oneTab) {
        makeRequest(`${ ADDRESS }/api/challenge/game/start`, 'PATCH', {
            headers: {
                'Authorization': authorization,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                oneTab: true,
                challengeEncryptedData: challengeId,
                gameEncryptedData,
                turn,
                round,
                reason: 'oneTab'
            })
        })
            .catch(err => {

            });
    }

    let isNew = new Date(start).getFullYear() <= 2020;
    let timeRemained = 90;
    let finish = finishFromDB || false;
    let score = scoreFromDB || 2;
    let booster = boosterFromDB || 1;
    let consecutiveTrue = consecutiveTrueFromDB || 0;
    const reaction = [];
    const choices = {
        right: rightFromDB || 0,
        wrong: wrongFromDB || 0
    };
    let maxBooster = maxBoosterFromDB || 1;

    if (store.game[username] && store.game[username].interval) clearInterval(store.game[username].interval);

    socket.emit('initialInfo', {
        score,
        booster,
        consecutiveTrue
    });

    if (finish) {
        const averageArr = [];
        if (averageResponseTimeFromDB) averageArr.push(averageResponseTimeFromDB);

        for (let i = 0; i < reaction.length; i++) {
            if (reaction[i + 1]) averageArr.push(reaction[i + 1] - reaction[i]);
        }

        if (store.game[username] && store.game[username].interval) clearInterval(store.game[username].interval);
    }

    if (isNew) {
        // we reach the server to set the start time
        makeRequest(`${ ADDRESS }/api/challenge/game/start`, 'PATCH', {
            headers: {
                'Authorization': authorization,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                start: Date.now(),
                challengeEncryptedData: challengeId,
                gameEncryptedData,
                turn,
                round,
                reason: 'start'
            })
        })
            .catch(err => {

            });
    }

    if (!isNew) {
        timeRemained = 90 - ((new Date() - new Date(start)) / 1000);
    }

    if (timeRemained <= 0) finish = true;

    // listeners
    socket.on('result', result => {
        reaction.push(Date.now());
        choices[result]++;

        if (result === 'right') {
            consecutiveTrue++;
            if (gameName === 'Anticipation') score += booster ** 2;
            if (gameName === 'MentalFlex') score += parseInt((booster ** 2.5).toFixed(0));
            if (gameName === 'MemoryRacer') score += parseInt((booster ** 2.7).toFixed(0));
            if (consecutiveTrue >= 4) {
                booster++;
                maxBooster = Math.max(maxBooster, booster);
                consecutiveTrue = 0;
            }
        }

        if (result === 'wrong') {
            booster = Math.ceil(booster / 2);
            consecutiveTrue = 0;
        }
    });

    function averageResponseTime(averageArr) {
        if (averageArr.length <= 1) return -1;
        return averageArr.reduce((acc, time) => acc + time, 0) / averageArr.length;
    }

    socket.on('disconnect', (reason) => {
        if (timeRemained > 0 && !finish) {
            const averageArr = [];
            if (averageResponseTimeFromDB) averageArr.push(averageResponseTimeFromDB, averageResponseTimeFromDB);

            for (let i = 0; i < reaction.length; i++) {
                if (reaction[i + 1]) averageArr.push(reaction[i + 1] - reaction[i]);
            }

            const average = averageResponseTime(averageArr);

            makeRequest(`${ ADDRESS }/api/challenge/game/finish`, 'PATCH', {
                headers: {
                    'Authorization': authorization,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    finish,
                    challengeEncryptedData: challengeId,
                    gameEncryptedData,
                    turn,
                    round,
                    averageResponseTime: parseInt(average.toFixed(0)),
                    consecutiveTrue,
                    booster,
                    maxBooster,
                    right: choices.right,
                    wrong: choices.wrong,
                    score,
                    gameId,
                    oneTab: false
                })
            })
                .catch(err => {

                });
        }
    });

    store.game[username] = {};
    store.game[username].interval = setInterval(() => {
        timeRemained -= .1;
        socket.emit('time', timeRemained);
        if (timeRemained <= 0) finish = true;
        if (finish) {
            socket.on('disconnect', () => {});
            const averageArr = [];
            if (averageResponseTimeFromDB) averageArr.push(averageResponseTimeFromDB, averageResponseTimeFromDB);

            for (let i = 0; i < reaction.length; i++) {
                if (reaction[i + 1]) averageArr.push(reaction[i + 1] - reaction[i]);
            }

            let average = averageResponseTime(averageArr);

            if (isNaN(average)) average = -1;

            if (store.game[username] && store.game[username].interval) clearInterval(store.game[username].interval);

            // to set the finish and other data in the db
            makeRequest(`${ ADDRESS }/api/challenge/game/finish`, 'PATCH', {
                headers: {
                    'Authorization': authorization,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    finish: true,
                    challengeEncryptedData: challengeId,
                    gameEncryptedData,
                    turn,
                    round,
                    averageResponseTime: average.toFixed(0),
                    right: choices.right,
                    wrong: choices.wrong,
                    booster,
                    maxBooster,
                    score,
                    gameId
                })
            })
                .then(res => {
                    const result = JSON.parse(res);
                    const totalChoices = choices.right + choices.wrong;

                    if (round >= 3 && turn === 'away') {
                        // this is the last game of the challenge
                        socket.emit('gameAnalysis', {
                            score,
                            right: choices.right,
                            total: totalChoices,
                            accuracy: Math.floor((choices.right / totalChoices) * 100),
                            responseTime: average.toFixed(0),
                            url: result.data.url
                        });

                        // we don't need this because we have socket.once in the client but to make code clear we keep it here
                        return;
                    }

                    return socket.emit('gameAnalysis', {
                        score,
                        right: choices.right,
                        total: totalChoices,
                        accuracy: Math.floor((choices.right / totalChoices) * 100),
                        responseTime: average.toFixed(0),
                        url,
                        toUsername: result.data ? result.data.toUsername : undefined
                    });
                })
                .catch(err => {

                });
        }
    }, 100);
}


module.exports = {
    onGameSocketConnect
};
