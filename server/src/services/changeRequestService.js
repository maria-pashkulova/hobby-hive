const EventChangeRequest = require('../models/EventChangeRequest');

exports.getAll = (isCurrUserGroupAdmin) => {
    if (!isCurrUserGroupAdmin) {
        const error = new Error('Само администраторът на групата може да премахва заявки за промяна на събития в групата!');
        error.statusCode = 403;
        throw error;
    }

    //..todo
}


//Used for validations in changeRequestMiddleware
exports.getById = (requestId) => {
    const request = EventChangeRequest
        .findById(requestId)
        .select('_id');
    return request;
}

exports.create = (currUserId, eventId, description) => {

    const newRequestData = {
        eventId,
        requestFromUser: currUserId,
        description
    }

    const newRequest = EventChangeRequest.create(newRequestData);

    //TODO:populate event info or user info if needed

    return newRequest;

};


exports.delete = (isCurrUserGroupAdmin, requestIdToDelete) => {
    if (!isCurrUserGroupAdmin) {
        const error = new Error('Само администраторът на групата може да премахва заявки за промяна на събития в групата!');
        error.statusCode = 403;
        throw error;
    }

    return EventChangeRequest.findByIdAndDelete(requestIdToDelete);

}