const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middlewares/auth');
const currentUser = require('../middlewares/currentUser');

const statisticsRouter = express.Router();
const User = mongoose.model('User');
const History = mongoose.model('History');
const Game = mongoose.model('Game');
const AllGame = mongoose.model('AllGame');

const RETRIEVE_AMOUNT = 30;

statisticsRouter.get('/', currentUser, auth, async (req, res) => {
    try {
        // constructing data
        const data = {};

        // getting brain and personality data
        const userData = await User.findOne({ _id: req.user.id }, {
            'info.specific.whole.games': 1,
            'info.specific.detailed': 1
        });

        data.brain = userData.info.specific.detailed.brain;
        data.personality = userData.info.specific.detailed.personality;
        data.games = userData.info.specific.whole.games;

        // getting history data about totalScore, trainingScore, rank and assignment's completion
        const historyQuery = await History.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    _id: 0,
                    totalScore: { $slice: ['$totalScore', -RETRIEVE_AMOUNT] },
                    trainingScore: { $slice: ['$trainingScore', -RETRIEVE_AMOUNT] },
                    rank: { $slice: ['$rank', -RETRIEVE_AMOUNT] },
                    assignment: { $slice: ['$assignment', -RETRIEVE_AMOUNT] }
                }
            }
        ]);
        const historyData = historyQuery[0];

        data.history = historyData;

        // getting data about user's strengths in different categories and games in each category
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
                $group: {
                    _id: '$games.gameId',
                    count: { $sum: 1 }
                }
            }
        ]);

        // now we get each game info
        const allGameQuery = await AllGame.find({ _id: gameQuery.map(g => g._id) }, { type: 1, name: 1 });

        const allGameData = {};

        allGameQuery.forEach(({ _id, name, type }) => {
            allGameData[_id] = { name, type };
        });

        const newGameData = gameQuery.map(({ _id, count }) => {
            return {
                name: allGameData[_id].name,
                type: allGameData[_id].type,
                count
            };
        });

        data.gamesData = newGameData;

        res.send(data);
    } catch (err) {
        res.status(500).send({ 'Error': 'Could not get or construct the data.' });
    }
});

module.exports = statisticsRouter;