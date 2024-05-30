const router = require('express').Router();

const eventService = require('../services/eventService');

//Not RESTful path ?
// router.get('/:groupId', async (req, res) => {
//     //  const { start, end } = req.query;

//     const events = await eventService.getAllGroupEvents(req.params.groupId);

//     res.json(events);
// })


//CREATE
router.post('/', async (req, res) => {
    const { title, description, city, location, groupId } = req.body;
    const _ownerId = req.user._id;

    const createdEvent = await eventService.create(title, description, city, location, groupId, _ownerId);

    //attach newly created event to a single group with groupId : groupId
    // await groupService.attachEventToGroup(groupId, createdEvent._id); (child referencing approach)

    res.status(201).json(createdEvent);
});


module.exports = router;