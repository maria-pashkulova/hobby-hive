const mongoose = require('mongoose');
const changeRequestService = require('../services/changeRequestService');


const validateRequest = async (req, res, next) => {
    const requestId = req.params.requestId;

    //check if request exists
    if (!mongoose.Types.ObjectId.isValid(requestId)) {
        return res.status(404).json({ message: 'Заявката за промяна на събитие не съществува!' });
    }

    const request = await changeRequestService.getById(requestId);
    if (!request) {
        return res.status(404).json({ message: 'Заявката за промяна на събитие не съществува!' });

    }

    next();

}

module.exports = validateRequest;