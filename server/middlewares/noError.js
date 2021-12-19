function noError(req, res, next) {
    req.noError = true;

    next();
}

module.exports = noError;
