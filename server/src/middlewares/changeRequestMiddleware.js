const mongoose = require('mongoose');
const changeRequestService = require('../services/changeRequestService');


const validateRequest = async (req, res, next) => {
    const requestId = req.params.requestId;
    const requestedGroupId = req.groupId;

    //check if request exists
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(404).json({ message: 'Заявката за промяна на събитие не съществува!' });
    }

    const request = await changeRequestService.getById(requestId);
    if (!request) {
        return res.status(404).json({ message: 'Заявката за промяна на събитие не съществува!' });

    }

    //Validate if request is for event in the requested group!
    if (requestedGroupId !== request.groupId.toString()) {
        return res.status(400).json({ message: 'Заявката не е за събитие в текущата група!' });
    }

    next();

}

module.exports = validateRequest;