const Event = require('../models/Event');
const Group = require('../models/Group');
const EventChangeRequest = require('../models/EventChangeRequest');
const { checkForDuplicateTags } = require('../utils/validateGroupData');
const { validateEventTags } = require('../utils/validateEventData');


exports.getAllGroupEvents = (groupId, startISO, endISO) => {

    let query = { groupId }

    if (startISO && endISO) {
        query = {
            groupId,
            $or: [
                {
                    //Events fully within the range
                    start: { $gte: startISO },
                    end: { $lte: endISO }
                },
                {
                    //Events starting before the range but ending within it
                    start: { $lt: startISO },
                    end: { $gte: startISO }
                },
                {
                    //Events starting within the range but ending after it:
                    start: { $lte: endISO },
                    end: { $gt: endISO }
                }
            ]
        }
    }
    const events = Event
        .find(query)
        .select('_id title color start end groupId _ownerId specificLocation ')
        .lean();

    return events;
}

//Used for fetching event details
exports.getByIdWithMembers = async (event) => {
    // event is valid -> checked in eventMiddleware
    //added event details to request object

    const eventWithMembers = await event
        .populate({
            path: 'membersGoing',
            select: 'firstName lastName email profilePic'
        });

    //populate requests for event change here

    return eventWithMembers;

}

// ----------Used for validations only-----------

/*select only _id and eventOwer (id) for event with no other info. Used in 
eventMiddlewareWithOwnerMiddleware used for routes related to event change requests
and routes for delete event
*/
exports.getById = (eventId) => {
    const event = Event
        .findById(eventId)
        .select('_id groupId _ownerId')


    return event;
}


//used in eventMiddleware only - for : event details, update event, my calendar
exports.getByIdToValidate = (eventId) => {
    const event = Event
        .findById(eventId)

    return event;
}

//used to validate event and get its membersGoing field for attend and declineAttend functionality
exports.getByIdToValidateForAttendance = (eventId) => {
    const event = Event
        .findById(eventId)
        .select('membersGoing');

    return event;

}
// -------------------------------------

//My calendar functionality
exports.getUserAttendingEventsInRange = (currUserId, startISO, endISO) => {
    let query = { membersGoing: currUserId }
    if (startISO && endISO) {
        query = {
            membersGoing: currUserId,
            $or: [
                {
                    //Events fully within the range
                    start: { $gte: startISO },
                    end: { $lte: endISO }
                },
                {
                    //Events starting before the range but ending within it
                    start: { $lt: startISO },
                    end: { $gte: startISO }
                },
                {
                    //Events starting within the range but ending after it:
                    start: { $lte: endISO },
                    end: { $gt: endISO }
                }
            ]
        };
    }

    const events = Event
        .find(query)
        .select('_id title color start end groupId _ownerId')
        .populate({
            path: 'groupId',
            select: 'name'
        }) //show group name with events
        .lean();

    return events;

}

exports.create = async (title, color, description, specificLocation, start, end, activityTags, groupId, _ownerId) => {

    const group = await Group.findById(groupId);

    //Group exists and current user is a member of the group - guaranteed by middlewares

    //Check if there is an event in current group calendar with the same color
    const existingEvent = await Event.findOne({ color, groupId });
    if (!!existingEvent) {
        const error = new Error('В груповия календар съществува събитие, обозначено с посочения цвят. Изберете друг цвят!');
        error.statusCode = 400;
        throw error;
    }

    //TODO : валидиране на specificLocation - задължително трябва да има name и lat, lon и да бъде в рамките на областния град, 
    //зададен като основна локация за групата

    //Check if event's activityTags are unique (client input itself)
    checkForDuplicateTags(activityTags)

    //TODO: дали таговете които са зададени отговарят на таговете на текущата група
    if (!validateEventTags(group.activityTags, activityTags)) {
        const error = new Error('Невалидни тагове за групова активност за текущата група!');
        error.statusCode = 400;
        throw error;
    }

    //TODO: валидна дата която е преди текущото време


    const newEventData = {
        title,
        color,
        description,
        specificLocation,
        start,
        end,
        activityTags,
        groupId,
        _ownerId,
        membersGoing: [_ownerId] // Add the event creator to membersGoing by default upon event creation
    }

    let newEvent = await Event.create(newEventData);

    //Populated group info is needed for notifications
    newEvent = await newEvent
        .populate({
            path: 'groupId',
            select: 'name members._id'
        });

    return newEvent;

}

//DELETE EVENT 
exports.delete = async (eventIdToDelete, isCurrUserGroupAdmin) => {

    if (!isCurrUserGroupAdmin) {
        const error = new Error('Само администраторът на групата може да изтрива събития от груповия календар!');
        error.statusCode = 403;
        throw error;
    }

    //TODO: transaction
    await Event.findByIdAndDelete(eventIdToDelete);
    //Delete all requests for change for the deleted event
    await EventChangeRequest.deleteMany({ eventId: eventIdToDelete })

}

//MARK ATTENDANCE RELATED SERVICES


//Authentication middleware, groupMiddleware and isMemberMiddleware middlewares have already been executed by far
//which guarantees: 
/* 
    - currUserId is a valid user Id
    - the group is valid
    - current user is member of the group
 */

//currEvent format : {_id: eventId (of type ObjectId) , membersGoing [member ids (of type ObjectId)]}
exports.markAsGoing = async (currUserId, currEvent) => {

    //check if user is already marked as going to this event

    const memberIsGoing = currEvent.membersGoing.find(memberId => memberId.toString() === currUserId);

    if (memberIsGoing) {
        const error = new Error('Вече сте отбелязали своето присъствие!');
        error.statusCode = 400;
        throw error;
    }

    currEvent.membersGoing.push(currUserId);

    await currEvent.save();
}

exports.markAsAbsent = async (currUserId, currEvent) => {

    //check if user is already marked as going to this event first, so he can mark himself as absent

    const memberIsGoing = currEvent.membersGoing.find(memberId => memberId.toString() === currUserId);

    if (!memberIsGoing) {
        const error = new Error('Не можете да премахнете присъствие за събитие, на което не сте отбелязани като присъстващи!');
        error.statusCode = 400;
        throw error;
    }

    const newMembersGoing = currEvent.membersGoing.filter((memberId) => memberId.toString() !== currUserId);
    currEvent.membersGoing = newMembersGoing;

    await currEvent.save();

}