const Event = require('../models/Event');
const Group = require('../models/Group');
const EventChangeRequest = require('../models/EventChangeRequest');
const { checkForDuplicateTags } = require('../utils/validateGroupData');
const { validateEventTags, normalizeLocationCoordinates, checkIsFutureEvent } = require('../utils/validateEventData');
const checkIsObjectEmpty = require('../utils/checkIsObjectEmpty');


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


//used in eventMiddleware only - for : event details fetched from both group and my calendar pages

exports.getByIdToValidate = (eventId) => {
    const event = Event
        .findById(eventId)
        .select('title color start end description specificLocation activityTags membersGoing groupId _ownerId')

    return event;
}

//used to validate event and get its membersGoing field for attend and declineAttend functionality
exports.getByIdToValidateForAttendance = (eventId) => {
    const event = Event
        .findById(eventId)
        .select('membersGoing start');

    return event;

}

exports.getByIdToValidatePastEventActions = (eventId) => {
    const eventWithStartDate = Event
        .findById(eventId)
        .select('start');

    return eventWithStartDate;
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

    //Check if there is an event in current group calendar with the same color
    const existingEventWithSameColor = await Event.findOne({ color, groupId });
    if (!!existingEventWithSameColor) {
        const error = new Error('В груповия календар съществува събитие, обозначено с посочения цвят. Изберете друг цвят!');
        error.statusCode = 400;
        throw error;
    }

    //TODO: валидна дата която е преди текущото време

    //Check if event's activityTags are unique (client input itself)
    checkForDuplicateTags(activityTags)

    //Group exists and current user is a member of the group - guaranteed by middlewares
    const group = await Group
        .findById(groupId)
        .select('name members._id activityTags');

    //Check if added activity tags for event correspond with group activity tags
    if (!validateEventTags(group.activityTags, activityTags)) {
        const error = new Error('Невалидни тагове за групова активност за текущата група!');
        error.statusCode = 400;
        throw error;
    }

    //Round lat and lon values for location to 5 decimal places before storing it to DB
    let locationObjWithRoundedCoordinates;
    if (!checkIsObjectEmpty(specificLocation)) {
        const roundedLocationCoordinates = normalizeLocationCoordinates(specificLocation.coordinates)

        locationObjWithRoundedCoordinates = { ...specificLocation, coordinates: roundedLocationCoordinates };
    }


    const newEventData = {
        title,
        color,
        description,
        specificLocation: locationObjWithRoundedCoordinates || specificLocation, //if no location was selected, specificLocation is empty object and an object with default values is saved in DB
        start,
        end,
        activityTags,
        groupId,
        _ownerId,
        membersGoing: [_ownerId] // Add the event creator to membersGoing by default upon event creation
    }

    let newEvent = await Event.create(newEventData);

    //Populated group info is needed for notifications
    //TODO : manually
    newEvent = await newEvent
        .populate({
            path: 'groupId',
            select: 'name members._id'
        });

    return newEvent;

}

//UPDATE EVENT
//Group administrator and event creator can update event
exports.update = async (eventIdToUpdate, existingEvent, newEventData, groupId, currUserId, isCurrUserGroupAdmin) => {

    const { title, color, description, start, end, activityTags } = newEventData;
    let { specificLocation } = newEventData;

    if (!checkIsFutureEvent(existingEvent.start)) {
        const error = new Error('Датата на провеждане на събитието е минала! Не можете да редактирате минали събития, те могат да бъдат единствено изтрити от администратора на групата!');
        error.statusCode = 400;
        throw error;
    }

    if ((existingEvent._ownerId.toString() !== currUserId && !isCurrUserGroupAdmin)) {
        const error = new Error('Само администраторът на групата и потребителят, създал събитието могат да го редактират!');
        error.statusCode = 403;
        throw error;
    }

    //Check if there is an event in current group calendar with the same color - except the current event being validated
    const existingEventWithSameColor = await Event.findOne({ _id: { $ne: eventIdToUpdate }, color, groupId });
    if (!!existingEventWithSameColor) {
        const error = new Error('В груповия календар съществува събитие, обозначено с посочения цвят. Изберете друг цвят!');
        error.statusCode = 400;
        throw error;
    }

    //TODO: валидна дата която е преди текущото време

    //Check if event's activityTags are unique (client input itself)
    checkForDuplicateTags(activityTags)

    //Group exists and current user is a member of the group - guaranteed by middlewares
    const group = await Group
        .findById(groupId)
        .select('name activityTags');

    //Check if added activity tags for event correspond with group activity tags
    if (!validateEventTags(group.activityTags, activityTags)) {
        const error = new Error('Невалидни тагове за групова активност за текущата група!');
        error.statusCode = 400;
        throw error;
    }

    //Round lat and lon values for location to 5 decimal places before storing it to DB (if location from Openstreet API is set)
    let locationObjWithRoundedCoordinates;

    //Possible cases : user has removed previous location -> specificLocation = {}
    //user has not changed location and if was the default 'No location set' object -> specificLocation = {name:'Не е зададена локация за събитието', locationRegionCity:'', coordinates:[]}
    //user has not changed location and it was some valid location from Openstreet map -> specific location ={object with rounded lat and lon}

    //Check if new location is the default 'No location set' object - then skip normalizing lat and lon because it is empty array
    //and error wil be thrown
    if (!checkIsObjectEmpty(specificLocation) && specificLocation.name !== 'Не е зададена локация за събитието') {

        const roundedLocationCoordinates = normalizeLocationCoordinates(specificLocation.coordinates)
        locationObjWithRoundedCoordinates = { ...specificLocation, coordinates: roundedLocationCoordinates };
    }

    //If user has removed location and has not selected new one , specificLocation = {}
    //Replace it with default 'No selected location' object, otherwise the field will be removed from event document
    if (checkIsObjectEmpty(specificLocation)) {
        specificLocation = {
            name: 'Не е зададена локация за събитието',
            locationRegionCity: '',
            coordinates: []
        }
    }

    existingEvent.title = title;
    existingEvent.color = color;
    existingEvent.description = description;
    existingEvent.specificLocation = locationObjWithRoundedCoordinates || specificLocation //if no location was selected default object is saved in DB
    existingEvent.start = start;
    existingEvent.end = end;
    existingEvent.activityTags = activityTags;

    //membersGoing, groupId and ownerId are left unchanged

    //Save changes
    const updatedEvent = await existingEvent.save();


    return {
        title: updatedEvent.title,
        color: updatedEvent.color,
        description: updatedEvent.description,
        specificLocation: updatedEvent.specificLocation,
        start: updatedEvent.start,
        end: updatedEvent.end,
        activityTags: updatedEvent.activityTags,
        _ownerId: updatedEvent._ownerId,
        groupId: {
            _id: group._id,
            name: group.name
        }
    }

}

//DELETE EVENT 
//Only group administrator can delete group events
exports.delete = async (eventIdToDelete, isCurrUserGroupAdmin) => {

    if (!isCurrUserGroupAdmin) {
        const error = new Error('Само администраторът на групата може да изтрива събития от груповия календар!');
        error.statusCode = 403;
        throw error;
    }

    //TODO: transaction
    const deletedEventInfo = await Event
        .findByIdAndDelete(eventIdToDelete)
        .select('title start color membersGoing groupId')
        .populate('groupId', 'groupAdmin name');

    //Delete all requests for change for the deleted event
    await EventChangeRequest.deleteMany({ eventId: eventIdToDelete })

    return {
        eventName: deletedEventInfo.title,
        eventColor: deletedEventInfo.color,
        eventStart: deletedEventInfo.start,
        groupName: deletedEventInfo.groupId.name,
        groupAdmin: deletedEventInfo.groupId.groupAdmin,
        membersToNotify: deletedEventInfo.membersGoing
    }
}

//MARK ATTENDANCE RELATED SERVICES


//Authentication middleware, groupMiddleware and isMemberMiddleware middlewares have already been executed by far
//which guarantees: 
/* 
    - currUserId is a valid user Id
    - the group is valid
    - current user is member of the group
 */
//getEventForAttendance guarantees requested even is future event
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