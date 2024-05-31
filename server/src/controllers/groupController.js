const router = require('express').Router();
const groupService = require('../services/groupService');
const eventService = require('../services/eventService');

//path /groups/[...]

//TODO : Search and filter
//http://localhost:5000/groups?category=sport&location=Plovdiv

//READ
router.get('/', async (req, res) => {
    console.log(req.user);
    const { name, category, location } = req.query;
    // console.log(req.query);

    const allGroups = await groupService.getAll(name, category, location);

    res.json(allGroups);
});



router.get('/:groupId', async (req, res) => {

    try {

        //ако въведа несъществуващо id се хврърля Mongoose грешка
        //и приложението (server) спира да работи?
        const group = await groupService.getById(req.params.groupId);

        res.json(group);

    } catch (error) {

        //грешка ако върне null - аз я хвърлям
        //Mongoose грешка - ако е подаден невалиден стринг който да се кастне към objectID
        res.status(404).json({ message: error.message });
    }

});

//CREATE
router.post('/', async (req, res) => {
    // console.log(req.body);
    //деструктурираме за да валидираме данните идващи от request-a
    const { name, category, location, description, imageUrl } = req.body;
    const groupAdmin = req.user._id;

    const createdGroup = await groupService.create(name, category, location, description, imageUrl, groupAdmin);
    res.status(201).json(createdGroup);
});

//UPDATE
router.put('/:groupId', async (req, res) => {

    const { name, category, location, description, members, imageUrl } = req.body;


    await groupService.update(req.params.groupId, name, category, location, description, members, imageUrl);

    //TODO: ако има нужда да се изпрати редактирания обект
    res.status(204).end();
});

//DELETE
router.delete('/:groupId', async (req, res) => {

    await groupService.delete(req.params.groupId);
    res.status(204).end();
})


//GROUP EVENTS
router.get('/:groupId/events', async (req, res) => {
    const events = await eventService.getAllGroupEvents(req.params.groupId);

    res.json(events);
})

module.exports = router;