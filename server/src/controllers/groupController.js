const router = require('express').Router();

//други routers:
const eventController = require('./eventController');
const postController = require('./postController');

//middlewares
const getGroup = require('../middlewares/groupMiddleware');

const groupService = require('../services/groupService');

//path /groups/[...]

//TODO : Search and filter
//http://localhost:5000/groups?category=sport&location=Plovdiv

//READ
router.get('/', async (req, res) => {
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
    const { name, category, location, description, imageUrl, members } = req.body;
    const currUserId = req.user._id;

    //TODO: validate user input

    try {
        const createdGroup = await groupService.create(name, category, location, description, imageUrl, members, currUserId);

        const newGroupResult = {
            _id: createdGroup._id,
            name: createdGroup.name,
            category: createdGroup.category,
            description: createdGroup.description,
            location: createdGroup.location,
            imageUrl: createdGroup.imageUrl,
            membersCount: createdGroup.members.length
        }


        res.status(201).json(newGroupResult);

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }


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
});


//JOIN GROUP / ADD ANOTHER MEMBER TO A GROUP

router.put('/:groupId/addMember', async (req, res) => {
    const groupId = req.params.groupId;
    //текущо вписания потребител
    const currUserId = req.user._id;
    //_id - id на потребителят, който желаем да добавим
    const { _id } = req.body;

    try {
        await groupService.addMember(groupId, _id, currUserId);
        res.status(200).json({
            message: 'Успешно добавихте нов член към групата.'
        })
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }
});

//REMOVE MEMBER FROM A GROUP - само администратора на групата може да премахва потребители от групата
router.put('/:groupId/removeMember', async (req, res) => {
    const groupId = req.params.groupId;
    //текущо вписания потребител
    const currUserId = req.user._id;
    //_id - id на потребителят, който желаем да премахнем
    const { _id } = req.body;

    try {
        await groupService.removeMember(groupId, _id, currUserId);
        res.status(200).json({
            message: 'Успешно премахнахте член от групата.'
        })
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message,
        });
    }

})


//GROUP POSTS

router.use('/:groupId/posts', getGroup, postController);



//GROUP EVENTS
router.use('/:groupId/events', getGroup, eventController);



module.exports = router;