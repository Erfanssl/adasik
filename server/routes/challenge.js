const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middlewares/auth');
const challengeQueue = require('../utils/challengeQueue');
const currentUser = require('../middlewares/currentUser');
const dataEncryption = require('../utils/dataEncryption');
const dataDecryption = require('../utils/dataDecryption');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const makeRequest = require('../utils/makeRequest');

const challengeRouter = express.Router();
const Challenge = mongoose.model('Challenge');
const User = mongoose.model('User');
const AllGame = mongoose.model('AllGame');
const Game = mongoose.model('Game');
const ChallengeQueue = mongoose.model('ChallengeQueue');
const Ranking = mongoose.model('Ranking');
const History = mongoose.model('History');
const Block = mongoose.model('Block');
const DailyAssignment = mongoose.model('DailyAssignment');
const Setting = mongoose.model('Setting');

const FINISH_NUMBER = 3;
const BASE_DISTANCE = 100;

const ONE_SECOND = 1000;
const ONE_MINUTE = 60 * ONE_SECOND;
const ONE_HOUR = 60 * ONE_MINUTE;

const TYPE_STANDARD = {
    speed: 150000,
    flexibility: 100000,
    attention: 150000
};

const MAXIMUM_CHALLENGE_NUMBER = 20;
const MAXIMUM_REQUEST_NUMBER = 50;

/*
* We need to types of routes
*   1. for challenges
*   2. for requests
* */

// const id1 = new mongoose.Types.ObjectId();
// const id1Ref = new mongoose.Types.ObjectId();
// const id2 = new mongoose.Types.ObjectId();
// const id2Ref = new mongoose.Types.ObjectId();
// Challenge.create([
//     {
//         userId: '601679d33a1230395ce4ee51',
//         challenges: {
//             active: [
//                 {
//                     _id: id1,
//                     opponentChallengeId: id1Ref,
//                     home: {
//                         userId: '601679d33a1230395ce4ee51',
//                         gamesInRounds: [
//                             {
//                                 gameId: '6029e836e1c84011482c138a',
//                                 gameName: 'Memory Racer',
//                                 finish: true,
//                                 score: 2600,
//                                 start: new Date(),
//                                 round: 1
//                             },
//                             {
//                                 gameId: '6029e836e1c84011482c138c',
//                                 gameName: 'Mental Flex',
//                                 finish: true,
//                                 score: 4500,
//                                 start: new Date(),
//                                 round: 2
//                             }
//                         ]
//                     },
//                     away: {
//                         userId: '601679d33a1230395ce4ee54',
//                         gamesInRounds: [
//                             {
//                                 gameId: '6029e836e1c84011482c138a',
//                                 gameName: 'Memory Racer',
//                                 finish: true,
//                                 score: 1500,
//                                 start: new Date(),
//                                 round: 1
//                             },
//                             {
//                                 gameId: '6029e836e1c84011482c138c',
//                                 gameName: 'Mental Flex',
//                                 finish: true,
//                                 score: 5500,
//                                 start: new Date(),
//                                 round: 2
//                             }
//                         ]
//                     },
//                     turn: 'home',
//                     url: dataEncryption('601679d33a1230395ce4ee51' + '.' + id1),
//                     pending: false
//                 }
//             ],
//             inactive: [
//                 {
//                     _id: id2,
//                     opponentChallengeId: id2Ref,
//                     home: {
//                         userId: '601679d33a1230395ce4ee51',
//                         gamesInRounds: [
//                             {
//                                 gameId: '6029e836e1c84011482c138c',
//                                 finish: true,
//                                 score: 2600,
//                                 start: new Date(),
//                                 round: 1
//                             },
//                             {
//                                 gameId: '6029e836e1c84011482c138a',
//                                 finish: true,
//                                 score: 6000,
//                                 start: new Date(),
//                                 round: 2
//                             },
//                             {
//                                 gameId: '6029e836e1c84011482c138b',
//                                 finish: true,
//                                 score: 4080,
//                                 start: new Date(),
//                                 round: 3
//                             }
//                         ]
//                     },
//                     away: {
//                         userId: '601679d33a1230395ce4ee5a',
//                         gamesInRounds: [
//                             {
//                                 gameId: '6029e836e1c84011482c138c',
//                                 finish: true,
//                                 score: 1500,
//                                 start: new Date(),
//                                 round: 1
//                             },
//                             {
//                                 gameId: '6029e836e1c84011482c138a',
//                                 finish: true,
//                                 score: 5500,
//                                 start: new Date(),
//                                 round: 2
//                             },
//                             {
//                                 gameId: '6029e836e1c84011482c138b',
//                                 finish: true,
//                                 score: 4050,
//                                 start: new Date(),
//                                 round: 3
//                             }
//                         ]
//                     },
//                     result: 'win',
//                     endType: 'normal'
//                 }
//             ]
//         },
//         requests: [
//             '601679d33a1230395ce4ee57'
//         ],
//         userRequestCounter: {
//             pending: 0,
//             accepted: 0,
//             rejected: 0
//         }
//     },
//     {
//         userId: '601679d33a1230395ce4ee54',
//         challenges: {
//             active: [
//                 {
//                     _id: id1Ref,
//                     opponentChallengeId: id1,
//                     home: {
//                         userId: '601679d33a1230395ce4ee51',
//                         gamesInRounds: [
//                             {
//                                 gameId: '6029e836e1c84011482c138a',
//                                 finish: true,
//                                 score: 2600,
//                                 start: new Date(),
//                                 round: 1
//                             },
//                             {
//                                 gameId: '6029e836e1c84011482c138c',
//                                 finish: true,
//                                 score: 4500,
//                                 start: new Date(),
//                                 round: 2
//                             }
//                         ]
//                     },
//                     away: {
//                         userId: '601679d33a1230395ce4ee54',
//                         gamesInRounds: [
//                             {
//                                 gameId: '6029e836e1c84011482c138a',
//                                 finish: true,
//                                 score: 1500,
//                                 start: new Date(),
//                                 round: 1
//                             },
//                             {
//                                 gameId: '6029e836e1c84011482c138c',
//                                 finish: true,
//                                 score: 5500,
//                                 start: new Date(),
//                                 round: 2
//                             }
//                         ]
//                     },
//                     turn: 'home',
//                     url: dataEncryption('601679d33a1230395ce4ee51' + '.' + id1),
//                     pending: false
//                 }
//             ]
//         },
//         userRequestCounter: {
//             pending: 0,
//             accepted: 0,
//             rejected: 0
//         }
//     },
//     {
//         userId: '601679d33a1230395ce4ee57',
//         challenges: {
//             inactive: [
//                 {
//                     _id: id2Ref,
//                     opponentChallengeId: id2,
//                     home: {
//                         userId: '601679d33a1230395ce4ee51',
//                         gamesInRounds: [
//                             {
//                                 gameId: '6029e836e1c84011482c138c',
//                                 finish: true,
//                                 score: 2600,
//                                 start: new Date(),
//                                 round: 1
//                             },
//                             {
//                                 gameId: '6029e836e1c84011482c138a',
//                                 finish: true,
//                                 score: 6000,
//                                 start: new Date(),
//                                 round: 2
//                             },
//                             {
//                                 gameId: '6029e836e1c84011482c138b',
//                                 finish: true,
//                                 score: 4080,
//                                 start: new Date(),
//                                 round: 3
//                             }
//                         ]
//                     },
//                     away: {
//                         userId: '601679d33a1230395ce4ee57',
//                         gamesInRounds: [
//                             {
//                                 gameId: '6029e836e1c84011482c138c',
//                                 finish: true,
//                                 score: 1500,
//                                 start: new Date(),
//                                 round: 1
//                             },
//                             {
//                                 gameId: '6029e836e1c84011482c138a',
//                                 finish: true,
//                                 score: 5500,
//                                 start: new Date(),
//                                 round: 2
//                             },
//                             {
//                                 gameId: '6029e836e1c84011482c138b',
//                                 finish: true,
//                                 score: 4050,
//                                 start: new Date(),
//                                 round: 3
//                             }
//                         ]
//                     },
//                     result: 'lose',
//                     endType: 'normal'
//                 }
//             ]
//         },
//         userRequestCounter: {
//             pending: 1,
//             accepted: 0,
//             rejected: 0
//         }
//     }
// ]);
//
// Ranking.create(
//     [
//         {
//             userId: '601679d33a1230395ce4ee54',
//             rank: 2,
//             totalScore: 20447
//         },
//         {
//             userId: '601679d33a1230395ce4ee57',
//             rank: 3,
//             totalScore: 20440
//         },
//         {
//             userId: '601679d33a1230395ce4ee5a',
//             rank: 4,
//             totalScore: 10500
//         },
//         {
//             userId: '601679d33a1230395ce4ee51',
//             rank: 1,
//             totalScore: 20448
//         }
//     ]
// );

// rank calculator
async function rankCalculator(totalScore, increment, userId) {
    // we get the rank of the user, we need the newest data so we query here
    const userRankQuery = await Ranking.findOne({ userId }, { rank: 1 });
    const { rank } = userRankQuery;

    if (increment === 0) return rank;

    // we check if the increment is positive or negative
    if (increment > 0) {
        let currentRank = rank;
        let nextRank = rank - 1;
        let newRank;

        while (nextRank >= 1) {
            // we query for the nextRank's totalScore to compare it to user's currentRank
            const nextRankData = await Ranking.findOne({ rank: nextRank });

            // if equal --> we should consider the number of wins and loses
            if (!nextRankData) break;
            if (nextRankData.totalScore >= totalScore + increment) break;
            currentRank = nextRank;
            nextRank -= 1;
        }

        if (currentRank === rank) return rank;
        newRank = currentRank;

        // means there was positive a change in the ranking
        // we should start to change the ranking of the currentRank to rank
        let rankAcc = newRank;
        const rankArr = Array.from({ length: rank - newRank }, () => rankAcc++);

        // we need their userIds for future change in the users collection
        const idsQuery = await Ranking.find({ rank: { $in: rankArr } }, { userId: 1 });

        // we increment the rank of other users that need to be changed because of the change in the user's ranking
        await Ranking.updateMany({
            rank: { $in: rankArr }
        }, {
            $inc: { rank: 1 }
        });

        // we set the new rank and totalScore of the user
        await Ranking.updateMany({
            userId
        }, {
            $set: {
                rank: newRank,
                totalScore: totalScore + increment
            }
        });

        // we need to change the rank of the users that they're rank got changed
        await User.updateMany({
            _id: { $in: idsQuery.map(idDoc => idDoc.userId) }
        }, {
            $inc: {
                'info.specific.whole.rank': 1
            }
        });

        // and now set the rank of the the user to be currentRank
        await User.updateOne({
            _id: userId
        }, {
            $set: {
                'info.specific.whole.rank': newRank
            }
        });

        // now we should add new totalScore and new rank to user's histories
        await History.updateOne({
            userId
        }, {
            $push: {
                rank: newRank,
                totalScore: totalScore + increment
            }
        });

        return newRank;
    }

    else {
        let currentRank = rank;
        let prevRank = rank + 1;
        let newRank;

        // we need to get the highest rank --> worst rank
        const highestRank = await Ranking.findOne({}).sort({ rank: -1 }).limit(1);

        while (prevRank <= highestRank.rank) {
            // we query for the nextRank's totalScore to compare it to user's currentRank

            const prevRankData = await Ranking.findOne({ rank: prevRank });
            if (!prevRankData) break;
            // if equal --> we should consider the number of wins and loses
            if (prevRankData.totalScore <= totalScore + increment) break;
            currentRank = prevRank;
            prevRank += 1;
        }

        if (currentRank === rank) return rank;
        newRank = currentRank;

        // means there was positive a change in the ranking
        // we should start to change the ranking of the currentRank to rank
        let rankAcc = currentRank;
        const rankArr = Array.from({ length: newRank - rank }, () => rankAcc--);

        // we need their userIds for future change in the users collection
        const idsQuery = await Ranking.find({ rank: { $in: rankArr } }, { userId: 1 });

        // we increment the rank of other users that need to be changed because of the change in the user's ranking
        await Ranking.updateMany({
            rank: { $in: rankArr }
        }, {
            $inc: { rank: -1 }
        });

        // we set the new rank and totalScore of the user
        await Ranking.updateMany({
            userId
        }, {
            $set: {
                rank: newRank,
                totalScore: totalScore + increment
            }
        });

        // we need to change the rank of the users that they're rank got changed
        await User.updateMany({
            _id: { $in: idsQuery.map(idDoc => idDoc.userId) }
        }, {
            $inc: {
                'info.specific.whole.rank': -1
            }
        });

        // and now set the rank of the the user to be currentRank
        await User.updateOne({
            _id: userId
        }, {
            $set: {
                'info.specific.whole.rank': newRank
            }
        });

        // now we should add new totalScore and new rank to user's histories
        await History.updateOne({
            userId
        }, {
            $push: {
                rank: newRank,
                totalScore: totalScore + increment
            }
        });

        return newRank;
    }
}

async function finishTheChallenge({ type, userId, challengeId, otherUserId, userSideInChallenge, otherUserSideInChallenge, winnerOnTimeId } ) {
    // we should remove the challenge from active challenges and move it to inactive
    // first move it to inactive array
    // we need to get the information about home and away, so we get it from one of the users

    if (type === 'anonymous-timeout') {
        // means no match found for the user after 6 hours!
        // we delete the challenge
        await Challenge.updateOne({
            userId
        }, {
            $pull: {
                'challenges.active': { _id: challengeId }
            }
        });

        return;
    }

    const userChallengeQuery = await Challenge.aggregate([
        {
            $match: {
                userId: mongoose.Types.ObjectId(userId)
            }
        },
        {
            $unwind: '$challenges.active'
        },
        {
            $match: {
                'challenges.active._id': mongoose.Types.ObjectId(challengeId)
            }
        },
        {
            $project: {
                active: '$challenges.active'
            }
        }
    ]);

    const { home, away, opponentChallengeId: otherChallengeId } = userChallengeQuery[0].active;
    const userSide = home.userId.toString() === userId.toString() ? home : away;
    const otherUserSide = home.userId.toString() === otherUserId.toString() ? home : away;

    // constructing data
    const userChallengeId = new mongoose.Types.ObjectId();
    const otherUserChallengeId = new mongoose.Types.ObjectId();

    function editGamesInRounds(side) {
        side.gamesInRounds.forEach(game => {
            delete game._id
            delete game.updatedAt;
            delete game.averageResponseTime;
            delete game.booster;
            delete game.consecutiveTrue;
            delete game.maxBooster;
            delete game.right;
            delete game.wrong;
        });
    }

    editGamesInRounds(userSide);
    editGamesInRounds(otherUserSide);

    let userResult = 'draw';
    let otherUserResult = 'draw';

    if (type === 'normal') {
        // means finished normally
        const userScore = userSide.gamesInRounds.reduce((acc, game) => acc + game.score, 0);
        const otherUserScore = otherUserSide.gamesInRounds.reduce((acc, game) => acc + game.score, 0);

        if (userScore > otherUserScore) {
            userResult = 'win';
            otherUserResult = 'lose';
        }

        if (userScore < otherUserScore) {
            userResult = 'lose';
            otherUserResult = 'win';
        }
    }

    if (type === 'time' && winnerOnTimeId) {
        // means one player lost on time
        userResult = winnerOnTimeId.toString() === userId.toString() ? 'win' : 'lose';
        otherUserResult = userResult === 'win' ? 'lose' : 'win';
    }

    // we need to handle the increase or decrease of the score and level
    function handleScoreChange(userTotalScore, otherUserTotalScore, result) {
        const sign = (userTotalScore - otherUserTotalScore) < 0 ? '-' : '+';
        const distance = Math.abs(userTotalScore - otherUserTotalScore);
        const baseDivideDistance = distance / BASE_DISTANCE;
        let increment;

        if (result === 'win') {
            if (baseDivideDistance < 1) {
                if (sign === '+') {
                    increment = +(Math.ceil(baseDivideDistance * 20));
                } else if (sign === '-') {
                    increment = +(Math.ceil(baseDivideDistance * 300));
                }
            } else if (baseDivideDistance >= 1) {
                if (sign === '+') {
                    increment = +(Math.ceil(baseDivideDistance * (3 / 5)));
                } else if (sign === '-') {
                    increment = +(Math.ceil(baseDivideDistance * (4 / 5)));
                }
            }
        } else if (result === 'lose') {
            if (baseDivideDistance < 1) {
                if (sign === '+') {
                    increment = -(Math.floor(baseDivideDistance * 200));
                } else if (sign === '-') {
                    increment = -(Math.floor(baseDivideDistance * 15));
                }
            } else if (baseDivideDistance >= 1) {
                if (sign === '+') {
                    increment = -(Math.floor(baseDivideDistance / 8));
                } else if (sign === '-') {
                    increment = -(Math.floor(baseDivideDistance / 10));
                }
            }
        } else if (result === 'draw') {
            if (baseDivideDistance < 1) {
                if (sign === '+') {
                    increment = -(Math.floor(baseDivideDistance * 100));
                } else if (sign === '-') {
                    increment = +(Math.ceil(baseDivideDistance * 110));
                }
            } else if (baseDivideDistance >= 1) {
                if (sign === '+') {
                    increment = +(Math.ceil(baseDivideDistance / 8));
                } else if (sign === '-') {
                    increment = +(Math.ceil(baseDivideDistance / 10));
                }
            }
        }

        return increment;
    }

    // we need both users total scores
    const userQuery = await User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
                totalScore: '$info.specific.whole.totalScore',
                level: '$info.specific.whole.level',
                rank: '$info.specific.whole.rank'
            }
        }
    ]);

    const { totalScore: userTotalScore, level: userLevelObj } = userQuery[0];

    // other user
    const otherUserQuery = await User.aggregate([
        {
            $match: {
                _id: mongoose.Types.ObjectId(otherUserId)
            }
        },
        {
            $project: {
                totalScore: '$info.specific.whole.totalScore',
                level: '$info.specific.whole.level',
                rank: '$info.specific.whole.rank'
            }
        }
    ]);

    const { totalScore: otherUserTotalScore, level: otherUserLevelObj } = otherUserQuery[0];

    // we should get the increment and change the data in user's data
    const userIncrement = handleScoreChange(userTotalScore, otherUserTotalScore, userResult);
    const otherUserIncrement = handleScoreChange(otherUserTotalScore, userTotalScore, otherUserResult);

    // calculating the new rank for both users
    // user
    async function runUserRankFn() {
        try {
            await rankCalculator(userTotalScore, userIncrement, userId);
        } catch (err) {
            setTimeout(() => {
                runUserRankFn();
            }, 500);
        }
    }
    await runUserRankFn();

    // other user
    async function runOtherUserRankFn() {
        try {
            await rankCalculator(otherUserTotalScore, otherUserIncrement, otherUserId);
        } catch (err) {
            setTimeout(( ) => {
                runOtherUserRankFn();
            }, 500);
        }
    }
    await runOtherUserRankFn();


    // handle the level increment
    function levelIncrement(levelObj, increment) {
        // before incrementing, we should check if progress of the level has reached the destination or not
        const { progress, destination, level } = levelObj;
        const newProgress = progress + increment;

        if (newProgress >= destination) {
            // constructing new level object
            const levObj = {};

            // we first level up
            levObj.level = level + 1;

            // set new progress
            levObj.progress = newProgress - destination;

            // set new destination
            levObj.destination = destination + 20;

            return levObj;
        } else {
            // we just change the progress to the newProgress
            const levObj = { ...levelObj };
            levObj.progress = newProgress

            return levObj;
        }
    }

    const userNewLevelObj = levelIncrement(userLevelObj, 6);
    const otherUserNewLevelObj = levelIncrement(otherUserLevelObj, 6);

    // update the totalScore and level and games object
    // user
    await User.updateOne({
        _id: userId
    }, {
        $set: {
            'info.specific.whole.level': userNewLevelObj
        },
        $inc: {
            'info.specific.whole.totalScore': userIncrement,
            'info.specific.whole.games.total': 1,
            [`info.specific.whole.games.${ userResult }`]: 1
        }
    });

    // other user
    await User.updateOne({
        _id: otherUserId
    }, {
        $set: {
            'info.specific.whole.level': otherUserNewLevelObj
        },
        $inc: {
            'info.specific.whole.totalScore': otherUserIncrement,
            'info.specific.whole.games.total': 1,
            [`info.specific.whole.games.${ otherUserResult }`]: 1
        }
    });


    const newUrl = dataEncryption(userId.toString() + '.' + userChallengeId.toString());
    const userChallengeData = {
        _id: userChallengeId,
        opponentChallengeId: otherUserChallengeId,
        url: newUrl,
        close: false,
        result: userResult,
        home: {
            userId: home.userId,
            gamesInRounds: home.gamesInRounds
        },
        away: {
            userId: away.userId,
            gamesInRounds: away.gamesInRounds
        },
        increment: userIncrement
    };

    userChallengeData[userSideInChallenge].result = userResult;
    userChallengeData[userSideInChallenge].increment = userIncrement;
    userChallengeData[otherUserSideInChallenge].result = otherUserResult;
    userChallengeData[otherUserSideInChallenge].increment = otherUserIncrement;
    userChallengeData.endType = type;

    const otherUserChallengeData = {
        ...userChallengeData,
        _id: otherUserChallengeId,
        opponentChallengeId: userChallengeId,
        result: otherUserResult,
        increment: otherUserIncrement
    };

    // we add them to inactive
    // for user
    await Challenge.updateOne({
        userId
    }, {
        $push: {
            'challenges.inactive': userChallengeData
        }
    });

    // for other user
    await Challenge.updateOne({
        userId: otherUserId
    }, {
        $push: {
            'challenges.inactive': otherUserChallengeData
        }
    });

    // we should delete the challenge from active array
    // for user
    await Challenge.updateOne({
        userId: userId
    }, {
        $pull: {
            'challenges.active': { _id: challengeId }
        }
    });

    // for other user
    await Challenge.updateOne({
        userId: otherUserId
    }, {
        $pull: {
            'challenges.active': { _id: otherChallengeId }
        }
    });

    // now we want to see if the are games in daily assignment for both users
    await handleDailyAssignment(userId);
    await handleDailyAssignment(otherUserId);

    async function handleDailyAssignment(userId) {
        const dailyAssignment = await DailyAssignment.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId)
                }
            },
            {
                $unwind: '$challenge'
            },
            {
                $match: {
                    'challenge.completed': false
                }
            },
            {
                $project: {
                    id: '$challenge._id'
                }
            }
        ]);

        if (dailyAssignment[0]) {
            // now we can update it to start
            await DailyAssignment.updateOne({
                userId
            }, {
                $set: {
                    'challenge.$[elem].completed': true
                }
            }, {
                arrayFilters: [ { 'elem._id': dailyAssignment[0].id } ]
            });
        }
    }

    return newUrl;
}

// route for getting data about user's challenges and requests
challengeRouter.get('/', currentUser, auth, async (req, res) => {
    try {
        // const data = await Challenge.findOne({ userId: req.user.id } );

        // we first check if the challenge has expired or not
        let dataQuery = await Challenge.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            }
        ]);

        const finishedChallenges = [];
        dataQuery[0].challenges.active.forEach(activeChallenge => {
            if ((new Date() - new Date(activeChallenge.updatedAt)) >= 6 * ONE_HOUR) {
                if (!activeChallenge.opponentChallengeId) {
                    const q = finishTheChallenge({
                        type: 'anonymous-timeout',
                        challengeId: activeChallenge._id,
                        userId: req.user.id
                    });

                    finishedChallenges.push(q);
                } else {
                    // time is over and the opponent was already determined
                    const winner = activeChallenge.turn === 'home' ? 'away' : 'home';
                    const userId = activeChallenge.home.userId.toString() === req.user.id.toString() ? activeChallenge.home.userId : activeChallenge.away.userId;
                    const otherUserId = activeChallenge.home.userId.toString() === req.user.id.toString() ? activeChallenge.away.userId : activeChallenge.home.userId;
                    const userSide = req.user.id.toString() === activeChallenge.home.userId.toString() ? 'home' : 'away';
                    const otherUserSide = req.user.id.toString() === activeChallenge.home.userId.toString() ? 'away' : 'home';

                    const q = finishTheChallenge({
                        type: 'time',
                        userId,
                        challengeId: activeChallenge._id,
                        userSideInChallenge: userSide,
                        otherUserSideInChallenge: otherUserSide,
                        otherUserId,
                        winnerOnTimeId: activeChallenge[winner].userId
                    });

                    finishedChallenges.push(q);
                }
            }
        });

        await Promise.all(finishedChallenges);

        if (finishedChallenges.length) {
            dataQuery = await Challenge.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(req.user.id)
                    }
                }
            ]);
        }

        const inactiveDataQuery = await Challenge.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$challenges.inactive'
            },
            {
                $match: {
                    'challenges.inactive.close': false
                }
            }
        ]);

        // we queried only data with inactive.close of false which means the user has not closed it yet.
        // we put all of the inactive challenges in an array then add it to main data
        const inactiveArr = inactiveDataQuery.map(da => da.challenges.inactive);
        if (dataQuery[0]) dataQuery[0].challenges.inactive = inactiveArr;
        const data = dataQuery[0];

        const { requests } = data;
        if (requests) {
            let people = await User.aggregate([
                {
                    $match: {
                        _id: { $in: requests.map(req => mongoose.Types.ObjectId(req)) }
                    }
                },
                {
                    $project: {
                        username: 1,
                        status: 1,
                        level: '$info.specific.whole.level.level',
                        totalScore: '$info.specific.whole.totalScore',
                        avatar: '$info.general.avatar',
                        fullName: '$info.general.name'
                    }
                }
            ]);

            people = people.map(person => ({ ...person, _id: dataEncryption(person._id.toString()) }));
            data.requests = people;
        }

        // encrypt the user's id
        data.userId = dataEncryption(data.userId?.toString());

        // determine if it is the user's turn or not
        if (data.challenges.active) {
            data.challenges.active = data.challenges.active.map(activeChallenge => {
                const { turn } = activeChallenge;
                if (activeChallenge[turn] && activeChallenge[turn].userId?.toString() === req.user.id.toString()) return { ...activeChallenge, shouldPlay: true };
                else return { ...activeChallenge, shouldPlay: false };
            });
        }

        // we need to add opponent info to the data
        const activeOpponentIdArr = [];

        if (data.challenges.active) {
            data.challenges.active.forEach(activeChallenge => {
                if (activeChallenge.home && activeChallenge.home.userId.toString() !== req.user.id.toString()) activeOpponentIdArr.push(activeChallenge.home.userId);
                if (activeChallenge.away && activeChallenge.away.userId.toString() !== req.user.id.toString()) activeOpponentIdArr.push(activeChallenge.away.userId);
            });

            data.challenges.inactive.forEach(inactiveChallenge => {
                if (inactiveChallenge.home && inactiveChallenge.home.userId.toString() !== req.user.id.toString()) activeOpponentIdArr.push(inactiveChallenge.home.userId);
                if (inactiveChallenge.away && inactiveChallenge.away.userId.toString() !== req.user.id.toString()) activeOpponentIdArr.push(inactiveChallenge.away.userId);
            });
        }

        // query to get those users' info
        const OpponentQuery = await User.aggregate([
            {
                $match: {
                    _id: { $in: activeOpponentIdArr.map(id => mongoose.Types.ObjectId(id)) }
                }
            },
            {
                $project: {
                    status: 1,
                    fullName: '$info.general.name',
                    avatar: '$info.general.avatar'
                }
            }
        ]);

        const opponentInfoObj = {};

        OpponentQuery.forEach(activeOpponentInfo => {
            opponentInfoObj[activeOpponentInfo._id] = activeOpponentInfo;
            delete activeOpponentInfo._id;
        });

        data.challenges.active.forEach(activeChallenge => {
            if (activeChallenge.home && activeChallenge.home.userId.toString() in opponentInfoObj) {
                activeChallenge.opponentInfo = opponentInfoObj[activeChallenge.home.userId];
            }

            if (activeChallenge.away && activeChallenge.away.userId.toString() in opponentInfoObj) {
                activeChallenge.opponentInfo = opponentInfoObj[activeChallenge.away.userId];
            }
        });

        data.challenges.inactive.forEach(inactiveChallenge => {
            if (inactiveChallenge.home && inactiveChallenge.home.userId.toString() in opponentInfoObj) {
                inactiveChallenge.opponentInfo = opponentInfoObj[inactiveChallenge.home.userId];
            }

            if (inactiveChallenge.away && inactiveChallenge.away.userId.toString() in opponentInfoObj) {
                inactiveChallenge.opponentInfo = opponentInfoObj[inactiveChallenge.away.userId];
            }
        });

        // adding friends for challenge a friend section



        // encrypt the userId in the challenges
        data.challenges.active = data.challenges.active.map(d => ({ ...d, home: { ...d.home, userId: dataEncryption(d.home.userId.toString()) }, away: { ...d.away, userId: dataEncryption(d.away.userId.toString()) } }));
        data.challenges.inactive = data.challenges.inactive.map(d => ({ ...d, home: { ...d.home, userId: dataEncryption(d.home.userId.toString()) }, away: { ...d.away, userId: dataEncryption(d.away.userId.toString()) } }));

        return res.send(data);
    } catch (err ) {
        return res.status(500).send({ 'Error': 'Could not get the data ' + err });
    }
});

// a route for when a new challenge gets created, not a game --> works with New Challenge button
challengeRouter.get('/start', currentUser, auth, async (req, res) => {
    try {
        // we should first check if the active challenges of the user are not more that 20
        const userActiveChallengeQuery = await Challenge.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    activeChallenges: '$challenges.active'
                }
            }
        ]);

        const { activeChallenges } = userActiveChallengeQuery[0];

        if (activeChallenges.length + 1 > MAXIMUM_CHALLENGE_NUMBER) return res.status(400).send({ 'Error': 'You can not have more than 20 active challenges' });

        // we check the user's level and score to know in which queue, we need to query
        // first we choose the closest totalScore to the user in the queue
        const scores = Object.keys(challengeQueue);
        const levels = challengeQueue['0'];

        // we get the totalScore of the user
        const scoreAndLevelQuery = await User.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    _id: 0,
                    'totalScore': '$info.specific.whole.totalScore',
                    'level': '$info.specific.whole.level.level'
                }
            }
        ]);

        const { totalScore, level } = scoreAndLevelQuery[0];

        // finding the closest possible score to the user
        function closeFinder(dataArr, value) {
            const temp = [];

            dataArr.forEach(val => {
                temp.push(Math.abs(value - parseInt(val)));
            });

            return dataArr[temp.indexOf(Math.min(...temp))]
        }

        // closest base on totalScore
        const closestScore = closeFinder(scores, totalScore);

        // closest base on level
        const closestLevel = closeFinder(levels, level);

        // const selectedQueue = challengeQueue[closestScore][closestLevel];
        const selectedQueue = await ChallengeQueue.aggregate([
            {
                $match: {}
            },
            {
                $unwind: `$${ closestScore }.${ closestLevel }`
            },
            {
                $match: {
                    [`${ closestScore }.${ closestLevel }.userId`]: { $ne: mongoose.Types.ObjectId(req.user.id) }
                }
            },
            {
                $project: {
                    _id: 0,
                    userId: `$${ closestScore }.${ closestLevel }.userId`,
                    challengeId: `$${ closestScore }.${ closestLevel }.challengeId`
                }
            }
        ]);

        // now we want to see if the are games in daily assignment
        const dailyAssignment = await DailyAssignment.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$challenge'
            },
            {
                $match: {
                    'challenge.started': false
                }
            },
            {
                $project: {
                    id: '$challenge._id'
                }
            }
        ]);

        if (dailyAssignment[0]) {
            // now we can update it to start
            await DailyAssignment.updateOne({
                userId: req.user.id
            }, {
                $set: {
                    'challenge.$[elem].started': true
                }
            }, {
                arrayFilters: [ { 'elem._id': dailyAssignment[0].id } ]
            });
        }

        if (selectedQueue?.length) {
            const { userId: opponentUserId, challengeId: opponentChallengeId } = selectedQueue[0];

            // we grabbed the one we need then we can remove it from the array
            await ChallengeQueue.updateOne({}, {
                $pop: {
                    [`${ closestScore }.${ closestLevel }`]: -1
                }
            });


            // construct challenge data for the user
            const currentUserChallengeId = new mongoose.Types.ObjectId();

            // check if opponent has played his / her turn (determine the turn)
            // we get also the url of the challenge
            const turnAndUrlQuery = await Challenge.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(opponentUserId)
                    }
                },
                {
                    $unwind: '$challenges.active'
                },
                {
                    $match: {
                        'challenges.active._id': mongoose.Types.ObjectId(opponentChallengeId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        turn: '$challenges.active.turn',
                        url: '$challenges.active.url',
                        home: '$challenges.active.home'
                    }
                }
            ]);

            const { turn, url, home } = turnAndUrlQuery[0];

            const awayFirstGameInRounds = {
                start: 0,
                isOpen: true,
                oneTab: false,
                finish: false,
                gameId: home.gamesInRounds[0].gameId,
                round: 1,
                score: 0,
                updatedAt: new Date().toISOString()
            };

            const data = {
                _id: currentUserChallengeId,
                home: {
                    userId: opponentUserId,
                    gamesInRounds: home.gamesInRounds
                },
                away: {
                    userId: req.user.id,
                    gamesInRounds: home.gamesInRounds.length <= 0 ? [] : [awayFirstGameInRounds]
                },
                turn,
                opponentChallengeId: opponentChallengeId,
                url,
                pending: false
            };

            // add the challenge data to users' challenges
            await Challenge.updateOne({
                userId: req.user.id
            }, {
                $push: {
                    'challenges.active': data
                }
            });

            // add opponentChallengeId for the opponent and set that to currentUserId and set the away property
            await Challenge.updateOne({
                userId: opponentUserId
            }, {
                $set: {
                    'challenges.active.$[elem].opponentChallengeId': currentUserChallengeId,
                    'challenges.active.$[elem].away': {
                        userId: req.user.id,
                        gamesInRounds: [awayFirstGameInRounds]
                    },
                    'challenges.active.$[elem].pending': false
                }
            }, {
                arrayFilters: [ { 'elem._id': opponentChallengeId } ]
            });
        } else {
            // means no match found, so we create the challenge for the user and push it to the queue base on selectedQueue
            const challengeId = new mongoose.Types.ObjectId();
            // generating the url of the challenge
            const url = dataEncryption(`${ req.user.id.toString() }.${ challengeId.toString() }`);
            // constructing data
            const data = {
                _id: challengeId,
                home: {
                    userId: req.user.id,
                    gamesInRounds: []
                },
                away: {
                    userId: new mongoose.Types.ObjectId(),
                    gamesInRounds: []
                },
                turn: 'home',
                url,
                pending: true
            };

            // add the challenge data to users' challenges
            await Challenge.updateMany({
                userId: req.user.id
            }, {
                $push: {
                    'challenges.active': data
                }
            });

            // add the challenge to the proper queue
            // selectedQueue.push({ userId: req.user.id, challengeId });
            await ChallengeQueue.updateOne({}, {
                $push: {
                    [`${ closestScore }.${ closestLevel }`]: { userId: req.user.id, challengeId }
                }
            });

            return res.status(201).send({
                'Message': 'Successfully created a challenge.',
                data: {
                    url,
                    newChallenge: true
                }
            });
        }
    } catch (err) {
        return res.status(400).send({ 'Error': 'Could not create a challenge.' });
    }
});

// a route for providing data about the game statistics after finishing that game by user
challengeRouter.get('/statistics/:type/:encryptedGameData', currentUser, auth, async (req, res) => {
    try {
        const gameId = dataDecryption(req.params.encryptedGameData).split('.')[0];
        const typeParam = req.params.type;
        let type;

        if (typeParam === 'training') type = 'training';
        else if (typeParam === 'challenge') type = 'challenge';
        else throw new Error('');

        const gameQuery = await Game.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$games'
            },
            {
                $match: {
                    'games.gameId': mongoose.Types.ObjectId(gameId),
                    'games.type': 'challenge'
                }
            },
            {
                $project: {
                    _id: 0,
                    'games': '$games'
                }
            }
        ]);

        return res.send(gameQuery);
    } catch (err) {
        return res.status(404).send({ 'Error': 'Could not fetch the data for that game' });
    }
});

// route for inside each challenge
challengeRouter.get('/:challengeEncryptedUrl', currentUser, auth, async (req, res) => {
    try {
        const challengeUrlData = dataDecryption(req.params.challengeEncryptedUrl.toString());
        const [userId, challengeId] = challengeUrlData.split('.');

        let challengeQuery;
        // active
        function activeChallengeQuery() {
            return Challenge.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $unwind: '$challenges.active'
                },
                {
                    $match: {
                        'challenges.active._id': mongoose.Types.ObjectId(challengeId)
                    }
                },
                {
                    $project: {
                        'challengeInfo': '$challenges.active'
                    }
                }
            ]);
        }

        challengeQuery = await activeChallengeQuery();

        if (challengeQuery.length) {
            // we check if the time of the challenge is over
            const activeChallenge = challengeQuery[0].challengeInfo;
            if ((new Date() - new Date(activeChallenge.updatedAt)) >= 6 * ONE_HOUR) {
                const winner = activeChallenge.turn === 'home' ? 'away' : 'home';
                const userId = activeChallenge.home.userId.toString() === req.user.id.toString() ? activeChallenge.home.userId : activeChallenge.away.userId;
                const otherUserId = userId.toString() === activeChallenge.home.userId.toString() ? activeChallenge.away.userId : activeChallenge.home.userId;
                const userSide = req.user.id.toString() === activeChallenge.home.userId.toString() ? 'home' : 'away';
                const otherUserSide = req.user.id.toString() === activeChallenge.home.userId.toString() ? 'away' : 'home';

                await finishTheChallenge({
                    type: 'time',
                    userId,
                    challengeId: activeChallenge._id,
                    userSideInChallenge: userSide,
                    otherUserSideInChallenge: otherUserSide,
                    otherUserId,
                    winnerOnTimeId: activeChallenge[winner].userId
                });
            }

            challengeQuery = await activeChallengeQuery();
        }

        if (!challengeQuery.length) {
            challengeQuery = await Challenge.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $unwind: '$challenges.inactive'
                },
                {
                    $match: {
                        'challenges.inactive._id': mongoose.Types.ObjectId(challengeId)
                    }
                },
                {
                    $project: {
                        'challengeInfo': '$challenges.inactive'
                    }
                }
            ]);
        }

        // .aggregate([
        //     {
        //         $match: {
        //             userId: ObjectId("601679d33a1230395ce4ee54")
        //         }
        //     },
        //     {
        //         $unwind: '$challenges.inactive'
        //     },
        //     {
        //         $match: {
        //             'challenges.inactive._id': ObjectId("603377a3a75e112354df994f")
        //         }
        //     },
        //     {
        //         $project: {
        //             'challengeInfo': '$challenges.inactive'
        //         }
        //     }
        // ]);

        if (!challengeQuery.length) throw new Error('Not Found');


        const queryArr = [
            mongoose.Types.ObjectId(challengeQuery[0].challengeInfo.home.userId),
            mongoose.Types.ObjectId(challengeQuery[0].challengeInfo.away.userId)
        ];

        // query for home and away user information
        const userQuery = await User.aggregate([
            {
                $match: {
                    _id: {
                        $in: queryArr
                    }
                }
            },
            {
                $project: {
                    username: 1,
                    level: '$info.specific.whole.level.level',
                    totalScore: '$info.specific.whole.totalScore',
                    avatar: '$info.general.avatar',
                    status: 1
                }
            }
        ]);

        const homeUser = userQuery.find(user => user._id.toString() === challengeQuery[0].challengeInfo.home.userId.toString());
        const awayUser = userQuery.find(user => user._id.toString() === challengeQuery[0].challengeInfo.away.userId.toString());

        if (homeUser) {
            delete homeUser._id;
            challengeQuery[0].challengeInfo.home.userInfo = homeUser;
        }

        if (awayUser) {
            delete awayUser._id;
            challengeQuery[0].challengeInfo.away.userInfo = awayUser;
        }

        // add game info to gamesInRounds
        const gameIdsTemp = new Set();
        const gameIds = [];

        if (challengeQuery[0].challengeInfo.home && challengeQuery[0].challengeInfo.home.gamesInRounds.length) {
            challengeQuery[0].challengeInfo.home.gamesInRounds.forEach(game => {
                gameIdsTemp.add(game.gameId.toString())
            });
        }

        if (challengeQuery[0].challengeInfo.away && challengeQuery[0].challengeInfo.away.gamesInRounds.length) {
            challengeQuery[0].challengeInfo.away.gamesInRounds.forEach(game => {
                gameIdsTemp.add(game.gameId.toString());
            });
        }

        gameIdsTemp.forEach(g => gameIds.push(g));

        // query for getting game info
        const gameQuery = await AllGame.aggregate([
            {
                $match: {
                    _id: { $in: gameIds.map(g => mongoose.Types.ObjectId(g)) }
                }
            },
            {
                $project: {
                    name: 1,
                    icon: 1
                }
            }
        ]);

        // storing games data base on each game's id
        const gameObj = {};

        gameQuery.forEach(game => {
            gameObj[game._id.toString()] = game;
        });

        if (challengeQuery[0].challengeInfo.home && challengeQuery[0].challengeInfo.home.gamesInRounds.length) {
            challengeQuery[0].challengeInfo.home.gamesInRounds.forEach(game => {
                game.gameInfo = gameObj[game.gameId.toString()];
                delete game.gameId;
            });
        }

        if (challengeQuery[0].challengeInfo.away && challengeQuery[0].challengeInfo.away.gamesInRounds.length) {
            challengeQuery[0].challengeInfo.away.gamesInRounds.forEach(game => {
                game.gameInfo = gameObj[game.gameId.toString()];
                delete game.gameId;
            });
        }

        // we check if the person who sent the request is a visitor or a person who participates in the challenge
        challengeQuery[0].challengeInfo.visitor =
            !(challengeQuery[0].challengeInfo.home.userId.toString() === req.user.id.toString() ||
            challengeQuery[0].challengeInfo.away.userId.toString() === req.user.id.toString());

        // should play logic
        const { turn } = challengeQuery[0].challengeInfo;
        if (turn) challengeQuery[0].challengeInfo.shouldPlay = challengeQuery[0].challengeInfo[turn].userId.toString() === req.user.id.toString();

        // adding the user name of the current user
        challengeQuery[0].challengeInfo.username =
            challengeQuery[0].challengeInfo.home.userId.toString() === req.user.id.toString() ?
                challengeQuery[0].challengeInfo.home.userInfo.username :
                challengeQuery[0].challengeInfo.away.userInfo.username;

        // encrypt the userId
        challengeQuery[0].challengeInfo.home.userId = dataEncryption(challengeQuery[0].challengeInfo.home.userId.toString());
        challengeQuery[0].challengeInfo.away.userId = dataEncryption(challengeQuery[0].challengeInfo.away.userId.toString());


        res.send(challengeQuery[0]);
    } catch (err) {
        return res.status(404).send({ 'Error': 'Not Found  ' + err });
    }
});

// a route for when the user clicks on play button and wants to play a game
challengeRouter.get('/play/:challengeEncryptedUrl/:username', currentUser, auth, async (req, res) => {
    try {
        let userId;
        let challengeId;
        const challengeUrlData = dataDecryption(req.params.challengeEncryptedUrl.toString());
        const [homeUserId, homeChallengeId] = challengeUrlData.split('.');
        if (homeUserId.toString() === req.user.id.toString()) {
            userId = homeUserId;
            challengeId = homeChallengeId;
        } else {
            const awayQuery = await Challenge.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(homeUserId)
                    }
                },
                {
                    $unwind: '$challenges.active'
                },
                {
                    $match: {
                        'challenges.active._id': mongoose.Types.ObjectId(homeChallengeId)
                    }
                },
                {
                    $project: {
                        'challengeId': '$challenges.active.opponentChallengeId',
                        'userId': '$challenges.active.away.userId'
                    }
                }
            ]);

            userId = awayQuery[0].userId;
            challengeId = awayQuery[0].challengeId;
        }

        const challengeQuery = await Challenge.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId)
                }
            },
            {
                $unwind: '$challenges.active'
            },
            {
                $match: {
                    'challenges.active._id': mongoose.Types.ObjectId(challengeId)
                }
            },
            {
                $project: {
                    'challengeInfo': '$challenges.active'
                }
            }
        ]);
        const { challengeInfo } = challengeQuery[0];
        const { turn } = challengeInfo;

        if (challengeInfo && challengeInfo[turn].userId.toString() !== req.user.id.toString()) throw new Error('Bad Request');

        const lastGame = challengeInfo[turn].gamesInRounds.slice(-1)[0];

        // TODO: check the start timing and determine if the time of the game is over.
        if (lastGame && !lastGame.finish) {
            const encryptedGameToPlayId = dataEncryption(lastGame.gameId.toString() + '.' + lastGame._id.toString() + '.' + req.params.username + '.' + turn);
            const encryptedUserAndChallengeInformation = dataEncryption(userId.toString() + '.' + challengeId.toString());
            return res.send({ userId: encryptedUserAndChallengeInformation, gameId: encryptedGameToPlayId });
        }

        // now we know we're dealing with the home and we should generate a new game
        // game should be a new one in the challenge
        // we collect the games we used so far
        const currentChallengeGames = challengeInfo.home.gamesInRounds.map(game => game.gameId.toString());

        // now we bring all of the games
        const gameQuery = await AllGame.find();

        // determine which games haven't been played
        const possibleGamesToPlay = gameQuery.filter(g => !currentChallengeGames.includes(g._id.toString()));

        // now we choose the game randomly
        const gameToPlay = possibleGamesToPlay[Math.floor(Math.random() * possibleGamesToPlay.length)];

        // now we should add this game to gamesInRounds in both home and away of the user and also home and away of the other user
        // constructing data
        const userGameId = new mongoose.Types.ObjectId();
        const opponentGameId = new mongoose.Types.ObjectId();

        const userGameData = {
            _id: userGameId,
            start: undefined,
            finish: false,
            score: 0,
            round: lastGame ? lastGame.round + 1 : 1,
            gameId: gameToPlay._id,
        };

        const opponentTurn = turn === 'home' ? 'away' : 'home';

        const opponentGameData = { ...userGameData, _id: opponentGameId };

        // add it to the user's gamesInRounds data
        await Challenge.updateOne({
            userId: req.user.id,
            'challenges.active._id': challengeId
        }, {
            $push: {
                [`challenges.active.$.${ turn }.gamesInRounds`]: userGameData,
                [`challenges.active.$.${ opponentTurn }.gamesInRounds`]: opponentGameData
            }
        });

        const opponentId = challengeInfo.home.userId.toString() === req.user.id ? challengeInfo.away.userId : challengeInfo.home.userId;

        // add it to the other user's gameInRounds data
        await Challenge.updateOne({
            userId: opponentId,
            'challenges.active._id': challengeInfo.opponentChallengeId
        }, {
            $push: {
                [`challenges.active.$.${ turn }.gamesInRounds`]: userGameData,
                [`challenges.active.$.${ opponentTurn }.gamesInRounds`]: opponentGameData
            }
        });

        const encryptedGameToPlayId = dataEncryption(gameToPlay._id.toString() + '.' + userGameId.toString() + '.' + req.params.username + '.' + turn);
        const encryptedUserAndChallengeInformation = dataEncryption(userId.toString() + '.' + challengeId.toString());

        return res.send({ userId: encryptedUserAndChallengeInformation, gameId: encryptedGameToPlayId });
    } catch (err) {
        return res.status(400).send({ 'Error': 'Bad Request' });
    }
});

// a route for handling which game to play and send it to client
challengeRouter.get('/game/:challengeEncryptedUrl/:encryptedGameId', currentUser, auth, async (req, res) => {
    try {
        const encryptedChallengeId = dataDecryption(req.params.challengeEncryptedUrl.toString());
        const encryptedGameId = dataDecryption(req.params.encryptedGameId.toString());
        const gameId = encryptedGameId.split('.')[0];
        const username = encryptedGameId.split('.')[2];


        const userGameId = encryptedGameId.split('.')[1];
        const challengeId = encryptedChallengeId.split('.')[1];
        const userTurn = encryptedGameId.split('.')[3];

        // query for getting data about that game
        const challengeGameQuery = await Challenge.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id),

                }
            },
            {
                $unwind: '$challenges.active'
            },
            {
                $match: {
                    'challenges.active._id': mongoose.Types.ObjectId(challengeId)
                }
            },
            {
                $unwind: `$challenges.active.${ userTurn }.gamesInRounds`
            },
            {
                $match: {
                    [`challenges.active.${ userTurn }.gamesInRounds._id`]: mongoose.Types.ObjectId(userGameId)
                }
            },
            {
                $project: {
                    start: `$challenges.active.${ userTurn }.gamesInRounds.start`,
                    finish: `$challenges.active.${ userTurn }.gamesInRounds.finish`
                }
            }
        ]);

        if (!challengeGameQuery.length) return res.status(404).send({ 'Error': 'Not Found' });

        const { start, finish } = challengeGameQuery[0];

        // finding the game and sending back the game name
        const allGameQuery = await AllGame.findOne({ _id: gameId }, { _id: 0, name: 1, bestPlayers: 1, information: 1, howToPlay: 1 });

        // we need to get the information of the top best players of this game
        const userQuery = await User.aggregate([
            {
                $match: {
                    _id: { $in: allGameQuery.bestPlayers.map(player => mongoose.Types.ObjectId(player.userId)) }
                }
            },
            {
                $project: {
                    username: 1,
                    avatar: '$info.general.avatar',
                    status: '$status.text'
                }
            }
        ]);

        const bestPlayersData = [];

        allGameQuery.bestPlayers.forEach(bestPlayer => {
            const userData = userQuery.find(user => user._id.toString() === bestPlayer.userId.toString());

            if (userData) {
                const userDataClone = JSON.parse(JSON.stringify(userData));
                delete userDataClone._id;
                bestPlayersData.push({ ...userDataClone, score: bestPlayer.score });
            }
        });

        // we need to know if this was user's first attempt for this game
        const gameQuery = await Game.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$games'
            },
            {
                $match: {
                    'games.gameId': mongoose.Types.ObjectId(gameId)
                }
            },
            {
                $count: 'games'
            }
        ]);

        return res.send({
            name: allGameQuery.name,
            username,
            start,
            finish,
            bestPlayers: bestPlayersData,
            firstAttempt: gameQuery.length === 0,
            information: allGameQuery.information,
            howToPlay: allGameQuery.howToPlay
        });
    } catch (err) {
        return res.status(404).send({ 'Error': 'Not Found' });
    }
});

// route for when socket tries to get information about a game in a challenge
challengeRouter.get('/gameSocket/:challengeEncryptedUrl/:encryptedGameId', currentUser, auth, async (req, res) => {
    try {
        const encryptedChallengeId = dataDecryption(req.params.challengeEncryptedUrl.toString());
        const encryptedGameId = dataDecryption(req.params.encryptedGameId.toString());

        const userGameId = encryptedGameId.split('.')[1];
        const challengeId = encryptedChallengeId.split('.')[1];
        const userTurn = encryptedGameId.split('.')[3];

        // query for getting data about that game
        const gameQuery = await Challenge.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id),

                }
            },
            {
                $unwind: '$challenges.active'
            },
            {
                $match: {
                    'challenges.active._id': mongoose.Types.ObjectId(challengeId)
                }
            },
            {
                $unwind: `$challenges.active.${ userTurn }.gamesInRounds`
            },
            {
                $match: {
                    [`challenges.active.${ userTurn }.gamesInRounds._id`]: mongoose.Types.ObjectId(userGameId)
                }
            },
            {
                $project: {
                    game: `$challenges.active.${ userTurn }.gamesInRounds`,
                    url: '$challenges.active.url'
                }
            }
        ]);

        // to get the gameName
        const allGameQuery = await AllGame.findOne({ _id: userGameId }, { _id: 0, name: 1 });

        if (!gameQuery.length) return res.status(404).send({ 'Error': 'Not Found' });

        gameQuery[0].turn = userTurn;

        return res.send({ ...gameQuery[0], ...allGameQuery });
    } catch (err) {
        return res.status(404).send({ 'Error': 'Not Found' });
    }
});

// route for when a game gets over and we want to show some analysis to the user
challengeRouter.get('/gameAnalysis/:type/:encryptedGameId', currentUser, auth, async (req, res) => {
    try {
        let type = 'challenge';
        if (req.params.type.toString() === 'training') type = 'training';

        const encryptedGameId = dataDecryption(req.params.encryptedGameId.toString());
        const gameId = encryptedGameId.split('.')[0];

        // query for the specific game played by the user
        const last30GameQuery = await Game.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$games'
            },
            {
                $match: {
                    'games.gameId': mongoose.Types.ObjectId(gameId),
                    'games.type': type
                }
            },
            {
                $project: {
                    _id: 0,
                    'score': '$games.score',
                    createdAt: '$games.createdAt'
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $limit: 30
            }
        ]);

        const top5GameQuery = await Game.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$games'
            },
            {
                $match: {
                    'games.gameId': mongoose.Types.ObjectId(gameId),
                    'games.type': type
                }
            },
            {
                $project: {
                    _id: 0,
                    score: '$games.score'
                }
            },
            {
                $sort: {
                    score: -1
                }
            },
            {
                $limit: 5
            }
        ]);

        return res.send({ last30Attempts: last30GameQuery, top5: top5GameQuery });
    } catch (err) {
        return res.status(500).send({ Error: 'Could not fetch the data' });
    }
});

// a route for when a new challenge gets created from a request, not a game --> when request gets accepted
challengeRouter.get('/request/:encryptedUserId', currentUser, auth, async (req, res) => {
    try {
        const opponentId = dataDecryption(req.params.encryptedUserId.toString());

        // we should first check if the active challenges of the user are not more that 20
        const userActiveChallengeQuery = await Challenge.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    activeChallenges: '$challenges.active'
                }
            }
        ]);

        const { activeChallenges } = userActiveChallengeQuery[0];

        if (activeChallenges.length + 1 > MAXIMUM_CHALLENGE_NUMBER) return res.status(400).send({ 'Error': 'You can not have more than 20 active challenges' });

        // we want to change that person's userRequestCounter data
        await Challenge.updateOne({
            userId: opponentId
        }, {
            $inc: {
                'userRequestCounter.pending': -1,
                'userRequestCounter.accepted': 1
            }
        });

        const userChallengeId = new mongoose.Types.ObjectId();
        const opponentChallengeId = new mongoose.Types.ObjectId();

        const challengeUrl = dataEncryption(req.user.id + '.' + userChallengeId);

        const userData = {
            _id: userChallengeId,
            opponentChallengeId,
            home: {
                userId: req.user.id,
                gamesInRounds: []
            },
            away: {
                userId: opponentId,
                gamesInRounds: []
            },
            turn: 'home',
            url: challengeUrl,
            pending: false
        };

        const opponentData = {
            _id: opponentChallengeId,
            opponentChallengeId: userChallengeId,
            home: {
                userId: req.user.id,
                gamesInRounds: []
            },
            away: {
                userId: opponentId,
                gamesInRounds: []
            },
            turn: 'home',
            url: challengeUrl,
            pending: false
        }

        async function createChallenge(userId, data) {
            await Challenge.updateOne({
                userId,
            }, {
                $push: {
                    'challenges.active': data
                }
            });
        }

        // add the challenge to user's active challenges
        await createChallenge(req.user.id, userData);

        // add the challenge to opponent's active challenges
        await createChallenge(opponentId, opponentData);

        // we need to delete the request from user's requests
        await Challenge.updateOne({
            userId: req.user.id
        }, {
            $pull: {
                requests: opponentId
            }
        });

        // encrypting the userId for sending to the client
        userData.home.userId = dataEncryption(userData.home.userId.toString());
        userData.away.userId = dataEncryption(userData.away.userId.toString());

        // now we want to see if the are games in daily assignment for both users
        await handleDailyAssignment(req.user.id);
        await handleDailyAssignment(opponentId);

        async function handleDailyAssignment(userId) {
            const dailyAssignment = await DailyAssignment.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $unwind: '$challenge'
                },
                {
                    $match: {
                        'challenge.started': false
                    }
                },
                {
                    $project: {
                        id: '$challenge._id'
                    }
                }
            ]);

            if (dailyAssignment[0]) {
                // now we can update it to start
                await DailyAssignment.updateOne({
                    userId
                }, {
                    $set: {
                        'challenge.$[elem].started': true
                    }
                }, {
                    arrayFilters: [ { 'elem._id': dailyAssignment[0].id } ]
                });
            }
        }

        return res.send(userData);
    } catch (err) {
        return res.status(400).send({ 'Error': 'Could not create the challenge' });
    }
});

// route for when a request gets rejected
challengeRouter.delete('/request/:encryptedUserId', currentUser, auth, async (req, res) => {
    try {
        const userIdToDelete = dataDecryption(req.params.encryptedUserId.toString());

        async function deleteUserRequest(userIdToDelete) {
            await Challenge.updateOne({
                userId: userIdToDelete
            }, {
                $inc: {
                    'userRequestCounter.pending': -1,
                    'userRequestCounter.rejected': 1
                }
            });
        }

        if (userIdToDelete === 'all') {
            // first we handle the userRequestCounter of each user that his/her challenge request is about to get rejected
            const userIds = await Challenge.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(req.user.id)
                    }
                },
                {
                    $unwind: '$requests'
                },
                {
                    $project: {
                        ids: '$requests.userId'
                    }
                }
            ]);

            const usersRejectedRequests = userIds.map(id => deleteUserRequest(id));
            await Promise.all(usersRejectedRequests);


            await Challenge.updateOne({
                userId: req.user.id
            }, {
                $set: {
                    requests: []
                }
            });

            return res.send({ 'Message': 'Successfully deleted the request' });
        }

        // we first reject the request for that user
        await deleteUserRequest(userIdToDelete);

        await Challenge.updateOne({
            userId: req.user.id
        }, {
            $pull: {
                requests: userIdToDelete
            }
        });

        return res.send({ 'Message': 'Successfully deleted the request' });
    } catch (err) {
        res.status(500).send({ 'Error': 'Could not delete the request' });
    }
});

// route for when a game gets started for a player
challengeRouter.patch('/game/start', currentUser, auth, async (req, res) => {
    try {
        const { start, turn, challengeEncryptedData, gameEncryptedData, round, oneTab, reason } = req.body;

        const [homeUserId, homeUserChallengeId] = dataDecryption(challengeEncryptedData.toString()).split('.');

        const awayData = await Challenge.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(homeUserId)
                }
            },
            {
                $unwind: '$challenges.active'
            },
            {
                $match: {
                    'challenges.active._id': mongoose.Types.ObjectId(homeUserChallengeId)
                }
            },
            {
                $project: {
                    awayChallengeId: '$challenges.active.opponentChallengeId',
                    awayUserId: '$challenges.active.away.userId'
                }
            }
        ]);

        const { awayChallengeId, awayUserId } = awayData[0];

        if (typeof oneTab !== 'undefined') {
            await updateChallenge(homeUserId, homeUserChallengeId, 'oneTab', oneTab);
            await updateChallenge(awayUserId, awayChallengeId, 'oneTab', oneTab);
            return res.send({ 'Message': 'Successful' });
        }

        async function updateChallenge(id, challengeId, property, value) {
            await Challenge.updateOne({
                userId: id,
                'challenges.active': {
                    $elemMatch: {
                        _id: challengeId
                    }
                }
            }, {
                $set: {
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.${ property }`]: value
                }
            });
        }

        // update the start in both users data
        // home user
        await updateChallenge(homeUserId, homeUserChallengeId, 'start', start);

        // away user
        await updateChallenge(awayUserId, awayChallengeId, 'start', start);

        return res.send({ 'Message': 'Successful' });
    } catch (err) {
        return res.status(400).send({ 'Error': 'Could not update the data' });
    }
});

// route for when a game gets finished for a player
challengeRouter.patch('/game/finish', currentUser, auth, async (req, res) => {
    try {
        const {
            finish,
            challengeEncryptedData,
            gameEncryptedData,
            turn,
            round,
            averageResponseTime,
            booster,
            maxBooster,
            consecutiveTrue,
            right,
            wrong,
            score,
            gameId,
            oneTab
        } = req.body;

        const [userId, challengeId] = dataDecryption(challengeEncryptedData.toString()).split('.');

        const otherPersonTurn = turn === 'home' ? 'away' : 'home';

        const otherPersonData = await Challenge.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId)
                }
            },
            {
                $unwind: '$challenges.active'
            },
            {
                $match: {
                    'challenges.active._id': mongoose.Types.ObjectId(challengeId)
                }
            },
            {
                $project: {
                    otherChallengeId: '$challenges.active.opponentChallengeId',
                    otherUserId: `$challenges.active.${ otherPersonTurn }.userId`,
                    gamesInRounds: `$challenges.active.${ turn }.gamesInRounds`
                }
            }
        ]);

        const { otherChallengeId, otherUserId, gamesInRounds } = otherPersonData[0];

        // if (type && type === 'surrender') {
        //     const winnerUserId = req.user.id.toString() === userId.toString() ? otherUserId : userId;
        //
        //     await finishTheChallenge({
        //         type,
        //         userId,
        //         otherUserId,
        //         challengeId,
        //         winnerBySurrenderId: winnerUserId
        //     });
        // }

        const isOpen = gamesInRounds[round - 1].isOpen;

        if (isOpen === false) throw new Error();

        // update the data in both users
        if (finish) {
            // new Turn
            const newTurn = turn === 'home' ? 'away' : 'home';

            // the user
            await Challenge.updateOne({
                userId,
                'challenges.active': {
                    $elemMatch: {
                        _id: challengeId
                    }
                }
            }, {
                $set: {
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.finish`]: finish,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.score`]: score,
                    [`challenges.active.$.turn`]: newTurn,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.isOpen`]: false,
                }
            });

            // other user
            await Challenge.updateOne({
                userId: otherUserId,
                'challenges.active': {
                    $elemMatch: {
                        _id: otherChallengeId
                    }
                }
            }, {
                $set: {
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.finish`]: finish,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.score`]: score,
                    [`challenges.active.$.turn`]: newTurn,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.isOpen`]: false,
                }
            });

            /* Start handling brain information update */
            // after each game, we should update the brain information about the user
            // to get the type of the game
            const gameQuery = await AllGame.findOne({
                _id: gameId
            }, {
                _id: 0,
                type: 1,
                bestPlayers: 1,
                categories: 1
            });

            const { type: gameType, bestPlayers, categories } = gameQuery;

            const abstractBrainTraits = ['responseInhibition', 'informationProcessing', 'selectiveAttention', 'dividedAttention'];

            const gameTypes = categories.map(cat => cat.name);

            const typesProjection = {};
            typesProjection.accuracy = '$info.specific.detailed.brain.accuracy';

            gameTypes.forEach(gType => {
                if (abstractBrainTraits.includes(gType)) typesProjection[gType] = `$info.specific.abstract.brain.${ gType }`;
                else typesProjection[gType] = `$info.specific.detailed.brain.${ gType }`;
            });

            // we need to get the previous score of that type in brain information
            const gameTypeUserScoreQuery = await User.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(userId)
                    }
                },
                {
                    $project: typesProjection
                }
            ]);

            // now we need to know how many times the user has played this game in the challenges
            // we first need to grab the games which has this gameType
            const gamesTypesQuery = await AllGame.aggregate([
                {
                    $match: {
                        categories: {
                            $elemMatch: {
                                name: {
                                    $in: gameTypes
                                }
                            }
                        }
                    }
                },
                {
                    $project: {
                        _id: 1,
                        categories: 1
                    }
                }
            ]);

            // now we search through the games that were played by the user
            const gamesPlayedCount = await Game.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(req.user.id)
                    }
                },
                {
                    $unwind: '$games'
                },
                {
                    $match: {
                        'games.gameId': { $in: gamesTypesQuery.map(game => mongoose.Types.ObjectId(game._id)) }
                    }
                },
                {
                    $group: {
                        _id: '$games.gameId',
                        count: { $sum: 1 }
                    }
                }
            ]);

            // to get the number of games the user has played for calculating accuracy
            const totalGamesPlayedCount = await Game.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(req.user.id)
                    }
                },
                {
                    $project: {
                        count: { $size: '$games' }
                    }
                }
            ]);

            const typeNewResult = {
                detailed: {},
                abstract: {}
            };

            gameTypes.forEach(gType => {
                const typeInfoArr = [];

                gamesTypesQuery.forEach(game => {
                    const categoryObj = game.categories.find(cat => cat.name === gType);
                    let gameCount = 0;
                    if (gamesPlayedCount.length && gamesPlayedCount.find(g => g._id.toString() === game._id.toString())) gameCount = gamesPlayedCount.find(g => g._id.toString() === game._id.toString()).count;
                    if (categoryObj) typeInfoArr.push({ ...categoryObj, count: gameCount });
                });

                let typeSumValue = 0;
                let typeAbundanceValue = 0;

                typeInfoArr.forEach(categoryDataObj => {
                    const typeCurrentValue = gameTypeUserScoreQuery[0][gType];
                    typeSumValue += parseFloat(categoryDataObj.count * typeCurrentValue * categoryDataObj.coefficient);
                    typeAbundanceValue += parseInt(categoryDataObj.count * categoryDataObj.coefficient);
                });

                const userPlayedGameTypeCoefficient = categories.find(cat => cat.name === gType).coefficient;

                let typeNewValue = (
                    (typeSumValue +
                    ((parseFloat((score / 120000).toFixed(2))) * userPlayedGameTypeCoefficient))
                    / (typeAbundanceValue + userPlayedGameTypeCoefficient)
                );



                // now we can set the new value of the type
                if (typeNewValue < 0) typeNewValue = 0;
                if (typeNewValue > 1) typeNewValue = 1;

                if (abstractBrainTraits.includes(gType)) typeNewResult.abstract[gType] = parseFloat(typeNewValue.toFixed(2));
                else typeNewResult.detailed[gType] = parseFloat(typeNewValue.toFixed(2));
            });

            const userNewTypeValueUpdate = {};
            const differenceValues = {
                detailed: [],
                abstract: []
            };

            Object.keys(typeNewResult.detailed).forEach(type => {
                userNewTypeValueUpdate[`info.specific.detailed.brain.${ type }`] = typeNewResult.detailed[type];
                // calculate the difference
                differenceValues.detailed.push({ name: type, amount: typeNewResult.detailed[type] - gameTypeUserScoreQuery[0][type] });
            });

            Object.keys(typeNewResult.abstract).forEach(type => {
                userNewTypeValueUpdate[`info.specific.abstract.brain.${ type }`] = typeNewResult.abstract[type];
                // calculate the difference
                differenceValues.abstract.push({ name: type, amount: typeNewResult.abstract[type] - gameTypeUserScoreQuery[0][type] });
            });

            // calculate the accuracy
            const newAccuracy = parseFloat((right / (right + wrong)).toFixed(2));
            let newTotalAccuracy = parseFloat((
                (totalGamesPlayedCount[0].count * gameTypeUserScoreQuery[0].accuracy) + newAccuracy
                / (totalGamesPlayedCount[0].count + 1)
            ).toFixed(2));

            if (newTotalAccuracy > 1) newTotalAccuracy = 1;
            if (newTotalAccuracy < 0) newTotalAccuracy = 0;

            userNewTypeValueUpdate['info.specific.detailed.brain.accuracy'] = newTotalAccuracy

            differenceValues.detailed.push({ name: 'accuracy', amount: newAccuracy });

            // we update the brain info
            await User.updateOne({
                _id: userId
            }, {
                $set: userNewTypeValueUpdate
            });

            /* End of handling brain information update */

            // we should send the data to games collection for the user
            await Game.updateOne({
                userId
            }, {
                $push: {
                    'games': {
                        gameId,
                        type: 'challenge',
                        score,
                        right,
                        wrong,
                        scoreChangedInType: differenceValues,
                        averageResponseTime,
                        maxBooster
                    }
                }
            });

            if (bestPlayers) {
                // we need to check if the user's score belongs to top 10 players of this game
                if (bestPlayers.length < 10) {
                    // we push the user and his/her score to the list
                    // constructing the data
                    const bestPlayerData = {
                        userId,
                        score
                    };

                    await AllGame.updateOne({
                        _id: gameId
                    }, {
                        $push: {
                            bestPlayers: bestPlayerData
                        }
                    });
                }

                // we check to see if the score of the user is bigger than whatever is in the bestPlayers array
                let isBigger = false;
                bestPlayers.forEach(player => {
                    if (score > player.score) isBigger = true;
                });

                if (isBigger) {
                    // we first remove find the smallest one
                    let min = Infinity;
                    bestPlayers.forEach(player => {
                        min = Math.min(min, player.score);
                    });

                    // then we remove the smallest from the array
                    // we need index of that part to remove it
                    const minIndex = bestPlayers.findIndex(player => player.score === min);
                    bestPlayers.splice(minIndex, 1);

                    // now we add the user and his/her score to the array
                    bestPlayers.push({ userId, score });

                    // then we set the new bestPlayers in the game data
                    await AllGame.updateOne({
                        _id: gameId
                    }, {
                        $set: {
                            bestPlayers
                        }
                    })
                }
            }

            // // we need to get the score of the user on that game type
            // const typeQuery = await User.aggregate([
            //     {
            //         $match: {
            //             _id: userId
            //         }
            //     },
            //     {
            //         $project: {
            //             typeScore: `$info.specific.detailed.brain.${ gameType }`
            //         }
            //     }
            // ])
            //
            // const { typeScore } = typeQuery[0];

            // we want to send a notification to other user
            if (!(round >= 3 && turn === 'away')) {
                const user = await User.aggregate([
                    {
                        $match: {
                            _id: mongoose.Types.ObjectId(otherUserId)
                        }
                    },
                    {
                        $project: {
                            _id: 0,
                            status: 1,
                            username: 1
                        }
                    }
                ]);

                // we need to make sure that the user's notification is on
                const settingQuery = await Setting.aggregate([
                    {
                        $match: {
                            userId: mongoose.Types.ObjectId(req.user.id)
                        }
                    },
                    {
                        $unwind: '$privacy'
                    },
                    {
                        $match: {
                            privacy: 'Enable notification'
                        }
                    },
                    {
                        $count: 'count'
                    }
                ]);

                if (user[0] && settingQuery[0] && user[0].status.text === 'offline') {
                    const authorization = jwt.sign({ text: 'Adasik-Platform' }, keys.JWT_NOTIFICATION_SECRET);
                    makeRequest('http://127.0.0.1:4000/send-notification', 'POST', {
                        headers: {
                            'Authorization': `Bearer ${ authorization }`,
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            userId: dataEncryption(otherUserId.toString()),
                            username: req.user.username,
                            type: 'challenge-game'
                        })
                    }).catch();
                }

                if (user[0]) return res.send({ Message: 'Successful', data: { toUsername: user[0].username } });
                return res.send({ Message: 'Successful' });
            }

            // check if the challenge is over
            if (round >= 3 && turn === 'away') {
                const newUrl = await finishTheChallenge(({
                    type: 'normal',
                    userId,
                    userSideInChallenge: turn,
                    otherUserSideInChallenge: otherPersonTurn,
                    challengeId,
                    otherUserId
                }));

                return res.send({ Message: 'Successful', data: { url: newUrl } });
            }
        } else {
                // home user
            await Challenge.updateOne({
                userId: userId,
                'challenges.active': {
                    $elemMatch: {
                        _id: challengeId
                    }
                }
            }, {
                $set: {
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.finish`]: false,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.score`]: score,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.consecutiveTrue`]: consecutiveTrue,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.averageResponseTime`]: averageResponseTime,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.booster`]: booster,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.maxBooster`]: Number(maxBooster),
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.right`]: right,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.wrong`]: wrong,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.oneTab`]: oneTab,
                }
            });

            // away user
            await Challenge.updateOne({
                userId: otherUserId,
                'challenges.active': {
                    $elemMatch: {
                        _id: otherChallengeId
                    }
                }
            }, {
                $set: {
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.finish`]: false,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.score`]: score,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.consecutiveTrue`]: consecutiveTrue,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.averageResponseTime`]: averageResponseTime,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.booster`]: booster,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.maxBooster`]: maxBooster,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.right`]: right,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.wrong`]: wrong,
                    [`challenges.active.$.${ turn }.gamesInRounds.${ round - 1 }.oneTab`]: oneTab
                }
            });
        }

        return res.send({ 'Message': 'Successful' });
    } catch (err) {
        return res.status(400).send({ 'Error': 'Could not update the data ' + err });
    }
});

// route for when user wants to close a result or all of them
challengeRouter.get('/results/:challengeId', currentUser, auth, async (req, res) => {
    try {
        const challengeId = req.params.challengeId.toString();

        if (challengeId === 'all') {
            // means close all of the results
            await Challenge.updateOne({
                userId: req.user.id
            }, {
                'challenges.inactive.$[elem].close': true
            },{
                arrayFilters: [{ 'elem.close': false  }]
            });

            return res.send({ 'Message': 'Successfully closed the results' });
        }

        // now it means there is only one challenge to change
        await Challenge.updateOne({
            userId: req.user.id,
            'challenges.inactive._id': challengeId
        }, {
            'challenges.inactive.$.close': true
        });

        return res.send({ 'Message': 'Successfully closed the result' });
    } catch (err) {
        return res.status(500).send({ 'Error': 'Could not close the result' });
    }
});

// route for challenging a friend or friends
challengeRouter.post('/request', currentUser, auth, async (req, res) => {
    try {
        const { ids } = req.body;

        // list of the decrypted ids that we want to send a request to
        const uncheckedIdList = ids.map(id => dataDecryption(id.toString()));

        // we also check if the that user has blocked the user
        const blockQuery = await Block.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$blocks'
            },
            {
                $match: {
                    blocks: {
                        $in: uncheckedIdList.map(id => mongoose.Types.ObjectId(id))
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    isBlocked: '$blocks'
                }
            }
        ]);

        if (blockQuery.length === uncheckedIdList.length) return res.send({ Message: 'Successful .' });

        const blockData = blockQuery.map(bQ => bQ.isBlocked.toString());

        const idList = uncheckedIdList.filter(id => !blockData.includes(id));

        // update the number of pending requests in userRequestCounter property
        // we first check if the the number of user's requests and active challenges don't exceed 20
        const challengeQuery = await Challenge.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    activeChallenges: '$challenges.active',
                    userPendingRequests: '$userRequestCounter.pending'
                }
            }
        ]);

        const { activeChallenges, userPendingRequests } = challengeQuery[0];

        if (activeChallenges.length > MAXIMUM_CHALLENGE_NUMBER) return res.status(400).send({ 'ChallengeError': 'Your challenges are more than 20' });
        if (userPendingRequests + idList.length > MAXIMUM_REQUEST_NUMBER) return res.status(400).send({ 'RequestError': 'Your requests are more than 50' });

        // now that everything is fine, we continue
        await Challenge.updateOne({
            userId: req.user.id
        }, {
            $inc: {
                'userRequestCounter.pending': idList.length
            }
        });

        // now we send the request to them
        await Challenge.updateOne({
            userId: { $in: idList }
        }, {
            $addToSet: {
                requests: req.user.id
            }
        });

        // we want to send notification to them
        const users = await User.aggregate([
            {
                $match: {
                    _id: {
                        $in: idList.map(id => mongoose.Types.ObjectId(id))
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: 1,
                    username: 1
                }
            }
        ]);

        if (users && users.length) {
            const authorization = jwt.sign({ text: 'Adasik-Platform' }, keys.JWT_NOTIFICATION_SECRET);
            users.forEach(user => {
                // we need to make sure that the user's notification is on
                Setting.aggregate([
                    {
                        $match: {
                            userId: mongoose.Types.ObjectId(req.user.id)
                        }
                    },
                    {
                        $unwind: '$privacy'
                    },
                    {
                        $match: {
                            privacy: 'Enable notification'
                        }
                    },
                    {
                        $count: 'count'
                    }
                ])
                    .then(res => {
                        if (res[0] && user.status.text === 'offline') {
                            makeRequest('http://127.0.0.1:4000/send-notification', 'POST', {
                                headers: {
                                    'Authorization': `Bearer ${ authorization }`,
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    userId: dataEncryption(user._id.toString()),
                                    username: req.user.username,
                                    type: 'challenge-request'
                                })
                            }).catch();
                        }
                    });
            });
        }

        return res.send({ Message: 'Successfully send request to ' + JSON.stringify(users.map(u => u.username)) + ' ..' });
    } catch (err) {
        return res.status(400).send({ 'Error': 'Bad Request' });
    }
});

module.exports = challengeRouter;