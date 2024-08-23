const EventChangeRequest = require('../models/EventChangeRequest');

exports.getAll = async (isCurrUserGroupAdmin, groupId, page, limit) => {
    if (!isCurrUserGroupAdmin) {
        const error = new Error('Само администраторът на групата може да достъпи заявките за промяна на събития в групата!');
        error.statusCode = 403;
        throw error;
    }

    const skip = page * limit;


    const requests = await EventChangeRequest
        .find({ groupId })
        .select('-updatedAt -__v')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('requestFromUser', 'firstName lastName')
        .populate('eventId', '_id title start');

    //Group events requests for change count
    const total = await EventChangeRequest.countDocuments({ groupId });
    const totalPages = Math.ceil(total / limit);

    return { requests, totalPages };

}


//Used for validations in changeRequestMiddleware
exports.getById = (requestId) => {
    const request = EventChangeRequest
        .findById(requestId)
        .select('_id groupId');
    return request;
}

exports.create = async (currUserId, isCurrUserGroupAdmin, groupId, eventId, eventOwnerId, description) => {
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

    let newRequest = await EventChangeRequest.create(newRequestData);

    //Populated group info is needed for notifications
    newRequest = await newRequest
        .populate('groupId', 'name groupAdmin')
    //Populated event info is needed for notifications
    newRequest = await newRequest
        .populate('eventId', 'title')

    return newRequest;

};


exports.delete = (isCurrUserGroupAdmin, requestIdToDelete) => {
    if (!isCurrUserGroupAdmin) {
        const error = new Error('Само администраторът на групата може да означава заявки за промяна на събития в групата като прегледани!');
        error.statusCode = 403;
        throw error;
    }

    return EventChangeRequest.findByIdAndDelete(requestIdToDelete);

}