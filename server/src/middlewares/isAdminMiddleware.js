const checkIsAdmin = (req, res, next) => {
    const currUserId = req.user._id;
    const currGroupAdminId = req.groupMembersInfo.groupAdmin;

    req.isAdmin = currGroupAdminId.toString() === currUserId;
    next();
}

module.exports = checkIsAdmin;