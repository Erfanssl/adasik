const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middlewares/auth');
const currentUser = require('../middlewares/currentUser');

const trainingRouter = express.Router();
const AllGame = mongoose.model('AllGame');
const Game = mongoose.model('Game');
const User = mongoose.model('User');
const History = mongoose.model('History');
const DailyAssignment = mongoose.model('DailyAssignment');

const TYPE_STANDARD = {
    speed: 150000,
    flexibility: 100000
};

trainingRouter.get('/', currentUser, auth, async (req, res) => {
    try {
        const data = await AllGame.find();

        return res.send(data);
    } catch (err) {
        return res.status(500).send({ 'Error': 'Could not get or construct the data.' });
    }
});

// route for when a game gets over
trainingRouter.patch('/finish', currentUser, auth, async (req, res) => {
    try {
        async function executeObject(obj) {
            const { gameName, score, right, wrong, newMaxBooster:maxBooster, averageResponseTime } = obj;

            // we get id of the game
            const allGameQuery = await AllGame.findOne({ name: gameName }, { type: 1 });

            if (!allGameQuery) return res.status(404).send({ Error: 'Game Not Found' });

            // we add the game to user's game-list
            await Game.updateOne({
                userId: req.user.id
            }, {
                $push: {
                    games: {
                        gameId: allGameQuery._id,
                        type: 'training',
                        score,
                        right,
                        wrong,
                        averageResponseTime,
                        maxBooster
                    }
                }
            });

            // we get the trainingScore and the level object
            const userQuery = await User.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(req.user.id)
                    }
                },
                {
                    $project: {
                        trainingScore: '$info.specific.whole.trainingScore',
                        levelObj: '$info.specific.whole.level'
                    }
                }
            ]);

            // now we need to know the user's trainingScore increment base on the score he/she got
            function calculateTrainingScoreIncrement(type) {
                let increment = 2;
                const diff = score - TYPE_STANDARD[type];
                const small = Math.min(TYPE_STANDARD[type], score);
                const big = Math.max(TYPE_STANDARD[type], score);

                const magnitude = parseFloat((big / small).toFixed(2));

                let sign = '=';
                if (diff > 0) sign = '+';
                else if (diff < 0) sign = '-';

                if (sign === '+') increment = magnitude;
                if (sign === '-') increment = -magnitude;

                return increment;
            }

            const trainingScoreIncrement = calculateTrainingScoreIncrement(allGameQuery.type);
            const newTrainingScore = userQuery[0].trainingScore + trainingScoreIncrement;

            // now level
            function levelIncrement(levelObj, increment) {
                // before incrementing, we should check if progress of the level has reached the destination or not
                const { progress, destination, level } = levelObj;
                const newProgress = progress + Number(increment);

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

            const newLevelObj = levelIncrement(userQuery[0].levelObj, 1);

            // now we save the data
            await User.updateOne({
                _id: req.user.id
            }, {
                $set: {
                    'info.specific.whole.trainingScore': Number(newTrainingScore.toFixed(0)),
                    'info.specific.whole.level': newLevelObj
                },
                $inc: {
                    'info.specific.whole.trainings': 1
                }
            });

            // we need to also push to history.trainingScore array
            await History.updateOne({
                userId: req.user.id
            }, {
                $push: {
                    trainingScore: Number(newTrainingScore.toFixed(0))
                }
            });

            // we should return the top 5 score of that game
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
                        'games.gameId': mongoose.Types.ObjectId(allGameQuery._id),
                        'games.type': 'training'
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

            // we should return the last 30 attempts of that game
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
                        'games.gameId': mongoose.Types.ObjectId(allGameQuery._id),
                        'games.type': 'training'
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

            // now we want to check if the game was part of the daily assignment, if yes, we want to mark it as completed
            const dailyAssignment = await DailyAssignment.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(req.user.id)
                    }
                },
                {
                    $unwind: '$training'
                },
                {
                    $match: {
                        'training.link': `/${ gameName.toLowerCase().split(' ').join('-') }`,
                        'training.completed': false
                    }
                }
            ]);

            if (dailyAssignment[0]) {
                // now we can update it to completed
                await DailyAssignment.updateOne({
                    userId: req.user.id
                }, {
                    $set: {
                        'training.$[elem].completed': true
                    }
                }, {
                    arrayFilters: [ { 'elem.link': `/${ gameName.toLowerCase().split(' ').join('-') }` } ]
                });
            }

            return res.send({ last30Attempts: last30GameQuery, top5: top5GameQuery });
        }

        if (Array.isArray(req.body)) {
            await Promise.all(req.body.map(data => executeObject(data)));
            return res.send({ Message: 'Successful' });
        } else return await executeObject(req.body);
    } catch(err) {
        return res.status(500).send({ Error: 'Could not save the data' });
    }
});

module.exports = trainingRouter;