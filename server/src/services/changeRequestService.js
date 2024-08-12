const EventChangeRequest = require('../models/EventChangeRequest');

exports.getAll = (isCurrUserGroupAdmin, groupId) => {
    if (!isCurrUserGroupAdmin) {
        const error = new Error('Само администраторът на групата може да достъпи заявките за промяна на събития в групата!');
        error.statusCode = 403;
        throw error;
    }

    return EventChangeRequest
        .find({ groupId })
        .select('-updatedAt -__v')
        .sort({ createdAt: -1 })
        .populate('requestFromUser', 'firstName lastName')
        .populate('eventId', '_id title');

}


//Used for validations in changeRequestMiddleware
exports.getById = (requestId) => {
    const request = EventChangeRequest
        .findById(requestId)
        .select('_id');
    return request;
}

exports.create = (currUserId, isCurrUserGroupAdmin, groupId, eventId, eventOwnerId, description) => {
    if (isCurrUserGroupAdmin) {
        const error = new Error('Aдминистраторът на групата не може да прави заявки за промяна на събития в групата!');
        error.statusCode = 400;
        throw error;
    }

    //if current user is not group admin (for the group of the requested event)
    if (currUserId === eventOwnerId) {
        const error = new Error('Вие сте създателят на събитието. Можете да го промените без заявка към администратора на групата!');
        error.statusCode = 400;
        throw error;
    }


    const newRequestData = {
        groupId,
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
        const error = new Error('Само администраторът на групата може да означава заявки за промяна на събития в групата като осъществени!');
        error.statusCode = 403;
        throw error;
    }

    return EventChangeRequest.findByIdAndDelete(requestIdToDelete);

}