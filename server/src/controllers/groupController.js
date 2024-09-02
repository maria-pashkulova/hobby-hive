const router = require('express').Router();

//други routers:
const eventController = require('./eventController');
const changeRequestController = require('./changeRequestController');
const postController = require('./postController');
const chatController = require('./chatController');


//middlewares
const getGroup = require('../middlewares/groupMiddleware');
const isMemberMiddleware = require('../middlewares/isMemberMiddleware');
const isAdminMiddleware = require('../middlewares/isAdminMiddleware');

const groupService = require('../services/groupService');

//path /groups/[...]

//Search and filter
//http://localhost:5000/groups?name=...&category=...&location=...&page=...&limit=...

//READ
router.get('/', async (req, res, next) => {
    const { name, category, location } = req.query;
    const page = parseInt(req.query.page || '0');
    const limit = parseInt(req.query.limit || '3')

    try {
        const groupsResult = await groupService.getAll(name, category, location, page, limit);

        res.json(groupsResult);

    } catch (error) {
        next(error);
    }

});


router.get('/:groupId', getGroup, async (req, res, next) => {

    try {

        const group = await groupService.getById(req.params.groupId);

        res.json(group);

    } catch (error) {
        //We are sure group exists because it is fetched in group middleware
        next(error);
    }

});

//CREATE
router.post('/', async (req, res, next) => {

    //TODO: validate group input data
    const currUser = req.user;

    try {
        const createdGroup = await groupService.create(req.body, currUser);


        res.status(201).json(createdGroup);

    } catch (error) {
        //case: грешка при upload на снимка в cloudinary
        //case: опит за добавяне на невалидни членове в новосъздавана група
        next(error)
    }


});

//UPDATE GROUP DETAILS
router.put('/:groupId', getGroup, isAdminMiddleware, async (req, res, next) => {

    //TODO: validate group input data

    const groupIdToUpdate = req.params.groupId;
    const isCurrUserGroupAdmin = req.isAdmin;

    try {
        const updatedGroup = await groupService.update(groupIdToUpdate, isCurrUserGroupAdmin, req.body);

        res.status(200).json(updatedGroup);

    } catch (error) {
        next(error)
    }


});

//JOIN GROUP / ADD ANOTHER MEMBER TO A GROUP

router.put('/:groupId/addMember', getGroup, async (req, res, next) => {
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
        next(error);
    }
});

//REMOVE MEMBER FROM A GROUP - само администратора на групата може да премахва потребители от групата
router.put('/:groupId/removeMember', getGroup, isAdminMiddleware, async (req, res, next) => {
    const groupId = req.params.groupId;
    const isCurrUserGroupAdmin = req.isAdmin;
    //текущо вписания потребител
    const currUserId = req.user._id;
    //_id - id на потребителят, който желаем да премахнем
    const { _id } = req.body;

    try {
        await groupService.removeMember(groupId, _id, currUserId, isCurrUserGroupAdmin);
        res.status(200).json({
            message: 'Успешно премахнахте член от групата.'
        })
    } catch (error) {
        next(error)
    }

})


//GROUP POSTS

router.use('/:groupId/posts', getGroup, postController);


//Only group members have access to group events and chat -> isMemberMiddleware

//GROUP EVENTS
router.use('/:groupId/events', getGroup, isMemberMiddleware, eventController);

//GROUP CHAT
router.use('/:groupId/chat', getGroup, isMemberMiddleware, chatController);


//Handle requests for group event update
//Existence of group and group membership are validated by getGroup and isMemberMiddleware middlewares

router.use('/:groupId/groupEventChangeRequests', getGroup, isMemberMiddleware, changeRequestController);


module.exports = router;