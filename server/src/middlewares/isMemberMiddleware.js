const checkIsMember = (req, res, next) => {
    const currUserId = req.user._id;
    const currGroupMembers = req.groupMembersInfo.members;

    //member is object:  { _id: new ObjectId('6662076f0b71dd4af8a245e1') }
    const isMember = currGroupMembers.find((member) => member._id.toString() === currUserId);
    if (!isMember) {
        return res.status(403).json({ message: 'Не сте член на групата!' });
    }
    next();
}

module.exports = checkIsMember;