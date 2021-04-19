const auth = async (req, res, next) => {
    if (!req.currentUser) {
        return res.status(401).send({ 'NotAuthorizedError': 'You are not logged in.' });
    }

    next();
};

module.exports = auth;