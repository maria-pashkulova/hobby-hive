//Attach group id to req object

const getGroup = (req, res, next) => {
    //TODO check if group exists
    req.groupId = req.params.groupId;
    next();
}

module.exports = getGroup;