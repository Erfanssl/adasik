const auth = (req, res, next) => {
    if (!req.currentUser) {
        if (req.noError) res.send({ NotAuthorizedError: 'You are not logged in.' });
        return res.status(401).send({ NotAuthorizedError: 'You are not logged in.' });
    }

    next();
};

module.exports = auth;
