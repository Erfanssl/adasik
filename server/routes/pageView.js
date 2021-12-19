const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');
const currentUser = require('../middlewares/currentUser');

const pageViewRouter = express.Router();

const WebsitePageviewSession = mongoose.model('WebsitePageviewSession');

pageViewRouter.post('/', currentUser, async (req, res) => {
    const { pageviewUrl, httpReferer, deviceType, isDisconnected = false, sessionJwt, pageViewJwt, ip } = req.body;

    try {
        if (isDisconnected) {
            // means the socketServer has sent the message
            // it means person has been in the website we want to find out how long
            const pageViewId = jwt.verify(pageViewJwt, keys.JWT_PAGEVIEW_STAY_SECRET).id;
            const pageViewSessionId = jwt.verify(sessionJwt, keys.JWT_PAGEVIEW_SESSION_SECRET).id;

            // query to get the when the pageview data was created to calculate timespent
            const pageViewQuery = await WebsitePageviewSession.aggregate([
                {
                    $match: {
                        _id: mongoose.Types.ObjectId(pageViewSessionId)
                    }
                },
                {
                    $unwind: '$pageviews'
                },
                {
                    $match: {
                        'pageviews._id': mongoose.Types.ObjectId(pageViewId)
                    }
                },
                {
                    $project: {
                        _id: 0,
                        'createdAt': '$pageviews.createdAt'
                    }
                }
            ]);

            const pageViewCreatedAt = pageViewQuery[0].createdAt;
            const timespent = Date.now() - new Date(pageViewCreatedAt).getTime();

            // we update the value of timespent
            await WebsitePageviewSession.updateOne({ _id: pageViewSessionId, 'pageviews._id': pageViewId }, {
                $set: {
                    'pageviews.$.timespent': timespent
                }
            });

            return res.send({ 'Message': 'Successfully updated the timespent' });
        }

        let pageViewSessionDataJwt;
        let pageViewSessionExpired = false;

        // we check if there is a session in the user's browser and also the age of the session if exists
        // we want it to be less than or equal to 24 hours

        if (req.session.pageViewSession) {
            const ONE_DAY = 1000 * 60 * 60 * 24;
            const pageViewSessionDate = jwt.verify(req.session.pageViewSession, keys.JWT_PAGEVIEW_SESSION_SECRET).date;
            if (pageViewSessionDate && (Date.now() - pageViewSessionDate) > ONE_DAY) pageViewSessionExpired = true;
        }

        if (!req.session.pageViewSession || pageViewSessionExpired) {
            // we need to create one
            // constructing data
            const sessionData = {
                deviceType,
                httpReferer,
                pageviews: []
            };

           if (req.currentUser) sessionData.userId = req.currentUser.id;

            const newWebsitePageviewSession = await WebsitePageviewSession.create(sessionData);

            pageViewSessionDataJwt = jwt.sign({ id: newWebsitePageviewSession._id, date: Date.now() }, keys.JWT_PAGEVIEW_SESSION_SECRET);

            // create a jwt with id of the websiteSession and the sent it as a cookie
            req.session.pageViewSession = pageViewSessionDataJwt;
        }

        // there is a cookie, we extract the sessionId
        const pageViewSessionId = jwt.verify(req.session.pageViewSession, keys.JWT_PAGEVIEW_SESSION_SECRET).id;
        pageViewSessionDataJwt = req.session.pageViewSession;

        // we send it to the websitePageview
        // constructing data
        const pageViewDataId = new mongoose.Types.ObjectId();
        const pageViewData = {
            _id: pageViewDataId,
            pageviewUrl,
            timespent: 0,
            ip
        };

        // send the data to WebsitePageview
        await WebsitePageviewSession.updateOne({ _id: pageViewSessionId }, {
            $push: {
                'pageviews': pageViewData
            }
        });

        // we set the cookie to have pagviewId for future uses (when the person gets disconnected)
        // req.session.pageViewStay = jwt.sign({ id: pageViewDataId }, keys.JWT_PAGEVIEW_STAY_SECRET);
        const pageViewStayDataJwt = jwt.sign({ id: pageViewDataId }, keys.JWT_PAGEVIEW_STAY_SECRET);

        return res.send({
            'Message': 'Successful',
            data: {
                pageViewSessionDataJwt,
                pageViewStayDataJwt
            }
        });
    } catch (err) {
        return res.status(400).send({ 'Error': 'Could not make statistics about the visit.' });
    }
});

module.exports = pageViewRouter;
