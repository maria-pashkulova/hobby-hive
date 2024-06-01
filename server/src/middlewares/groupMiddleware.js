//Attach group id to req object

const getGroup = (req, res, next) => {
    req.groupId = req.params.groupId;
    next();
}

module.exports = getGroup;