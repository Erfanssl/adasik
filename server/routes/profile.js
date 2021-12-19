const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middlewares/auth');
const currentUser = require('../middlewares/currentUser');
const noError = require('../middlewares/noError');
const dataEncryption = require('../utils/dataEncryption');
const dataDecryption = require('../utils/dataDecryption');

const profileRouter = express.Router();

const User = mongoose.model('User');
const Setting = mongoose.model('Setting');
const Friend = mongoose.model('Friend');
const Like = mongoose.model('Like');
const Block = mongoose.model('Block');
const Report = mongoose.model('Report');

profileRouter.get('/', currentUser, auth, async (req, res) => {
    try {
        const user = await User.aggregate([
            {
                $match: {
                    _id: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    _id: 0,
                    password: 0,
                    email: 0,
                    phoneNumber: 0,
                    prePhoneNumber: 0
                }
            }
        ]);

        const friendQuery = await Friend.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    _id: 0,
                    friends: 1
                }
            }
        ]);

        let friends = [];

        if (friendQuery[0] && friendQuery[0].friends.length) {
            friends = await User.aggregate([
                {
                    $match: {
                        _id: {
                            $in: friendQuery[0].friends.map(id => mongoose.Types.ObjectId(id))
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        status: '$status.text',
                        avatar: '$info.general.avatar',
                        username: 1
                    }
                },
                {
                    $limit: 10
                }
            ]);
        }

        const userDataClone = { ...user[0] };
        delete userDataClone.info.specific.abstract;
        delete userDataClone.info.general.location.coords;
        delete userDataClone.info.general.location.city;
        const { day, month, year } = userDataClone.info.general.birthday;
        userDataClone.info.general.age = Math.floor((new Date() - new Date(`${ month }-${ day }-${ year }`)) / 1000 / 60 / 60 / 24 / 365);

        return res.send({ ...userDataClone, friends });
    } catch (err) {
        return res.status(500).send({ 'Error': 'Unable to get profile data' });
    }
});

profileRouter.get('/name', currentUser, noError, auth, async (req, res) => {
    try {
        const nameOfTheUser = await User.aggregate([
            {
                $match: { _id: mongoose.Types.ObjectId(req.user.id)}
            },
            {
                $project: {
                    _id: 0,
                    name: '$info.general.name'
                }
            }
        ]);

        return res.send(nameOfTheUser[0]);
    } catch (err) {
        return res.status(500).send({ 'Error': 'Unable to get name data' });
    }
});

// routes for profile of other users
// route to get another user profile
profileRouter.get('/users/:username', currentUser, auth, async (req, res) => {
    const username = req.params.username;

    try {
        const user = await User.aggregate([
            {
                $match: {
                    username
                }
            },
            {
                $project: {
                    password: 0,
                    email: 0,
                    phoneNumber: 0
                }
            }
        ])

        if (!user || !user.length) return res.status(404).send({ Error: 'Not Found' });

        const friendQuery = await Friend.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(user[0]._id)
                }
            },
            {
                $project: {
                    _id: 0,
                    friends: 1
                }
            }
        ]);

        let friends = [];

        if (friendQuery[0] && friendQuery[0].friends.length) {
            friends = await User.aggregate([
                {
                    $match: {
                        _id: {
                            $in: friendQuery[0].friends.map(id => mongoose.Types.ObjectId(id))
                        }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        status: '$status.text',
                        avatar: '$info.general.avatar',
                        username: 1
                    }
                }
            ]);
        }

        // to see if the user likes this user
        const likeQuery = await Like.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(user[0]._id)
                }
            },
            {
                $unwind: '$likes'
            },
            {
                $match: {
                    likes: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    'isLike': '$likes'
                }
            }
        ]);

        const likeExist = likeQuery.length;

        // to see if the user blocks this user
        const blockQuery = await Block.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(user[0]._id)
                }
            },
            {
                $unwind: '$blocks'
            },
            {
                $match: {
                    blocks: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    isBlock: '$blocks'
                }
            }
        ]);

        const blockExist = blockQuery.length;

        // now we should check the user's privacy settings to see what information we should omit
        const settings = await Setting.findOne({ userId: user[0]._id });

        const userDataClone = { ...user[0] };
        userDataClone._id = dataEncryption(userDataClone._id.toString());
        userDataClone.userLiked = !!likeExist;
        userDataClone.userBlocked = !!blockExist;
        delete userDataClone.info.specific.abstract;
        const { day, month, year } = userDataClone.info.general.birthday;
        userDataClone.info.general.age = Math.floor((new Date() - new Date(`${ month }-${ day }-${ year }`)) / 1000 / 60 / 60 / 24 / 365);

        // in case the user goes to his own profile, we want to redirect his/her back to the profile
        const samePerson = req.user.username === username.toString();

        if (!samePerson) {
            // we check to see if this user is a friend of the user
            const isFriendQuery = await Friend.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(user[0]._id),
                        friends: mongoose.Types.ObjectId(req.user.id)
                    }
                },
                {
                    $unwind: '$friends'
                },
                {
                    $match: {
                        friends: mongoose.Types.ObjectId(req.user.id)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        isFriend: '$friends'
                    }
                }
            ]);

            const isFriend = !!isFriendQuery.length;
            userDataClone.isFriend = isFriend;
        }

        if (!settings) return res.send({ ...userDataClone, friends });

        let allowBrainInfo = false;
        let allowSeeFriends = false;
        let allowPersonalInfo = false;
        let allowPersonalityInfo = false;

        settings.privacy.forEach(setting => {
            if (setting.toLowerCase() === 'Allow other users to see your brain information (diagram)'.toLowerCase()) allowBrainInfo = true;
            if (setting.toLowerCase() === 'Allow other users to see your friends'.toLowerCase()) allowSeeFriends = true;
            if (setting.toLowerCase() === 'Allow other users to see your personal information (Age, Job, Education, Philosophy and Country)'.toLowerCase()) allowPersonalInfo = true;
            if (setting.toLowerCase() === 'Allow other users to see your personality information (diagram)'.toLowerCase()) allowPersonalityInfo = true;
        });

        if (!allowPersonalInfo) {
            delete userDataClone.info.general.age;
            delete userDataClone.info.general.job;
            delete userDataClone.info.general.education;
            delete userDataClone.info.general.philosophy;
            delete userDataClone.info.general.location;
        }
        if (!allowBrainInfo && !allowPersonalityInfo) delete userDataClone.info.specific.detailed;
        else if (!allowBrainInfo) delete userDataClone.info.specific.detailed.brain;
        else if (!allowPersonalityInfo) delete userDataClone.info.specific.detailed.personality;

        if (!allowSeeFriends && samePerson) return res.send({ ...userDataClone, friends: 'Not Allowed', redirect: true });
        if (!allowSeeFriends) return res.send({ ...userDataClone, friends: 'Not Allowed' });
        if (samePerson) return res.send({ ...userDataClone, friends, redirect: true });
        return res.send({ ...userDataClone, friends });
    } catch (err) {
        return res.status(500).send({ 'Error': 'Unable to get profile data' });
    }
});

// route for handling likes system
profileRouter.get('/like/:encryptedUserId', currentUser, auth, async (req, res) => {
    try {
        const userId = dataDecryption(req.params.encryptedUserId.toString());

        // we first determine if this is a like or dislike
        const likeQuery = await Like.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId)
                }
            },
            {
                $unwind: '$likes'
            },
            {
                $match: {
                    likes: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    isLike: '$likes'
                }
            }
        ]);

        const likeExist = likeQuery.length;

        if (likeExist) {
            // means it's a dislike
            // first we remove it from that user's likes
            await Like.updateOne({
                userId
            }, {
                $pull: {
                    likes: req.user.id
                },
                $push: {
                    dislikes: req.user.id
                }
            });

            // then we add that userId to the user's dislikes
            await Like.updateOne({
                userId: req.user.id
            }, {
                $push: {
                    userDislikes: userId
                }
            });

            // now we update the number of likes in the users
            await User.updateOne({
                _id: userId
            }, {
                $inc: {
                    'info.general.likes': -1
                }
            });
        } else if (!likeExist) {
            // means it's a like
            // first we add it to that user's likes
            await Like.updateOne({
                userId
            }, {
                $addToSet: {
                    likes: req.user.id
                }
            });

            // then we add that userId to the user's likes
            await Like.updateOne({
                userId: req.user.id
            }, {
                $push: {
                    userLikes: userId
                }
            });

            // now we update the number of likes in the users
            await User.updateOne({
                _id: userId
            }, {
                $inc: {
                    'info.general.likes': 1
                }
            });
        }

        if (likeExist) return res.send({ Message: 'Successful', type: 'dislike' });
        return res.send({ Message: 'Successful', type: 'like' });
    } catch (err) {
        return res.status(500).send({ Error: 'Unable to like or dislike' });
    }
});

// route for handling block system
profileRouter.get('/block/:encryptedUserId', currentUser, auth, async (req, res) => {
    try {
        const userId = dataDecryption(req.params.encryptedUserId.toString());

        // we check if it is a block or unblock
        const blockExistQuery = await Block.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(userId)
                }
            },
            {
                $unwind: '$blocks'
            },
            {
                $match: {
                    blocks: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $project: {
                    isBlock: '$blocks'
                }
            }
        ]);

        const blockExist = blockExistQuery.length;

        if (blockExist) {
            // means it's an unblock
            // we first pull the id of the user from the other user's blocks list
            await Block.updateOne({
                userId
            }, {
                $pull: {
                    blocks: req.user.id
                }
            });

            // then we decrement the number of the currentlyBlocking of the user
            await Block.updateOne({
                userId: req.user.id
            }, {
                $inc: {
                    currentlyBlocking: -1
                }
            });
        } else {
            // means it's a block
            // we add the user's id to other user's blocks list and we increment the userGotBlockedCounter
            await Block.updateOne({
                userId
            }, {
                $push: {
                    blocks: req.user.id
                },
                $inc: {
                    userGotBlockedCounter: 1
                }
            });

            // then we increment the number of the currentlyBlocking and userDidBlockCounter of the user
            await Block.updateOne({
                userId: req.user.id
            }, {
                $inc: {
                    currentlyBlocking: 1,
                    userDidBlockCounter: 1
                }
            });
        }

        if (blockExist) return res.send({ Message: 'Successful', type: 'unblock' });
        return res.send({ Message: 'Successful', type: 'block' });
    } catch (err) {
        return res.status(500).send({ Error: 'Unable to block or unblock' });
    }
});

// route for handling reports
profileRouter.get('/report/:encryptedUserId', currentUser, auth, async (req, res) => {
    try {
        const userIdToReport = dataDecryption(req.params.encryptedUserId.toString());

        // check to see if the user exist
        const user = User.findOne({ _id: userIdToReport });

        if (!user) res.status(404).send({ 'Error': 'Not Found' });

        // check to see if they're friends
        const isFriendQuery = await Friend.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$friends'
            },
            {
                $match: {
                    friends: mongoose.Types.ObjectId(userIdToReport)
                }
            },
            {
                $project: {
                    isFriend: '$friends'
                }
            }
        ]);

        const isFriend = isFriendQuery.length;

        // now we add the report to the report collection
        await Report.create({
            target: userIdToReport,
            reporter: req.user.id,
            isFriend
        });

        res.status(201).send({ 'Message': 'Successful' });
    } catch (err) {
        res.status(500).send({ 'Error': 'Could not create the report' });
    }
});

// route for handling searching users
profileRouter.get('/search/:wordToSearch', currentUser, auth, async (req, res) => {
    try {
        const wordToSearch = req.params.wordToSearch.toString().toLowerCase();

        // we first search in the usernames
        const searchBaseOnUsername = await User.aggregate([
            {
                $match: {
                    username: RegExp(`.*${ wordToSearch }.*`)
                }
            },
            {
                $project: {
                    _id: 0,
                    status: '$status.text',
                    username: 1,
                    fullName: '$info.general.name',
                    avatar: '$info.general.avatar',
                    likes: '$info.general.likes',
                    totalScore: '$info.specific.whole.totalScore',
                    rank: '$info.specific.whole.rank',
                    level: '$info.specific.whole.level.level'
                }
            }
        ]);

        // then we search in the names and similar ones, we use text indexing to handle that and also speed up the search
        const searchBaseOnFullName = await User.aggregate([
            {
                $match: {
                    $text: {
                        $search: wordToSearch,
                        $caseSensitive: false
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    status: '$status.text',
                    username: 1,
                    fullName: '$info.general.name',
                    avatar: '$info.general.avatar',
                    likes: '$info.general.likes',
                    totalScore: '$info.specific.whole.totalScore',
                    rank: '$info.specific.whole.rank',
                    level: '$info.specific.whole.level.level'
                }
            }
        ]);

        let finalArr = [];
        const searchBaseOnFullNameUsernameObj = {};

        if (searchBaseOnFullName.length) {
            searchBaseOnFullName.forEach(search => {
                searchBaseOnFullNameUsernameObj[search?.username] = true;
            });
        }

        if (searchBaseOnUsername.length) {
            searchBaseOnUsername.forEach(searchU => {
                if (!(searchU.username in searchBaseOnFullNameUsernameObj) && searchU.fullName) finalArr.push(searchU);
            });
        }

        finalArr.push(...searchBaseOnFullName);

        return res.send(finalArr);
    } catch (err) {
        return res.status(500).send({ 'Error': 'Unable to find any match' });
    }
});

module.exports = profileRouter;
