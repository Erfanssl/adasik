// AllGame.create([
//     {
//         name: 'Memory Racer',
//         type: 'speed',
//         howToPlay: 'Try to ...',
//         bestPlayers: ['601679d33a1230395ce4ee51'],
//         Information: 'It is a good game for improving your memory!'
//     },
//     {
//         name: 'Anticipation',
//         type: 'speed',
//         howToPlay: 'Try to ...',
//         bestPlayers: ['601679d33a1230395ce4ee51'],
//         Information: 'It is a good game for improving your Anticipation and Accuracy!'
//     },
//     {
//         name: 'Mental Flex',
//         type: 'flexibility',
//         howToPlay: 'Try to ...',
//         bestPlayers: ['601679d33a1230395ce4ee51'],
//         Information: 'It is a good game for improving your Mental Flexibility!'
//     }
// ]);

// const testId = new mongoose.Types.ObjectId();
//
// AllTest.create({
//     _id: testId,
//     name: 'personality start',
//     type: 'personality',
//     information: 'This test helps to recognize personalities',
//     icon: ''
// });
//
// Test.updateOne({ userId: '601679d33a1230395ce4ee51' }, {
//     $push: {
//         tests: {
//             testId: testId,
//             result: 'big emotional score',
//             startAt: Date.now(),
//             endAt: Date.now()
//         }
//     }
// });

// Block.create([
//     {
//         userId: '601679d33a1230395ce4ee57',
//         blocks: [],
//         currentlyBlocking: 0,
//         userGotBlockedCounter: 0,
//         userDidBlockCounter:0
//     },
//     {
//         userId: '601679d33a1230395ce4ee51',
//         blocks: [],
//         currentlyBlocking: 0,
//         userGotBlockedCounter: 0,
//         userDidBlockCounter:0
//     },
//     {
//         userId: '6044f4b00a40ae0388d232e3',
//         blocks: [],
//         currentlyBlocking: 0,
//         userGotBlockedCounter: 0,
//         userDidBlockCounter:0
//     }
// ]);

// Like.create([
//     {
//         userId: '601679d33a1230395ce4ee51',
//         likes: [],
//         dislikes: [],
//         userLikes: [],
//         userDislikes: []
//     },
//     {
//         userId: '6044f4b00a40ae0388d232e3',
//         likes: [],
//         dislikes: [],
//         userLikes: [],
//         userDislikes: []
//     },
//     {
//         userId: '601679d33a1230395ce4ee57',
//         likes: [],
//         dislikes: [],
//         userLikes: [],
//         userDislikes: []
//     }
// ]);


// Game.create({
//     userId: '601679d33a1230395ce4ee51',
//     games: [
//         {
//             gameId: '6029e836e1c84011482c138c',
//             type: 'challenge',
//             score: 750,
//             right: 30,
//             wrong: 10,
//             averageResponseTime: 350
//         },
//         {
//             gameId: '6029e836e1c84011482c138a',
//             type: 'challenge',
//             score: 1600,
//             right: 40,
//             wrong: 15,
//             averageResponseTime: 350
//         },
//         {
//             gameId: '6029e836e1c84011482c138b',
//             type: 'challenge',
//             score: 100520,
//             right: 350,
//             wrong: 15,
//             averageResponseTime: 250
//         },
//         {
//             gameId: '6029e836e1c84011482c138a',
//             type: 'challenge',
//             score: 2750,
//             right: 150,
//             wrong: 15,
//             averageResponseTime: 290
//         },
//         {
//             gameId: '6029e836e1c84011482c138c',
//             type: 'challenge',
//             score: 950,
//             right: 150,
//             wrong: 15,
//             averageResponseTime: 300
//         },
//         {
//             gameId: '6029e836e1c84011482c138b',
//             type: 'challenge',
//             score: 200520,
//             right: 390,
//             wrong: 10,
//             averageResponseTime: 230
//         },
//         {
//             gameId: '6029e836e1c84011482c138a',
//             type: 'training',
//             score: 2750,
//             right: 150,
//             wrong: 15,
//             averageResponseTime: 290
//         },
//         {
//             gameId: '6029e836e1c84011482c138c',
//             type: 'training',
//             score: 950,
//             right: 150,
//             wrong: 15,
//             averageResponseTime: 300
//         },
//         {
//             gameId: '6029e836e1c84011482c138b',
//             type: 'training',
//             score: 200520,
//             right: 390,
//             wrong: 10,
//             averageResponseTime: 230
//         },
//         {
//             gameId: '6029e836e1c84011482c138b',
//             type: 'training',
//             score: 200520,
//             right: 390,
//             wrong: 10,
//             averageResponseTime: 230
//         },
//         {
//             gameId: '6029e836e1c84011482c138a',
//             type: 'training',
//             score: 20520,
//             right: 150,
//             wrong: 15,
//             averageResponseTime: 350
//         },
//         {
//             gameId: '6029e836e1c84011482c138a',
//             type: 'training',
//             score: 20520,
//             right: 190,
//             wrong: 10,
//             averageResponseTime: 330
//         },
//     ]
// });

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

// History.create({
//     userId: '601679d33a1230395ce4ee51',
//     totalScore: [250, 300, 260, 250, 320, 400, 450, 410, 500, 550],
//     trainingScore: [10, 20, 50, 40, 200, 150, 300, 250, 300, 280],
//     rank: [1000, 800, 750, 800, 820, 760, 700, 650, 710, 640],
//     assignment: [.2, .3, 1, .5, .3, 0, .9, .9, 1, .7]
// })

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

// db.messengers.updateOne({
//     _id:  ObjectId("60002eac3c600b24285125f0")
// }, {
//     $set: {
//         'persons.0.messages.2.type': 'regular',
//         'persons.0.messages.3.reply':   ObjectId("60002eac3c600b24285125f3")
//     }
// })

// const id1 = new mongoose.Types.ObjectId();
// const id1Ref = new mongoose.Types.ObjectId();
// const id2 = new mongoose.Types.ObjectId();
// const id2Ref = new mongoose.Types.ObjectId();
// const id3 = new mongoose.Types.ObjectId();
// const id3Ref = new mongoose.Types.ObjectId();
// const id4 = new mongoose.Types.ObjectId();
// const id4Ref = new mongoose.Types.ObjectId();
// const id5 = new mongoose.Types.ObjectId();
// const id5Ref = new mongoose.Types.ObjectId();
// const id6 = new mongoose.Types.ObjectId();
// const id6Ref = new mongoose.Types.ObjectId();
// const id7 = new mongoose.Types.ObjectId();
// const id7Ref = new mongoose.Types.ObjectId();
// const id8 = new mongoose.Types.ObjectId();
// const id8Ref = new mongoose.Types.ObjectId();
// const id9 = new mongoose.Types.ObjectId();
// const id9Ref = new mongoose.Types.ObjectId();
// Messenger.create([
//     {
//         userId: '601679d33a1230395ce4ee51',
//         persons: [
//             {
//                 userId: '601679d33a1230395ce4ee54',
//                 messages: [
//                     {
//                         _id: id1,
//                         message: 'Helloooooo James!',
//                         type: 'regular',
//                         from: '601679d33a1230395ce4ee51',
//                         to: '601679d33a1230395ce4ee54',
//                         status: 'seen',
//                         toMessageId: id1Ref
//                     },
//                     {
//                         _id: id2,
//                         message: 'How are you?!',
//                         type: 'regular',
//                         from: '601679d33a1230395ce4ee51',
//                         to: '601679d33a1230395ce4ee54',
//                         status: 'seen',
//                         toMessageId: id2Ref
//                     },
//                     {
//                         _id: id3,
//                         message: 'Helloooo Mike!',
//                         type: 'reply',
//                         from: '601679d33a1230395ce4ee54',
//                         to: '601679d33a1230395ce4ee51',
//                         status: 'sent',
//                         toMessageId: id3Ref,
//                         reply: id1
//                     },
//                     {
//                         _id: id4,
//                         message: 'I\'m good thank God',
//                         type: 'reply',
//                         from: '601679d33a1230395ce4ee54',
//                         to: '601679d33a1230395ce4ee51',
//                         status: 'sent',
//                         toMessageId: id4Ref,
//                         reply: id2
//                     },
//                     {
//                         _id: id5,
//                         message: 'How about you?',
//                         type: 'regular',
//                         from: '601679d33a1230395ce4ee54',
//                         to: '601679d33a1230395ce4ee51',
//                         status: 'sent',
//                         toMessageId: id5Ref
//                     }
//                 ],
//                 unseen: 3
//             },
//             {
//                 userId: '601679d33a1230395ce4ee57',
//                 messages: [
//                     {
//                         _id: id6,
//                         message: 'Helloooooo Joe!',
//                         type: 'regular',
//                         from: '601679d33a1230395ce4ee51',
//                         to: '601679d33a1230395ce4ee57',
//                         status: 'seen',
//                         toMessageId: id6Ref
//                     },
//                     {
//                         _id: id7,
//                         message: 'I miss you!',
//                         type: 'regular',
//                         from: '601679d33a1230395ce4ee51',
//                         to: '601679d33a1230395ce4ee57',
//                         status: 'seen',
//                         toMessageId: id7Ref
//                     },
//                     {
//                         _id: id8,
//                         message: 'Where are you?!',
//                         type: 'regular',
//                         from: '601679d33a1230395ce4ee51',
//                         to: '601679d33a1230395ce4ee57',
//                         status: 'seen',
//                         toMessageId: id8Ref
//                     },
//                     {
//                         _id: id9,
//                         message: 'Did you really miss me?',
//                         type: 'reply',
//                         from: '601679d33a1230395ce4ee57',
//                         to: '601679d33a1230395ce4ee51',
//                         status: 'sent',
//                         toMessageId: id9Ref,
//                         reply: id7
//                     }
//                 ],
//                 unseen: 1
//             }
//         ]
//     },
//     {
//         userId: '601679d33a1230395ce4ee54',
//         persons: [
//             {
//                 userId: '601679d33a1230395ce4ee51',
//                 messages: [
//                     {
//                         _id: id1Ref,
//                         toMessageId: id1,
//                         message: 'Helloooooo James!',
//                         type: 'regular',
//                         from: '601679d33a1230395ce4ee51',
//                         to: '601679d33a1230395ce4ee54',
//                         status: 'seen'
//                     },
//                     {
//                         _id: id2Ref,
//                         toMessageId: id2,
//                         message: 'How are you?!',
//                         type: 'regular',
//                         from: '601679d33a1230395ce4ee51',
//                         to: '601679d33a1230395ce4ee54',
//                         status: 'seen'
//                     },
//                     {
//                         _id: id3Ref,
//                         toMessageId: id3,
//                         message: 'Helloooo Mike!',
//                         type: 'reply',
//                         from: '601679d33a1230395ce4ee54',
//                         to: '601679d33a1230395ce4ee51',
//                         status: 'sent',
//                         reply: id1Ref
//                     },
//                     {
//                         _id: id4Ref,
//                         toMessageId: id4,
//                         message: 'I\'m good thank God',
//                         type: 'reply',
//                         from: '601679d33a1230395ce4ee54',
//                         to: '601679d33a1230395ce4ee51',
//                         status: 'sent',
//                         reply: id2Ref
//                     },
//                     {
//                         _id: id5Ref,
//                         toMessageId: id5,
//                         message: 'How about you?',
//                         type: 'regular',
//                         from: '601679d33a1230395ce4ee54',
//                         to: '601679d33a1230395ce4ee51',
//                         status: 'sent'
//                     }
//                 ],
//                 unseen: 0
//             }
//         ]
//     },
//     {
//         userId: '601679d33a1230395ce4ee57',
//         persons: [
//             {
//                 userId: '601679d33a1230395ce4ee51',
//                 messages: [
//                     {
//                         _id: id6Ref,
//                         toMessageId: id6,
//                         message: 'Helloooooo Joe!',
//                         type: 'regular',
//                         from: '601679d33a1230395ce4ee51',
//                         to: '601679d33a1230395ce4ee57',
//                         status: 'seen'
//                     },
//                     {
//                         _id: id7Ref,
//                         toMessageId: id7,
//                         message: 'I miss you!',
//                         type: 'regular',
//                         from: '601679d33a1230395ce4ee51',
//                         to: '601679d33a1230395ce4ee57',
//                         status: 'seen'
//                     },
//                     {
//                         _id: id8Ref,
//                         toMessageId: id8,
//                         message: 'Where are you?!',
//                         type: 'regular',
//                         from: '601679d33a1230395ce4ee51',
//                         to: '601679d33a1230395ce4ee57',
//                         status: 'seen'
//                     },
//                     {
//                         _id: id9Ref,
//                         toMessageId: id9,
//                         message: 'Did you really miss me?',
//                         type: 'reply',
//                         from: '601679d33a1230395ce4ee57',
//                         to: '601679d33a1230395ce4ee51',
//                         status: 'sent',
//                         reply: id7Ref
//                     }
//                 ],
//                 unseen: 0
//             }
//         ]
//     }
// ]);

// Friend.create([
//     {
//         userId: '601679d33a1230395ce4ee51',
//         pending: ['601679d33a1230395ce4ee57'],
//         friends: ['601679d33a1230395ce4ee5a', '601679d33a1230395ce4ee54'],
//         userReceivedRequestCounter: {
//             accepted: 0,
//             rejected: 0
//         },
//         userSentRequestCounter: {
//             pending: 0,
//             accepted: 0,
//             rejected: 0
//         }
//     },
//     {
//         userId: '601679d33a1230395ce4ee54',
//         pending: ['601679d33a1230395ce4ee57', '601679d33a1230395ce4ee5a'],
//         friends: ['601679d33a1230395ce4ee51'],
//         userReceivedRequestCounter: {
//             accepted: 0,
//             rejected: 0
//         },
//         userSentRequestCounter: {
//             pending: 0,
//             accepted: 0,
//             rejected: 0
//         }
//     },
//     {
//         userId: '601679d33a1230395ce4ee5a',
//         pending: ['601679d33a1230395ce4ee57'],
//         friends: ['601679d33a1230395ce4ee51'],
//         userReceivedRequestCounter: {
//             accepted: 0,
//             rejected: 0
//         },
//         userSentRequestCounter: {
//             pending: 0,
//             accepted: 0,
//             rejected: 0
//         }
//     },
//     {
//         userId: '601679d33a1230395ce4ee57',
//         pending: ['601679d33a1230395ce4ee51', '601679d33a1230395ce4ee5a', '601679d33a1230395ce4ee54'],
//         friends: [],
//         userReceivedRequestCounter: {
//             accepted: 0,
//             rejected: 0
//         },
//         userSentRequestCounter: {
//             pending: 0,
//             accepted: 0,
//             rejected: 0
//         }
//     }
// ]);

// User.create([
//     {
//         email: 'erfan@yahoo.com',
//         password: '123456',
//         username: 'mike',
//         phoneNumber: '+9809389403248',
//         status: {
//             text: 'online',
//             date: Date.now()
//         },
//         info: {
//             general: {
//                 name: 'Mike Smith',
//                 job: 'Programmer',
//                 age: 29,
//                 memberSince: '2020-05-05 22:05:05',
//                 lastSeen: '2021-01-14 06:00:00',
//                 gender: 'male',
//                 education: 'Professional degree',
//                 social: [
//                     {
//                         name: 'Twitter',
//                         link: 'https://twitter.com'
//                     },
//                     {
//                         name: 'Instagram',
//                         link: 'https://instagram.com'
//                     }
//                 ],
//                 bio: 'I am a programmer who lives in London, United Kingdom!',
//                 avatar: '',
//                 location: {
//                     country: 'United Kingdom',
//                     city: 'London',
//                     coords: []
//                 },
//                 philosophy: 'Nothing is impossible.',
//                 howHeardUs: 'Search engine (Google, Yahoo, etc.)'
//             },
//             specific: {
//                 whole: {
//                     totalScore: 21948,
//                     trainingScore: 12280,
//                     rank: 500,
//                     level: {
//                         level: 25,
//                         progress: 600,
//                         destination: 1000
//                     },
//                     group: {
//                         name: 'Brilliant Minds',
//                         link: '/'
//                     },
//                     friends: 150,
//                     games: {
//                         total: 1050,
//                         win: 650,
//                         lose: 100,
//                         draw: 300
//                     },
//                     trainings: 202
//                 },
//                 detailed: {
//                     brain: {
//                         calculation: .29,
//                         judgement: .28,
//                         speed: .22,
//                         accuracy: .05,
//                         flexibility: .35,
//                         problemSolving: .71,
//                         attention: .22,
//                         memory: .32,
//                         creativity: .6
//                     },
//                     personality: {
//                         depressive: .12,
//                         bipolar: .17,
//                         selfLove: .31,
//                         obsessive: .35,
//                         confidence: .54,
//                         social: .08,
//                         anxiety: .1,
//                         emotional: .29,
//                         aggressive: .19,
//                         introversion: .69
//                     }
//                 }
//             }
//         }
//     },
//     {
//         email: 'james@yahoo.com',
//         password: '123456',
//         username: 'james',
//         phoneNumber: '+109389403248',
//         status: {
//             text: 'online',
//             date: Date.now()
//         },
//         info: {
//             general: {
//                 name: 'James Smith',
//                 job: 'Marketer',
//                 age: 36,
//                 memberSince: '2020-05-05 22:05:05',
//                 lastSeen: '2021-01-14 06:00:00',
//                 gender: 'male',
//                 education: 'Professional degree',
//                 social: [
//                     {
//                         name: 'Twitter',
//                         link: 'https://twitter.com'
//                     },
//                     {
//                         name: 'Instagram',
//                         link: 'https://instagram.com'
//                     }
//                 ],
//                 bio: 'I am a marketer who lives in San Fransisco, USA!',
//                 avatar: '',
//                 location: {
//                     country: 'United States',
//                     city: 'San Fransisco',
//                     coords: []
//                 },
//                 philosophy: 'Always fall forward.',
//                 howHeardUs: 'Recommended by friend or colleague'
//             },
//             specific: {
//                 whole: {
//                     totalScore: 10948,
//                     trainingScore: 1280,
//                     rank: 1000,
//                     level: {
//                         level: 15,
//                         progress: 200,
//                         destination: 500
//                     },
//                     group: {
//                         name: 'Brilliant Minds',
//                         link: '/'
//                     },
//                     friends: 250,
//                     games: {
//                         total: 950,
//                         win: 600,
//                         lose: 975,
//                         draw: 275
//                     },
//                     trainings: 152
//                 },
//                 detailed: {
//                     brain: {
//                         calculation: .19,
//                         judgement: .38,
//                         speed: .52,
//                         accuracy: .35,
//                         flexibility: .15,
//                         problemSolving: .11,
//                         attention: .52,
//                         memory: .12,
//                         creativity: .16
//                     },
//                     personality: {
//                         depressive: .32,
//                         bipolar: .17,
//                         selfLove: .21,
//                         obsessive: .55,
//                         confidence: .64,
//                         social: .9,
//                         anxiety: .6,
//                         emotional: .29,
//                         aggressive: .19,
//                         introversion: .1
//                     }
//                 }
//             }
//         }
//     },
//     {
//         email: 'joe@yahoo.com',
//         password: '123456',
//         username: 'joe',
//         phoneNumber: '+109389403048',
//         status: {
//             text: 'online',
//             date: Date.now()
//         },
//         info: {
//             general: {
//                 name: 'Joe Johnson',
//                 job: 'Designer',
//                 age: 26,
//                 memberSince: '2020-05-05 22:05:05',
//                 lastSeen: '2021-01-14 06:00:00',
//                 gender: 'female',
//                 education: 'College degree (BA/BS)',
//                 social: [
//                     {
//                         name: 'Twitter',
//                         link: 'https://twitter.com'
//                     },
//                     {
//                         name: 'Instagram',
//                         link: 'https://instagram.com'
//                     }
//                 ],
//                 bio: 'I am a designer who lives in San Fransisco, USA!',
//                 avatar: '',
//                 location: {
//                     country: 'United States',
//                     city: 'San Fransisco',
//                     coords: []
//                 },
//                 philosophy: 'If you think you can\'t do it, you\'re right.',
//                 howHeardUs: 'Social media'
//             },
//             specific: {
//                 whole: {
//                     totalScore: 5948,
//                     trainingScore: 1280,
//                     rank: 1200,
//                     level: {
//                         level: 20,
//                         progress: 500,
//                         destination: 600
//                     },
//                     group: {
//                         name: 'Creative Minds',
//                         link: '/'
//                     },
//                     friends: 150,
//                     games: {
//                         total: 1250,
//                         win: 750,
//                         lose: 150,
//                         draw: 350
//                     },
//                     trainings: 222
//                 },
//                 detailed: {
//                     brain: {
//                         calculation: .29,
//                         judgement: .28,
//                         speed: .32,
//                         accuracy: .05,
//                         flexibility: .55,
//                         problemSolving: .71,
//                         attention: .22,
//                         memory: .52,
//                         creativity: .8
//                     },
//                     personality: {
//                         depressive: .12,
//                         bipolar: .54,
//                         selfLove: .31,
//                         obsessive: .35,
//                         confidence: .54,
//                         social: .8,
//                         anxiety: .1,
//                         emotional: .75,
//                         aggressive: .19,
//                         introversion: .6
//                     }
//                 }
//             }
//         }
//     },
//     {
//         email: 'peter@yahoo.com',
//         password: '123456',
//         username: 'peter',
//         phoneNumber: '+109389803048',
//         status: {
//             text: 'online',
//             date: Date.now()
//         },
//         info: {
//             general: {
//                 name: 'Peter Smith',
//                 job: 'Mathematician',
//                 age: 45,
//                 memberSince: '2020-05-05 22:05:05',
//                 lastSeen: '2021-01-14 06:00:00',
//                 gender: 'male',
//                 education: 'PhD',
//                 social: [
//                     {
//                         name: 'Twitter',
//                         link: 'https://twitter.com'
//                     },
//                     {
//                         name: 'Instagram',
//                         link: 'https://instagram.com'
//                     }
//                 ],
//                 bio: 'I am a mathematician who lives in San Fransisco, USA!',
//                 avatar: '',
//                 location: {
//                     country: 'United States',
//                     city: 'San Fransisco',
//                     coords: []
//                 },
//                 philosophy: 'It\'s a 2+2 world which probability changes the odds(always)',
//                 howHeardUs: 'Blog or publication'
//             },
//             specific: {
//                 whole: {
//                     totalScore: 25948,
//                     trainingScore: 12280,
//                     rank: 525,
//                     level: {
//                         level: 25,
//                         progress: 500,
//                         destination: 700
//                     },
//                     group: {
//                         name: 'Brilliant Minds',
//                         link: '/'
//                     },
//                     friends: 150,
//                     games: {
//                         total: 1050,
//                         win: 650,
//                         lose: 100,
//                         draw: 300
//                     },
//                     trainings: 202
//                 },
//                 detailed: {
//                     brain: {
//                         calculation: .89,
//                         judgement: .68,
//                         speed: .42,
//                         accuracy: .35,
//                         flexibility: .25,
//                         problemSolving: .61,
//                         attention: .4,
//                         memory: .32,
//                         creativity: .3
//                     },
//                     personality: {
//                         depressive: .52,
//                         bipolar: .37,
//                         selfLove: .31,
//                         obsessive: .5,
//                         confidence: .54,
//                         social: .1,
//                         anxiety: .2,
//                         emotional: .1,
//                         aggressive: .34,
//                         introversion: .75
//                     }
//                 }
//             }
//         }
//     }
// ]);

// ===================================sample codes =========================================

// const toId = await Messenger.aggregate([
//     {
//         $match: {
//             userId: mongoose.Types.ObjectId(req.user.id)
//         }
//     },
//     {
//         $unwind: '$persons'
//     },
//     {
//         $match: {
//             'persons._id': mongoose.Types.ObjectId(req.params.conversationId)
//         }
//     },
//     {
//         $project: {
//             _id: 0,
//             userId: '$persons.userId'
//         }
//     }
// ]);