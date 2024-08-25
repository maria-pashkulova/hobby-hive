const checkIsMember = (req, res, next) => {
    const currUserId = req.user._id;
    const currGroupMembers = req.groupMembersInfo.members;

    //member is object:  { _id: new ObjectId('6662076f0b71dd4af8a245e1') }
    const isMember = currGroupMembers.find((member) => member._id.toString() === currUserId);
    if (!isMember) {
        return res.status(403).json({ message: 'Присъединете се към групата, за да имате достъп до груповия календар и действията в него, както и до груповия разговор!' });
    }
    next();
}

module.exports = checkIsMember;