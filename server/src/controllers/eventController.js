const router = require('express').Router();

const eventService = require('../services/eventService');


// router.get('/', async (req, res) => {
//     const { start, end } = req.query;

//     const events = await eventService.getAll(start, end);

//     res.send(events);
// })

router.post('/create', async (req, res) => {
    const { title, description, city, location, status, groupId } = req.body;

    const createdEvent = await eventService.create(title, description, city, location, status, groupId);
    res.status(201).send(createdEvent);
});


module.exports = router;