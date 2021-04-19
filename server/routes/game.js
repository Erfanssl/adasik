const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middlewares/auth');
const currentUser = require('../middlewares/currentUser');

const gameRouter = express.Router();
const Game = mongoose.model('Game');
const User = mongoose.model('User');

const TYPE_STANDARD = {
    speed: 250000
};

// number of games that we want to send to client in the GET request.
const GAMES_TO_RETRIEVE = 5;

gameRouter.post('/', currentUser, auth, async (req, res) => {
    try {
        const { type = 'speed', gameScore, training, gameName } = req.body;

        async function levelIncrement(increment) {
            // before incrementing, we should check if progress of the level has reached the destination or not
            const levelQuery = await User.findOne({ _id: req.user.id }, { _id: 0, 'info.specific.whole.level': 1 });
            const levelObj = levelQuery.info.specific.whole.level;
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

                // update level
                await User.updateOne({ _id: req.user.id }, {
                    $set: {
                        'info.specific.whole.level': levObj
                    }
                });
            } else {
                // we just change the progress to the newProgress
                await User.updateOne({ _id: req.user.id }, {
                    $set: {
                        'info.specific.whole.level.progress': newProgress
                    }
                });
            }
        }

        // we determine the type of the game --> training or a challenge game
        if (training) {
            // we increase the level's progress by 2
            await levelIncrement(2);

            // we need to change the trainingScore
            const baseIncrementer = 100;
            const incAmount = (gameScore / TYPE_STANDARD[type]) * baseIncrementer;

            await User.updateOne({ _id: req.user.id }, {
                $inc: {
                    'info.specific.whole.trainingScore': incAmount
                }
            });
        } else if (!training) {
            // we increase the level's progress by 6
            await levelIncrement(6);
        }

        // update the brain data
        // we get the type (type) of the game and current score of that in the brain data
        const typeQuery = await User.findOne({ _id: req.user.id }, { [`info.specific.detailed.brain.${ type }`]: 1 });
        const typeScore = typeQuery.info.specific.detailed.brain[type];

        // we need to check how many times this type has been played by the user
        const quantityQuery = await Game.aggregate([
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
                    'games.type': type
                }
            },
            {
                $count: 'total'
            }
        ]);

        const numberOfGames = quantityQuery[0].total;

        const currentTypeScore = (typeScore * numberOfGames + (gameScore / TYPE_STANDARD[type])) / numberOfGames + 1;

        // we update the type with the new value
        await User.updateOne({ _id: req.user.id }, {
            $set: {
                [`info.specific.detailed.brain.${ type }`]: currentTypeScore
            }
        });

        // we add the game to the games
        // constructing the data
        const gameData = {
            name: gameName,
            type,
            training,
            score: gameScore
        };

        await Game.updateOne({ userId: req.user.id }, {
            $push: {
                games: gameData
            }
        });

        res.status(201).send({ 'Message': 'Successfully created and changed data base on the new game' });
    } catch (err) {
        res.status(400).send({ 'Error': 'Could not create and change data base on the new game' });
    }
});


// a route for when client wants to know about a game (e.g. top 5 scores of that game)
gameRouter.get('/:gameType/:gameName', currentUser, auth, async (req, res) => {
    const { gameType = 'speed', gameName = 'Anticipation' } = req.params;

    const query = await Game.aggregate([
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
                'games.type': gameType,
                'games.name': gameName
            }
        },
        {
            $project: {
                _id: 0,
                'score': '$games.score'
            }
        },
        {
            $sort: {
                'score': -1
            }
        },
        {
            $limit: GAMES_TO_RETRIEVE
        }
    ]);

    const scoreArrayDescending = query.map(val => val.score);

    res.send(scoreArrayDescending);
});

module.exports = gameRouter;