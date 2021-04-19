const express = require('express');
const mongoose = require('mongoose');
const auth = require('../middlewares/auth');
const currentUser = require('../middlewares/currentUser');
const dataEncryption = require('../utils/dataEncryption');
const dataDecryption = require('../utils/dataDecryption');
const messageEncryption = require('../utils/messageEncryption');
const messageDecryption = require('../utils/messageDecryption');
const makeRequest = require('../utils/makeRequest');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const fs = require('fs');
const path = require('path');
const exec = require('child_process').exec;

const messengerRouter = express.Router();

const Messenger = mongoose.model('Messenger');
const User = mongoose.model('User');
const Block = mongoose.model('Block');
const Setting = mongoose.model('Setting');

// get persons (aka conversations) and their last message and the last message, createdAt.
messengerRouter.get('/', currentUser, auth, async (req, res) => {
    try {
        const messengerData = await Messenger.findOne({
            userId: req.user.id
        }, {
            'userId': 1,
            'persons.userId': 1,
            'persons.unseen': 1,
            'persons._id': 1,
            'persons.messages': { $slice: -1 }
        });

        const userQuery = await User.aggregate([
            {
                $match: {
                    _id: {
                        $in: [ ...messengerData.persons.map(d => mongoose.Types.ObjectId(d.userId)), mongoose.Types.ObjectId(req.user.id) ]
                    }
                }
            },
            {
                $project: {
                    // _id: 0,
                    'avatar': '$info.general.avatar',
                    'messengerStatus': '$messengerStatus',
                    'fullName': '$info.general.name',
                    username: 1
                }
            }

        ]);

        // we take the user's info
        const userInfo = userQuery.find(user => user.username === req.user.username);
        delete userInfo._id;

        const newUserQuery = userQuery.filter(user => user.username !== req.user.username);

        const messengerDataClone = JSON.parse(JSON.stringify(messengerData));

        for (let i = 0; i < messengerDataClone.persons.length; i++) {
            const userData = newUserQuery.find(user => user._id.toString() === messengerDataClone.persons[i].userId.toString());
            messengerDataClone.persons[i].userId = dataEncryption(messengerDataClone.persons[i].userId);
            messengerDataClone.persons[i].avatar = userData.avatar;
            messengerDataClone.persons[i].messengerStatus = userData.messengerStatus;
            messengerDataClone.persons[i].fullName = userData.fullName;
            messengerDataClone.persons[i].username = userData.username;
            messengerDataClone.persons[i].messages[0].message = messageDecryption(messengerDataClone.persons[i].messages[0].message);
        }

        messengerDataClone.persons = messengerDataClone.persons.map(p => ({ ...p, messages: p.messages.map(m => ({ ...m, from: dataEncryption(m.from), to: dataEncryption(m.to) })) }))
        messengerDataClone.userId = dataEncryption(messengerDataClone.userId);
        messengerDataClone.userInfo = userInfo;

        return res.send(messengerDataClone);
    } catch (err) {
        return res.status(500).send({ Error: 'Could not construct the data' });
    }
});

// we want to change the status of a sent message to delivered when user comes into the Messenger component
messengerRouter.get('/start', currentUser, auth, async (req, res) => {
    // query for getting messages ids that their status should be changed from sent to delivered
    const messageQuery = await Messenger.aggregate([
        {
            $match: {
                userId: mongoose.Types.ObjectId(req.user.id)
            }
        },
        {
            $unwind: '$persons'
        },
        {
            $match: {
                'persons.unseen': { $ne: 0 }
            }
        },
        {
            $project: {
                userId: '$persons.userId',
                messages: {
                    $slice: ['$persons.messages', {
                        $toInt: {
                            $concat: ['-', { $toString: '$persons.unseen' }]
                        }
                    }]
                }
            }
        },
        {
            $project: {
                _id: 0,
                personId: '$userId',
                messages: '$messages._id'
            }
        }
    ]);

    // change the status of the receiver to delivered
    const userStatusQuery = messageQuery.map(({ personId, messages }) => {
        return Messenger.updateMany(
            { userId: req.user.id },
            {
                $set: {
                    'persons.$[elem].messages.$[elem2].status': 'delivered'
                }
            },
            { arrayFilters: [ { 'elem.userId': personId }, { 'elem2._id': { $in: messages } } ] }
            );
    });

    // change the status of the
    const otherUserStatusQuery = messageQuery.map(({ personId, messages }) => {
        return Messenger.updateMany(
            { userId: personId },
            {
                $set: {
                    'persons.$[elem].messages.$[elem2].status': 'delivered'
                }
            },
            { arrayFilters: [ { 'elem.userId': req.user.id }, { 'elem2.toMessageId': { $in: messages } } ] }
        );
    });

    await Promise.all(userStatusQuery);
    await Promise.all(otherUserStatusQuery);

    res.send({ 'Message': 'Successfully updated.' });
});

// route for giving the voices
messengerRouter.get('/v/v1/:voiceId', currentUser, auth, async (req, res) => {
    try {
        const name = `${ path.resolve(__dirname, '..', 'storage', 'voices', req.user.id.toString(), req.params.voiceId.toString()) }.mp3`;

        let file;
        if (fs.existsSync(name)) {
            file = fs.createReadStream(name);
        } else throw new Error("not found");

        res.writeHead(200, {
            'Content-Type': 'audio/mp3',
            'Connection': 'keep-alive',
            'Accept-Ranges': 'bytes'
        });

        return file.pipe(res);
    } catch (err) {
        return res.status(404).send({ 'Message': 'Not found' });
    }
});

// get the messages from a conversation
messengerRouter.get('/:conversationId/:num', currentUser, auth, async (req, res) => {
    try {
        const data = await Messenger.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$persons'
            },
            {
                $match: {
                    'persons._id': mongoose.Types.ObjectId(req.params.conversationId)
                }
            },
            {
                $project: {
                    _id: 1,
                    'persons.userId': 1,
                    'persons._id': 1,
                    'persons.unseen': 1,
                    'persons.messages': { $slice: ['$persons.messages', (parseInt('-' + req.params.num) || -10)] }
                }
            }
        ]);

        const messengerDataClone = JSON.parse(JSON.stringify(data[0]));

        // to determine if the user has sent the message or he/she is the receiver
        messengerDataClone.persons.messages = messengerDataClone.persons.messages.map(
            m => m.from === req.user.id ? ({ ...m, side: 'host' }) : ({ ...m, side: 'guest' })
        );

        messengerDataClone.persons.messages = messengerDataClone.persons.messages.map(m => ({ ...m, from: dataEncryption(m.from), to: dataEncryption(m.to), message: messageDecryption(m.message) }));

        messengerDataClone.persons.userId = dataEncryption(messengerDataClone.persons.userId);

        return res.send(messengerDataClone.persons);
    } catch (err) {
        return res.status(404).send({ 'Message': 'Not Found' });
    }
});

// route for sending a message
messengerRouter.post('/:encryptedToId', currentUser, auth, async (req, res) => {
    try {
        let { message, type, reply, messageBuf, isBuf } = req.body;
        const toId = dataDecryption(req.params.encryptedToId);

        // we check if the that user has blocked the user
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
                    blocks: mongoose.Types.ObjectId(toId)
                }
            },
            {
                $project: {
                    _id: 0,
                    isBlocked: '$blocks'
                }
            }
        ]);

        let oneSideOnly = false;

        if (blockQuery.length) oneSideOnly = true;

        let senderMessage = message;
        let receiverMessage = message;

        if (isBuf) {
            senderMessage = messageBuf.senderMessage;
            receiverMessage = messageBuf.receiverMessage;
        }

        if (!Object.keys(req.body).length) {
            const senderDir = path.resolve(__dirname, '..', 'storage', 'voices', req.user.id.toString());
            const receiverDir = path.resolve(__dirname, '..', 'storage', 'voices', toId.toString());

            if (!fs.existsSync(senderDir)) fs.mkdirSync(senderDir);
            if (!fs.existsSync(receiverDir) && !oneSideOnly) fs.mkdirSync(receiverDir);


            const senderFileName = new mongoose.Types.ObjectId();
            const receiverFileName = new mongoose.Types.ObjectId();

            const oldSenderDir = `${ senderDir }/${ senderFileName }.ogg`;
            // const oldReceiverDir = `${ receiverDir }/${ receiverFileName }.ogg`;

            const newSenderDir = `${ senderDir }/${ senderFileName }.mp3`;
            let newReceiverDir;
            if (!oneSideOnly) newReceiverDir = `${ receiverDir }`;

            const oldSenderFile = fs.createWriteStream(oldSenderDir);
            // const oldReceiverFile = fs.createWriteStream(oldReceiverDir);

            req.pipe(oldSenderFile);

            req.on('end', () => {
                // convert the files to mp3
                exec(`ffmpeg -i ${ oldSenderDir } ${ newSenderDir }`, (err) => {
                    if (err) throw err;

                    // delete the .ogg file
                    fs.unlinkSync(oldSenderDir);

                    if (!oneSideOnly) {
                        // copy the file to other user
                        exec(`cp ${ newSenderDir } ${ newReceiverDir }/${ receiverFileName }.mp3`);
                    }
                });
            });

            return res.status(201).send({
                'Message': 'Successfully added!',
                data: {
                    senderMessage: senderFileName,
                    receiverMessage: receiverFileName
                }
            });
        }

        const userMessageId = new mongoose.Types.ObjectId();
        const toMessageId = new mongoose.Types.ObjectId();

        const createdAt = Date.now();
        const updatedAt = Date.now();

        // constructing the messageData base on the message that was sent in the client
        const userMessageData = {
            _id: userMessageId,
            toMessageId,
            message: messageEncryption(senderMessage),
            type,
            from: req.user.id,
            to: toId,
            status: 'sent',
            createdAt,
            updatedAt
        }

        const theOtherPersonMessageData = {
            _id: toMessageId,
            toMessageId: userMessageId,
            message: messageEncryption(receiverMessage),
            type,
            from: req.user.id,
            to: toId,
            status: 'sent',
            createdAt,
            updatedAt
        }

        if (isBuf) {
            userMessageData.isBuf = true;
            theOtherPersonMessageData.isBuf = true;
        }

        if (reply && !oneSideOnly) {
            // finding replyMessageId of the other person (to)
            const query = await Messenger.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(req.user.id)
                    }
                },
                {
                    $unwind: '$persons'
                },
                {
                    $unwind: '$persons.messages'
                },
                {
                    $match: {
                        'persons.messages._id': mongoose.Types.ObjectId(reply)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        'toMessageReplyId': '$persons.messages.toMessageId'
                    }
                }
            ]);

            const { toMessageReplyId } = query[0];

            theOtherPersonMessageData.reply = toMessageReplyId;
        }
        userMessageData.reply = reply;

        // sending the message to the sender's messages array
        // we first check if the both users already exist in each other messenger (we need to only check for one of them)
        const personExistQuery = await Messenger.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$persons'
            },
            {
                $match: {
                    'persons.userId': mongoose.Types.ObjectId(toId)
                }
            },
            {
                $project: {
                    person: '$persons'
                }
            }
        ]);

        const personExist = personExistQuery.length;

        if (!personExist) {
            await Messenger.updateOne({
                userId: req.user.id
            }, {
                $push: {
                    'persons': {
                        userId: toId,
                        messages: [userMessageData],
                        unseen: 0
                    }
                }
            });

            // sending the message to the receiver's messages array
            await Messenger.updateOne({
                userId: toId
            }, {
                $push: {
                    'persons': {
                        userId: req.user.id,
                        messages: [theOtherPersonMessageData],
                        unseen: 1
                    }
                }
            });
        } else {
            await Messenger.updateOne({
                userId: req.user.id,
                'persons.userId': toId
            }, {
                $push: {
                    'persons.$.messages': userMessageData
                }
            });

            if (!oneSideOnly) {
                // sending the message to the receiver's messages array
                await Messenger.updateOne({
                    userId: toId,
                    'persons.userId': req.user.id
                }, {
                    $push: {
                        'persons.$.messages': theOtherPersonMessageData
                    },
                    $inc: {
                        'persons.$.unseen': 1 // we increment the number of unseen for user that received the message
                    }
                });
            }
        }

        if (!oneSideOnly) {
            // we also want to send notification to other person
            // but we only want to do that if the user is offline
            const user = await User.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(toId)
                    }
                },
                {
                    $project: {
                        status: 1
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
                        userId: dataEncryption(toId.toString()),
                        username: req.user.username,
                        type: 'messenger'
                    })
                }).catch();
            }
        }

        return res.status(201).send({
            'Message': 'Successfully added!',
            data: {
                messageId: userMessageId,
                toMessageId,
                createdAt
            }
        });
    } catch (err) {
        return res.status(400).send({ 'Error': 'Could not add data ' + err });
    }
});

// route for editing a message
messengerRouter.patch('/', currentUser, auth, async (req, res) => {
    try {
        const { newMessage, type, status, messageId, oneWay = false } = req.body; // oneWay tells if it is a delete for me

        const query = await Messenger.aggregate([
            {
                $match: {
                    userId: mongoose.Types.ObjectId(req.user.id)
                }
            },
            {
                $unwind: '$persons'
            },
            {
                $unwind: '$persons.messages'
            },
            {
                $match: {
                    'persons.messages._id': mongoose.Types.ObjectId(messageId)
                }
            },
            {
                $project: {
                    _id: 0,
                    'toMessageId': '$persons.messages.toMessageId',
                    'fromId': '$persons.messages.from',
                    'toId': '$persons.messages.to'
                }
            }
        ]);

        const { toMessageId, fromId, toId } = query[0];

        let toUserId;

        if (fromId.toString() === req.user.id.toString()) toUserId = toId;
        else toUserId = fromId;

        // we check if the that user has blocked the user
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
                    blocks: mongoose.Types.ObjectId(toId)
                }
            },
            {
                $project: {
                    _id: 0,
                    isBlocked: '$blocks'
                }
            }
        ]);

        let oneSideOnly = false;

        if (blockQuery.length) oneSideOnly = true;

        // constructing the data to change
        function setItems(id) {
            const obj = {};

            if (newMessage) obj['persons.$[elem].messages.$[elem2].message'] = messageEncryption(newMessage);
            if (type) obj['persons.$[elem].messages.$[elem2].type'] = type;
            if (status) obj['persons.$[elem].messages.$[elem2].status'] = status;
            if (status === 'seen' && id === req.user.id) obj['persons.$[elem].unseen'] = 0;

            return obj;
        }

        // editing the sender's message
        await Messenger.updateOne({
                userId: req.user.id
            },
            {
                $set: setItems(req.user.id)
            },
            {
                arrayFilters: [ { 'elem.userId': toUserId }, { 'elem2._id': messageId  } ]
            });


        if (!oneWay && !oneSideOnly) {
            // editing the receiver's message
            await Messenger.updateOne({
                    userId: toUserId
                },
                {
                    $set: setItems(toUserId)
                },
                {
                    arrayFilters: [ { 'elem.userId': req.user.id }, { 'elem2._id': toMessageId  } ]
                });
        }

        return res.send({ 'Message': 'Successfully Updated the message' });
    } catch (err) {
        return res.status(400).send({ 'Message': 'Could not update the message' });
    }
});

// route for deleting a message
messengerRouter.delete('/:encryptedToId/:messageId/:number', currentUser, auth, async (req, res) => {
    try {
        // we check if the that user has blocked the user
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
                    blocks: mongoose.Types.ObjectId(toId)
                }
            },
            {
                $project: {
                    _id: 0,
                    isBlocked: '$blocks'
                }
            }
        ]);

        let oneSideOnly = false;

        if (blockQuery.length) oneSideOnly = true;

        // deleting the sender's message
        await Messenger.updateOne({
            userId: req.user.id,
            persons: {
                $elemMatch: {
                    'messages._id': req.params.messageId
                }
            }
        }, {
            $set: {
                'persons.0.messages.$.message': '',
                'persons.0.messages.$.type': 'delete'
            }
        });

        if (!oneSideOnly) {
            // finding receiver's messageId
            const query = await Messenger.aggregate([
                {
                    $match: {
                        userId: mongoose.Types.ObjectId(req.user.id)
                    }
                },
                {
                    $unwind: '$persons'
                },
                {
                    $unwind: '$persons.messages'
                },
                {
                    $match: {
                        'persons.messages._id': mongoose.Types.ObjectId(req.params.messageId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        'toMessageId': '$persons.messages.toMessageId'
                    }
                }
            ]);

            const { toMessageId } = query[0];

            // deleting the receiver's message
            await Messenger.updateOne({
                userId: req.params.encryptedToId,
                persons: {
                    $elemMatch: {
                        'messages._id': toMessageId
                    }
                }
            }, {
                $set: {
                    'persons.0.messages.$.message': '',
                    'persons.0.messages.$.type': 'delete'
                }
            });
        }

        return res.send({ 'Message': 'Successfully Deleted the message' });
    } catch (err) {
        return res.status(500).send({ 'Message': 'Could not delete the message' });
    }
});

// route for making unseen to 0 when messages are sent through socket
messengerRouter.patch('/unseen', currentUser, auth, async (req, res) => {
    try {
        const { encryptedPersonId } = req.body;
        const personId = dataDecryption(encryptedPersonId);

        await Messenger.updateOne({
            userId: req.user.id
        }, {
            $set: {
                'persons.$[elem].unseen': 0
            }
        }, { arrayFilters: [ { 'elem.userId': personId } ] });

        return res.send({ Message: 'Successful' });
    } catch (err) {
        return res.status(500).send({ Error: 'Could construct the data' });
    }
});

module.exports = messengerRouter;