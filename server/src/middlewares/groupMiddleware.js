const mongoose = require('mongoose');
const groupService = require('../services/groupService');

//Check if requested group is valid
//Attach group id to req object

const getGroup = async (req, res, next) => {
    const requestedGroupId = req.params.groupId;

    //check if group exists
    if (!mongoose.Types.ObjectId.isValid(requestedGroupId)) {
        return res.status(404).json({ message: 'Групата не съществува!' });
    }

    const group = await groupService.getByIdToValidate(requestedGroupId);
    if (!group) {
        return res.status(404).json({ message: 'Групата не съществува!' });
    }

    req.groupId = requestedGroupId;
    req.groupMembersInfo = {
        members: group.members,
        groupAdmin: group.groupAdmin
    }
    next();
}

module.exports = getGroup;