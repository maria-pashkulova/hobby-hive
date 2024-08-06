const router = require('express').Router();

const eventService = require('../services/eventService');

//middlewares 
const getEvent = require('../middlewares/eventMiddleware');


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


//CREATE
router.post('/', async (req, res) => {
    const { title, color, description, specificLocation, start, end, activityTags } = req.body;
    const _ownerId = req.user._id; //текущо вписания потребител е owner на event-a
    //клиента не изпраща данни за това
    const groupId = req.groupId;


    try {
        const createdEvent = await eventService.create(title, color, description, specificLocation, start, end, activityTags, groupId, _ownerId);

        res.status(201).json(createdEvent);

    } catch (error) {
        //errors with name ValidationError will be returned with status code 500
        res.status(error.statusCode || 500).json({ message: error.message });
        console.log('Error in create event:', error.message);
    }

});


module.exports = router;