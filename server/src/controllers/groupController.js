const router = require('express').Router();

//други routers:
const eventController = require('./eventController');
const postController = require('./postController');

//middlewares
const getGroup = require('../middlewares/groupMiddleware');

const groupService = require('../services/groupService');

//path /groups/[...]

//TODO : Search and filter
//http://localhost:5000/groups?name=...&category=...&location=...&page=...&limit=...

//READ
router.get('/', async (req, res) => {
    const { name, category, location } = req.query;
    const page = parseInt(req.query.page || '0');
    const limit = parseInt(req.query.limit || '3')
    // console.log(req.query);

    try {
        const groupsResult = await groupService.getAll(name, category, location, page, limit);

        res.json(groupsResult);

    } catch (error) {
        //error handling just in case for edge cases
        res.status(500).json({ message: error.message });
    }

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
    const { name, category, location, description, imageUrl, members, activityTags } = req.body;
    const currUser = req.user;

    //TODO: validate user input - required fields!!!
    if (!name || !category || !location) {
        return res.status(400).json({ message: 'Името, категорията дейност и локацията за групата са задължителни!' })
    }


    try {
        const createdGroup = await groupService.create(name, category, location, description, imageUrl, members, activityTags, currUser);


        res.status(201).json(createdGroup);

    } catch (error) {
        //case: грешка при upload на снимка в cloudinary
        //case: опит за добавяне на невалидни членове в новосъздавана група
        res.status(500).json({
            message: error.message,
        });
    }


});

//UPDATE GROUP DETAILS
router.patch('/:groupId', async (req, res) => {

    const currUserId = req.user._id;
    const groupIdToUpdate = req.params.groupId;
    const { name, category, location, description, updatedActivityTags, newImg, currImg } = req.body;

    if (!name || !category || !location) {
        return res.status(400).json({ message: 'Името, категорията дейност и локацията за групата са задължителни!' })
    }

    try {
        const updatedGroup = await groupService.update(groupIdToUpdate, currUserId, name, category, location, description, updatedActivityTags, newImg, currImg);

        res.status(200).json(updatedGroup);

    } catch (error) {
        //500 status code -> ако cloudinary върне грешка

        res.status(error.statusCode || 500).json({ message: error.message });
        console.log('Error in update group details:', error.message);
    }


});

//DELETE
router.delete('/:groupId', async (req, res) => {

    await groupService.delete(req.params.groupId);
    res.status(204).end();
});


//JOIN GROUP / ADD ANOTHER MEMBER TO A GROUP

router.patch('/:groupId/addMember', async (req, res) => {
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
router.patch('/:groupId/removeMember', async (req, res) => {
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
        console.log(error);
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