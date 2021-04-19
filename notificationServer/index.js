require('./db/db');
const mongoose = require('mongoose');
const webPush = require('web-push');
const http = require('http');
const jwt = require('jsonwebtoken');
const key = require('./key');

const Subscription = mongoose.model('Subscription');

const server = http.createServer((req, res) => {
    if (req.url === '/create-subscription') {
        if (req.method === 'POST') {
            try {
                let data = '';

                req.on('data', d => {
                    data += d;
                });

                req.on('end', () => {
                    const strData = data.toString();
                    const finalData = JSON.parse(strData);

                    if (finalData.newSub) {
                        const { newSub: { endpoint, keys }, userId } = finalData;
                        const newData = {
                            userId,
                            endpoint,
                            keys
                        }

                        Subscription.create(newData)
                            .then(() => {
                                res.writeHead(201, {
                                    'Content-Type': 'text/plain',
                                    'Access-Control-Allow-Origin': '*'
                                });
                                res.end('Successfully saved');
                            });
                    }
                });
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end({ Error: 'Bad Input' })
            }
        }
    }

    else if (req.url === '/send-notification') {
        if (req.method === 'POST') {
            // we check the credentials
            const authorization = req.headers.authorization;
            if (!authorization) {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ Error: 'You are not allowed to send notification' }));
            }

            const parsedAuth = authorization.replace('Bearer ', '');
            const decryptedAuth = jwt.verify(parsedAuth, key.JWT_NOTIFICATION_SECRET);
            if (!decryptedAuth || decryptedAuth.text !== 'Adasik-Platform') {
                res.writeHead(403, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ Error: 'You are not allowed to send notification' }));
            }

            // now we should get the data
            let data = '';
            req.on('data', d => {
                data += d;
            });

            req.on('end', () => {
                const parsedData = data.toString();
                const { userId, username, type, title, content, url } = JSON.parse(parsedData);
                sendNotification(userId, username, type, title, content, url)
            });

            async function sendNotification(userId, username, type, title, content, url) {
                // we first check to see if the userId exists
                let user;
                if (userId && type !== 'general') {
                    user = await Subscription.aggregate([
                        {
                            $match: {
                                userId
                            }
                        }
                    ]);
                }

                else if (!userId && type === 'general') {
                    user = await Subscription.aggregate([
                        {
                            $match: {}
                        }
                    ]);
                }

                if (!user || !user.length) return;

                // now we construct the message to send
                const notification = {
                    title: '',
                    content: '',
                    openUrl: 'http://127.0.0.1:8080/dashboard'
                };

                if (type === 'messenger') {
                    notification.title = 'New Message';
                    notification.content = `You have a new message from ${ username }`;
                    notification.openUrl = 'http://127.0.0.1:8080/messenger';
                }

                else if (type === 'challenge-game') {
                    notification.title = 'Your Turn';
                    notification.content = `Your turn to play against ${ username }`;
                    notification.openUrl = 'http://127.0.0.1:8080/challenges';
                }

                else if (type === 'challenge-request') {
                    notification.title = 'New Challenge Request';
                    notification.content = `You have a new Challenge request from ${ username }`;
                    notification.openUrl = 'http://127.0.0.1:8080/challenges';
                }

                else if (type === 'friend') {
                    notification.title = 'New Friend Request';
                    notification.content = `You have a new Friend request from ${ username }`;
                    notification.openUrl = 'http://127.0.0.1:8080/friends';
                }

                else if (type === 'general') {
                    notification.title = title;
                    notification.content = content;
                    notification.openUrl = url;
                }

                // now we send the notification if the type is not general
                webPush.setVapidDetails(
                    'mailto:erfana11@yahoo.com',
                    'BDh5U8KiKCsjoD5HvlUgLkD6L6YfWwK0RO6Xa-xL1rr0gIHPbhngE4wLECpfh5obf4yU2R0WLXweJqrNkiWFzy4',
                    'k74KJAOlxNKsVIiJfDJD9DxaUNoNNSBTU192-SMFInM'
                );

                user.forEach(({ endpoint, keys }) => {
                    const pushConfig = {
                        endpoint,
                        keys
                    };

                    webPush.sendNotification(pushConfig, JSON.stringify(notification))
                        .catch();
                });
            }

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.write(JSON.stringify({ Message: 'Successful' }))
            res.end();
        }
    }
});

server.listen(4000, () => {
    console.log('Server is up on port 4000');
});