const router = require('express').Router();

const eventService = require('../services/eventService');
const groupService = require('../services/groupService');


// router.get('/', async (req, res) => {
//     const { start, end } = req.query;

//     const events = await eventService.getAll(start, end);

//     res.send(events);
// })


//CREATE
router.post('/', async (req, res) => {
    const { title, description, city, location, status, groupId } = req.body;

    const createdEvent = await eventService.create(title, description, city, location, status, groupId);

    //attach newly created event to a single group with groupId : groupId
    await groupService.attachEventToGroup(groupId, createdEvent._id);

    res.status(201).json(createdEvent);
});


module.exports = router;