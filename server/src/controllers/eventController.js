const router = require('express').Router();

const eventService = require('../services/eventService');

//middlewares 
const getEvent = require('../middlewares/eventMiddleware');
const getEventForAttendance = require('../middlewares/eventMiddlewareForAttendance');
const getEventWithOwner = require('../middlewares/eventWithOwnerMiddleware');
const isAdminMiddleware = require('../middlewares/isAdminMiddleware');

//GET ALL events for visible date range on calendar

router.get('/', async (req, res) => {

    const { start, end } = req.query;

    try {
        const events = await eventService.getAllGroupEvents(req.groupId, start, end);

        res.json(events);

    } catch (error) {
        //case : Mongoose грешка - ако groupId e невалидно ObjectId
        res.status(404).json({ message: error.message });
        console.log('Error in get group events:', error.message);
    }

})

//GET EVENT DETAILS
router.get('/:eventId', getEvent, async (req, res) => {

    const fetchedEvent = req.event;
    try {

        const event = await eventService.getByIdWithMembers(fetchedEvent);
        res.json(event);

    } catch (error) {
        //we are sure event exists because it is fetched in event middleware
        res.status(500).json({ message: 'Сървърна грешка' });

    }
})


//CREATE EVENT
router.post('/', async (req, res) => {
    const { title, color, description, specificLocation, start, end, activityTags } = req.body;
    const _ownerId = req.user._id; //текущо вписания потребител е owner на event-a
    //клиента не изпраща данни за това
    const groupId = req.groupId;


    //TODO: regionCity : location.address.county || state -- use openstreet map for reverse geocoding -> (lat,lon) to get location's county | state (server-side)
    //Трябва да проверя дали 
    /* specificLocation
    {
        name: 'Варна, Варна',
        locationRegionCity: 'Варна',
        coordinates: [ 43.2073873, 27.9166653 ]
    }
     */
    /*от координатите на избрана локация мога да получа нейния областен град, ако 
    сървърът комуникира с openstreet map
    или може да ползвам идващата от клиента инфо за същото - locationRegionCity,
    но не съм сигурна че ще ми го прати ппц и може да не искам да разчитам, а да си го извлека от координатите
    то и за координатите дали са пратени нямам проверка

    и трябва да сравня и на бекенда дали съвпада с локацията на групата
    */

    try {
        const createdEvent = await eventService.create(title, color, description, specificLocation, start, end, activityTags, groupId, _ownerId);

        res.status(201).json(createdEvent);

    } catch (error) {
        //errors with name ValidationError will be returned with status code 500
        res.status(error.statusCode || 500).json({ message: error.message });
        console.log('Error in create event:', error.message);
    }

});

//DELETE EVENT
//Only group administrator can delete group events

router.delete('/:eventId', isAdminMiddleware, getEventWithOwner, async (req, res) => {
    const isCurrUserGroupAdmin = req.isAdmin;
    const eventIdToDelete = req.eventId; // comes from getEventWithOwner middleware; same as req.params.eventId
    try {
        await eventService.delete(eventIdToDelete, isCurrUserGroupAdmin);
        res.status(204).end();

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
})

//MARK ATTENDANCE
//groupMiddleware and isMemberMiddleware middlewares have already been executed by far
router.put('/:eventId/markAttendance', getEventForAttendance, async (req, res) => {

    const fetchedEvent = req.event; //Mongoose document!
    const currUserId = req.user._id;

    try {
        await eventService.markAsGoing(currUserId, fetchedEvent);
        res.status(200).json({
            message: 'Успешно отбелязахте своето присъствие!'
        })
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }

});


//REVOKE ATTENDANCE
router.put('/:eventId/revokeAttendance', getEventForAttendance, async (req, res) => {
    const fetchedEvent = req.event; //Mongoose document!
    const currUserId = req.user._id;

    try {
        await eventService.markAsAbsent(currUserId, fetchedEvent);
        res.status(200).json({
            message: 'Успешно премахнахте своето присъствие!'
        })
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
});


module.exports = router;