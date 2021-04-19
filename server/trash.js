// messengerAction status
// state.conversationData.userId !== action.payload.conversationPersonId ?
//     state.conversationData.messages :
//     state.conversationData.messages.map(
//         m => m._id === action.payload.messageId ? { ...m, status: action.payload.status } : m)

// ++++++++++++++ requireOnline +++++++++++
// import React, { useState, useEffect } from 'react';
// import Loading from "../components/layout/utils/Loading/Loading";
//
// const requireOnline = (Component) => {
//     function NewComponent({ isOffline, ...props }) {
//         if (isOffline && isOffline[0] === true) {
//             return (
//                 <div>
//                     Offline
//                 </div>
//             );
//         }
//
//         if (isOffline && isOffline[0] === false) {
//             return <Component { ...props } />
//         }
//
//         return <Loading text="Fetching data..." />;
//     }
//
//     return NewComponent
// }
//
// export default requireOnline;

// ++++++++ NOTIFICATION SERVER ++++++++ //
// async function sendNotification() {
//     webPush.setVapidDetails(
//         'mailto:erfana11@yahoo.com',
//         'BDh5U8KiKCsjoD5HvlUgLkD6L6YfWwK0RO6Xa-xL1rr0gIHPbhngE4wLECpfh5obf4yU2R0WLXweJqrNkiWFzy4',
//         'k74KJAOlxNKsVIiJfDJD9DxaUNoNNSBTU192-SMFInM'
//     );
//
//     const subscribers = await Subscription.find();
//
//     subscribers.forEach(({ endpoint, keys }) => {
//         const pushConfig = {
//             endpoint,
//             keys
//         };
//
//         const notification = {
//             title: 'New Post',
//             content: 'New post added!',
//             openUrl: 'http://127.0.0.1:8080/dashboard'
//         };
//
//         webPush.sendNotification(pushConfig, JSON.stringify(notification))
//             .catch(err => console.log('Notification did not send: ', err));
//     });
// }


// TYPE INCREMENT --> we change it to another system and user average score
// function calculateTypeIncrement(type) {
//     let increment = .01;
//     const diff = score - TYPE_STANDARD[type];
//     const small = Math.min(TYPE_STANDARD[type], score);
//     const big = Math.max(TYPE_STANDARD[type], score);
//
//     const magnitude = ((big / small) / 100).toFixed(2);
//
//     let sign = '=';
//     if (diff > 0) sign = '+';
//     else if (diff < 0) sign = '-';
//
//     if (sign === '+') increment = magnitude;
//     if (sign === '-') increment = -magnitude;
//
//     return increment;
// }
//
// const userIncrement = calculateTypeIncrement(gameType);


// // ranking with no conflict
// // step 1 multiply by -1
// await Ranking.updateMany({
//     rank: {$in: rankArr}
// }, {
//     $mul: {rank: -1}
// });
//
// // step 2
// await Ranking.updateMany({
//     rank: {$in: rankArr.map(r => r * -1)}
// }, {
//     $inc: {rank: -1}
// });
//
// // step 3 we should change the initial rank of the user to avoid any conflict with new rank
// await Ranking.updateOne({
//     rank
// }, {
//     rank: currentRank * -1
// });
//
// // step 4
// await Ranking.updateMany({
//     rank: {$in: rankArr.map(r => (r * -1) - 1)}
// }, {
//     $mul: {rank: -1}
// });
//
// // step 5 we change the new rank of the user to sth that should be
// await Ranking.updateOne({
//     rank: currentRank * -1
// }, {
//     $mul: {rank: -1}
// });
//
// // route for when players gets new score and should be added to challenges, scoresInRounds.
// challengeRouter.patch('/update', currentUser, auth, async (req, res) => {
//     try {
//         const { opponentId, score, userChallengeId, start } = req.body; // TODO: client can send any score!
//
//         // get whose turn it is to add data to
//         const query = await Challenge.aggregate([
//             {
//                 $match: {
//                     userId: mongoose.Types.ObjectId(req.user.id)
//                 }
//             },
//             {
//                 $unwind: '$challenges.active'
//             },
//             {
//                 $match: {
//                     'challenges.active._id': mongoose.Types.ObjectId(userChallengeId)
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     'turn': '$challenges.active.turn'
//                 }
//             }
//         ]);
//
//         const { turn } = query[0];
//         const currentTurn = turn === 'home' ? 'away' : 'home';
//
//         // TODO: TEST THIS:
//         // opponent's challenge id
//         const chQuery = await Challenge.findOne({
//             userId: req.user.id,
//             'challenges.active._id': userChallengeId
//         }, {
//             _id: 0,
//             'challenges.active.0.opponentChallengeId': 1
//         });
//
//         const { opponentChallengeId } = chQuery.challenges.active[0];
//
//         // add new score to user's data base on whose turn it is.
//         await Challenge.updateOne({
//             userId: req.user.id,
//             'challenges.active._id': userChallengeId
//         }, {
//             $push: {
//                 [`challenges.active.$.${ turn }.scoresInRounds`]: score
//             },
//             $set: {
//                 'challenges.active.$.turn': currentTurn
//             }
//         });
//
//         // add new score to opponent's data base on whose turn it is.
//         await Challenge.updateOne({
//             userId: opponentId,
//             'challenges.active._id': opponentChallengeId
//         }, {
//             $push: {
//                 [`challenges.active.$.${ turn }.scoresInRounds`]: score
//             },
//             $set: {
//                 'challenges.active.$.turn': currentTurn
//             }
//         });
//
//         // we need to specify if the game is over
//         const resQuery = await Challenge.aggregate([
//             {
//                 $match: {
//                     userId: mongoose.Types.ObjectId(req.user.id)
//                 }
//             },
//             {
//                 $unwind: '$challenges.active'
//             },
//             {
//                 $match: {
//                     'challenges.active._id': mongoose.Types.ObjectId('6002c34dd3b3473530317e2a')
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     'homeUserId': '$challenges.active.home.userId',
//                     'awayUserId': '$challenges.active.away.userId',
//                     'homeSize': {
//                         $size: '$challenges.active.home.scoresInRounds'
//                     },
//                     'awaySize': {
//                         $size: '$challenges.active.away.scoresInRounds'
//                     },
//                     'homeScoreAdd': {
//                         $sum: '$challenges.active.home.scoresInRounds'
//                     },
//                     'awayScoreAdd': {
//                         $sum: '$challenges.active.away.scoresInRounds'
//                     }
//                 }
//             }
//         ]);
//
//         const { homeUserId, awayUserId, homeSize, awaySize, homeScoreAdd, awayScoreAdd } = resQuery[0];
//
//         if (homeSize === FINISH_NUMBER && awaySize === FINISH_NUMBER) {
//             // game is over
//             // TODO: score system need to improve, it should include difference in the games result.
//             // we need to specify who has won the game
//             let winner;
//             if (homeScoreAdd > awayScoreAdd) {
//                 // home won
//                 winner = homeUserId === req.user.id ? 'user' : 'opponent';
//             } else if (homeScoreAdd === awayScoreAdd) winner = 'none';
//
//             async function afterFinished(userId, userChallengeId, userTotalScore, opponentTotalScore, gameResult) {
//                 const sign = (userTotalScore - opponentTotalScore) < 0 ? '-' : '+';
//                 const distance = Math.abs(userTotalScore - opponentTotalScore);
//                 const baseDivideDistance = BASE_DISTANCE / distance;
//                 let increment;
//
//                 if (gameResult === 'win') {
//                     if (baseDivideDistance < 1) {
//                         if (sign === '+') {
//                             increment = +(Math.ceil(baseDivideDistance * 20));
//                         } else if (sign === '-') {
//                             increment = +(Math.ceil(baseDivideDistance * 300));
//                         }
//                     } else if (baseDivideDistance >= 1) {
//                         if (sign === '+') {
//                             increment = +(Math.ceil(baseDivideDistance * (3 / 5)));
//                         } else if (sign === '-') {
//                             increment = +(Math.ceil(baseDivideDistance * (4 / 5)));
//                         }
//                     }
//                 } else if (gameResult === 'lose') {
//                     if (baseDivideDistance < 1) {
//                         if (sign === '+') {
//                             increment = -(Math.floor(baseDivideDistance * 200));
//                         } else if (sign === '-') {
//                             increment = -(Math.floor(baseDivideDistance * 15));
//                         }
//                     } else if (baseDivideDistance >= 1) {
//                         if (sign === '+') {
//                             increment = -(Math.floor(baseDivideDistance / 8));
//                         } else if (sign === '-') {
//                             increment = -(Math.floor(baseDivideDistance / 10));
//                         }
//                     }
//                 } else if (gameResult === 'draw') {
//                     if (baseDivideDistance < 1) {
//                         if (sign === '+') {
//                             increment = -(Math.floor(baseDivideDistance * 100));
//                         } else if (sign === '-') {
//                             increment = +(Math.ceil(baseDivideDistance * 110));
//                         }
//                     } else if (baseDivideDistance >= 1) {
//                         if (sign === '+') {
//                             increment = +(Math.ceil(baseDivideDistance / 8));
//                         } else if (sign === '-') {
//                             increment = +(Math.ceil(baseDivideDistance / 10));
//                         }
//                     }
//                 }
//
//                 // now we know how much to increment (or decrement) we need to add it to user's data in the database
//                 await User.updateOne({ _id: req.user.id }, {
//                     $inc: {
//                         'info.specific.whole.totalScore': increment
//                     }
//                 });
//
//                 // we should change the challenge result of the user in the database
//                 await Challenge.updateOne({ userId, 'challenges.active._id': userChallengeId }, {
//                     'challenges.active.$.result': gameResult
//                 });
//
//                 // we should transfer the challenge from active challenges to inactive challenges
//                 // we get the challenge
//                 const chQuery = await Challenge.aggregate([
//                     {
//                         $match: {
//                             userId: mongoose.Types.ObjectId(userId)
//                         }
//                     },
//                     {
//                         $unwind: '$challenges.active'
//                     },
//                     {
//                         $match: {
//                             'challenges.active._id': mongoose.Types.ObjectId(userChallengeId)
//                         }
//                     }
//                 ]);
//
//                 const challenge = chQuery[0];
//
//                 // we delete the challenge from active array TODO: TEST THIS...
//                 await Challenge.updateOne({ userId, 'challenges.active._id': userChallengeId }, {
//                     $pull: {
//                         'challenges.active': {
//                             _id: userChallengeId
//                         }
//                     }
//                 });
//
//                 // we add it to the inactive array
//                 await Challenge.updateOne({ userId }, {
//                     $push: {
//                         'challenges.inactive': challenge
//                     }
//                 });
//             }
//
//             // to get user and opponent totalScore
//             // user totalScore
//             const userScoreQuery = await User.aggregate([
//                 {
//                     $match: {
//                         _id: mongoose.Types.ObjectId(req.user.id)
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: 0,
//                         'totalScore': '$info.specific.whole.totalScore'
//                     }
//                 }
//             ]);
//
//             // opponent totalScore
//             const opponentScoreQuery = await User.aggregate([
//                 {
//                     $match: {
//                         _id: mongoose.Types.ObjectId(opponentId)
//                     }
//                 },
//                 {
//                     $project: {
//                         _id: 0,
//                         'totalScore': '$info.specific.whole.totalScore'
//                     }
//                 }
//             ]);
//
//             const { totalScore: userTotalScore } = userScoreQuery[0];
//             const { totalScore: opponentTotalScore } = opponentScoreQuery[0];
//
//             // we run the function for both players base on the result of the challenge
//             if (winner === 'user') {
//                 // for the user
//                 await afterFinished(req.user.id, userChallengeId, userTotalScore, opponentTotalScore, 'win');
//                 // for the opponent
//                 await afterFinished(opponentId, opponentChallengeId, opponentTotalScore, userTotalScore, 'lose');
//
//             } else if (winner === 'opponent') {
//                 // for the user
//                 await afterFinished(req.user.id, userChallengeId, userTotalScore, opponentTotalScore, 'lose');
//                 // for the opponent
//                 await afterFinished(opponentId, opponentChallengeId, opponentTotalScore, userTotalScore, 'win');
//
//             } else if (winner === 'none') {
//                 // for the user
//                 await afterFinished(req.user.id, userChallengeId, userTotalScore, opponentTotalScore, 'draw');
//                 // for the opponent
//                 await afterFinished(opponentId, opponentChallengeId, opponentTotalScore, userTotalScore, 'draw');
//             }
//         }
//
//         return res.send({ 'Message': 'Successfully Updated' });
//     } catch (err) {
//         return res.status(400).send({ 'Error': 'Could not update the data' });
//     }
// });
//
//
// /*  Finish Challenge */
//
// // we should remove the challenge from active challenges and move it to inactive
// // first move it to inactive array
// // we need to get the information about home and away, so we get it from one of the users
// const userChallengeQuery = await Challenge.aggregate([
//     {
//         $match: {
//             userId: mongoose.Types.ObjectId(userId)
//         }
//     },
//     {
//         $unwind: '$challenges.active'
//     },
//     {
//         $match: {
//             'challenges.active._id': mongoose.Types.ObjectId(challengeId)
//         }
//     },
//     {
//         $project: {
//             active: '$challenges.active'
//         }
//     }
// ]);
//
// const { home, away } = userChallengeQuery[0].active;
// const userSide = home.userId.toString() === userId.toString() ? home : away;
// const otherUserSide = home.userId.toString() === otherUserId.toString() ? home : away;
//
// // constructing data
// const userChallengeId = new mongoose.Types.ObjectId();
// const otherUserChallengeId = new mongoose.Types.ObjectId();
//
// function editGamesInRounds(side) {
//     side.gamesInRounds.forEach(game => {
//         delete game._id
//         delete game.updatedAt;
//         delete game.averageResponseTime;
//         delete game.booster;
//         delete game.consecutiveTrue;
//         delete game.maxBooster;
//         delete game.right;
//         delete game.wrong;
//     });
// }
//
// editGamesInRounds(userSide);
// editGamesInRounds(otherUserSide);
//
// let userResult = 'draw';
// let otherUserResult = 'draw';
// const userScore = userSide.gamesInRounds.reduce((acc, game) => acc + game.score, 0);
// const otherUserScore = otherUserSide.gamesInRounds.reduce((acc, game) => acc + game.score, 0);
//
// if (userScore > otherUserScore) {
//     userResult = 'win';
//     otherUserResult = 'lose';
// }
//
// if (userScore < otherUserScore) {
//     userResult = 'lose';
//     otherUserResult = 'win';
// }
//
// // we need to handle the increase or decrease of the score and level
// function handleScoreChange(userTotalScore, otherUserTotalScore, result) {
//     const sign = (userTotalScore - otherUserTotalScore) < 0 ? '-' : '+';
//     const distance = Math.abs(userTotalScore - otherUserTotalScore);
//     const baseDivideDistance = BASE_DISTANCE / distance;
//     let increment;
//
//     if (result === 'win') {
//         if (baseDivideDistance < 1) {
//             if (sign === '+') {
//                 increment = +(Math.ceil(baseDivideDistance * 20));
//             } else if (sign === '-') {
//                 increment = +(Math.ceil(baseDivideDistance * 300));
//             }
//         } else if (baseDivideDistance >= 1) {
//             if (sign === '+') {
//                 increment = +(Math.ceil(baseDivideDistance * (3 / 5)));
//             } else if (sign === '-') {
//                 increment = +(Math.ceil(baseDivideDistance * (4 / 5)));
//             }
//         }
//     } else if (result === 'lose') {
//         if (baseDivideDistance < 1) {
//             if (sign === '+') {
//                 increment = -(Math.floor(baseDivideDistance * 200));
//             } else if (sign === '-') {
//                 increment = -(Math.floor(baseDivideDistance * 15));
//             }
//         } else if (baseDivideDistance >= 1) {
//             if (sign === '+') {
//                 increment = -(Math.floor(baseDivideDistance / 8));
//             } else if (sign === '-') {
//                 increment = -(Math.floor(baseDivideDistance / 10));
//             }
//         }
//     } else if (result === 'draw') {
//         if (baseDivideDistance < 1) {
//             if (sign === '+') {
//                 increment = -(Math.floor(baseDivideDistance * 100));
//             } else if (sign === '-') {
//                 increment = +(Math.ceil(baseDivideDistance * 110));
//             }
//         } else if (baseDivideDistance >= 1) {
//             if (sign === '+') {
//                 increment = +(Math.ceil(baseDivideDistance / 8));
//             } else if (sign === '-') {
//                 increment = +(Math.ceil(baseDivideDistance / 10));
//             }
//         }
//     }
//
//     return increment;
// }
//
// // we need both users total scores
// const userQuery = await User.aggregate([
//     {
//         $match: {
//             _id: mongoose.Types.ObjectId(userId)
//         }
//     },
//     {
//         $project: {
//             totalScore: '$info.specific.whole.totalScore',
//             level: '$info.specific.whole.level'
//         }
//     }
// ]);
//
// const { totalScore: userTotalScore, level: userLevelObj } = userQuery[0];
//
// // other user
// const otherUserQuery = await User.aggregate([
//     {
//         $match: {
//             _id: mongoose.Types.ObjectId(otherUserId)
//         }
//     },
//     {
//         $project: {
//             totalScore: '$info.specific.whole.totalScore',
//             level: '$info.specific.whole.level'
//         }
//     }
// ]);
//
// const { totalScore: otherUserTotalScore, level: otherUserLevelObj } = otherUserQuery[0];
//
// // we should get the increment and change the data in user's data
// const userIncrement = handleScoreChange(userTotalScore, otherUserTotalScore, userResult);
// const otherUserIncrement = handleScoreChange(otherUserTotalScore, userTotalScore, otherUserResult);
//
// // handle the level increment
// function levelIncrement(levelObj, increment) {
//     // before incrementing, we should check if progress of the level has reached the destination or not
//     const { progress, destination, level } = levelObj;
//     const newProgress = progress + increment;
//
//     if (newProgress >= destination) {
//         // constructing new level object
//         const levObj = {};
//
//         // we first level up
//         levObj.level = level + 1;
//
//         // set new progress
//         levObj.progress = newProgress - destination;
//
//         // set new destination
//         levObj.destination = destination + 20;
//
//         return levObj;
//     } else {
//         // we just change the progress to the newProgress
//         const levObj = { ...levelObj };
//         levObj.progress = newProgress
//
//         return levObj;
//     }
// }
//
// const userNewLevelObj = levelIncrement(userLevelObj, 6);
// const otherUserNewLevelObj = levelIncrement(otherUserLevelObj, 6);
//
// // update the totalScore and level and games object
// // user
// await User.updateOne({
//     _id: userId
// }, {
//     $set: {
//         'info.specific.whole.level': userNewLevelObj
//     },
//     $inc: {
//         'info.specific.whole.totalScore': userIncrement,
//         'info.specific.whole.games.total': 1,
//         [`info.specific.whole.games.${ userResult }`]: 1
//     }
// });
//
// // other user
// await User.updateOne({
//     _id: otherUserId
// }, {
//     $set: {
//         'info.specific.whole.level': otherUserNewLevelObj
//     },
//     $inc: {
//         'info.specific.whole.totalScore': otherUserIncrement,
//         'info.specific.whole.games.total': 1,
//         [`info.specific.whole.games.${ otherUserResult }`]: 1
//     }
// });
//
//
// const newUrl = dataEncryption(userId.toString() + '.' + userChallengeId.toString());
// const userChallengeData = {
//     _id: userChallengeId,
//     opponentChallengeId: otherUserChallengeId,
//     url: newUrl,
//     close: false,
//     result: userResult,
//     home: {
//         userId: home.userId,
//         gamesInRounds: home.gamesInRounds
//     },
//     away: {
//         userId: away.userId,
//         gamesInRounds: away.gamesInRounds
//     },
//     increment: userIncrement
// };
//
// userChallengeData[turn].result = userResult;
// userChallengeData[turn].increment = userIncrement;
// userChallengeData[otherPersonTurn].result = otherUserResult;
// userChallengeData[otherPersonTurn].increment = otherUserIncrement;
//
// const otherUserChallengeData = {
//     ...userChallengeData,
//     _id: otherUserChallengeId,
//     opponentChallengeId: userChallengeId,
//     result: otherUserResult,
//     increment: otherUserIncrement
// };
//
// // we add them to inactive
// // for user
// await Challenge.updateOne({
//     userId: userId
// }, {
//     $push: {
//         'challenges.inactive': userChallengeData
//     }
// });
//
// // for other user
// await Challenge.updateOne({
//     userId: otherUserId
// }, {
//     $push: {
//         'challenges.inactive': otherUserChallengeData
//     }
// });
//
// // we should delete the challenge from active array
// // for user
// await Challenge.updateOne({
//     userId: userId
// }, {
//     $pull: {
//         'challenges.active': { _id: challengeId }
//     }
// });
//
// // for other user
// await Challenge.updateOne({
//     userId: otherUserId
// }, {
//     $pull: {
//         'challenges.active': { _id: otherChallengeId }
//     }
// });
//
// return res.send({ 'Message': 'Successful', data: { url: newUrl } });