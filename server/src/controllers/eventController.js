const router = require('express').Router();

const eventService = require('../services/eventService');

//middlewares 
const getEvent = require('../middlewares/eventMiddleware');
const getEventForAttendance = require('../middlewares/eventMiddlewareForAttendance');
const getEventWithOwner = require('../middlewares/eventWithOwnerMiddleware');
const isAdminMiddleware = require('../middlewares/isAdminMiddleware');

//GET ALL events for visible date range on calendar

router.get('/', async (req, res, next) => {

    const { start, end } = req.query;

    try {
        const events = await eventService.getAllGroupEvents(req.groupId, start, end);

        res.json(events);

    } catch (error) {
        next(error);
    }

})

//GET EVENT DETAILS 
// endpoint for fetching event details for events both from a particular Group calendar
//and from My calendar pages on the front-end
router.get('/:eventId', getEvent, async (req, res) => {

    const fetchedEvent = req.event; //Mongoose document!
    try {

        const event = await eventService.getByIdWithMembers(fetchedEvent);
        res.json(event);

    } catch (error) {
        //we are sure event exists because it is fetched in event middleware
        next(error);

    }
})


//CREATE EVENT
router.post('/', async (req, res, next) => {

    //TODO: validate input data with yup
    const _ownerId = req.user._id; // current logged in user is event owner
    const groupId = req.groupId;

    try {
        const createdEvent = await eventService.create(req.body, groupId, _ownerId);

        res.status(201).json(createdEvent);

    } catch (error) {
        next(error);
    }

});

//UPDATE EVENT

router.put('/:eventId', isAdminMiddleware, getEvent, async (req, res, next) => {

    //TODO: validate input data with yup

    const currUserId = req.user._id;
    const isCurrUserGroupAdmin = req.isAdmin;
    const eventIdToUpdate = req.params.eventId;
    const existingEvent = req.event // Mongoose document with all event current data (from getEvent)
    const newEventData = req.body;
    const groupId = req.groupId; //comes from getGroup middleware


    try {
        const updatedEvent = await eventService.update(eventIdToUpdate, existingEvent, newEventData, groupId, currUserId, isCurrUserGroupAdmin);

        res.json(updatedEvent);
    } catch (error) {
        next(error);
    }

})

//DELETE EVENT

router.delete('/:eventId', isAdminMiddleware, getEventWithOwner, async (req, res, next) => {
    const isCurrUserGroupAdmin = req.isAdmin;
    const eventIdToDelete = req.eventId; // comes from getEventWithOwner middleware; same as req.params.eventId
    try {
        const deletedEventInfo = await eventService.delete(eventIdToDelete, isCurrUserGroupAdmin);
        res.status(200).json(deletedEventInfo);

    } catch (error) {
        next(error);
    }
})

//MARK ATTENDANCE
//groupMiddleware and isMemberMiddleware middlewares have already been executed by far
router.put('/:eventId/markAttendance', getEventForAttendance, async (req, res, next) => {

    const fetchedEvent = req.event; //Mongoose document!
    const currUserId = req.user._id;

    try {
        const response = await eventService.markAsGoing(currUserId, fetchedEvent);
        res.status(200).json(response);
    } catch (error) {
        next(error)
    }

});


//REVOKE ATTENDANCE
router.put('/:eventId/revokeAttendance', getEventForAttendance, async (req, res, next) => {
    const fetchedEvent = req.event; //Mongoose document!
    const currUserId = req.user._id;

    try {
        await eventService.markAsAbsent(currUserId, fetchedEvent);
        res.status(200).json({
            message: 'Успешно премахнахте своето присъствие!'
        })
    } catch (error) {
        next(error);
    }
});


module.exports = router;