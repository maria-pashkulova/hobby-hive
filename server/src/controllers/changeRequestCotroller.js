const router = require('express').Router();

//middlewares
const getEventForChangeRequest = require('../middlewares/eventWithOwnerMiddleware');
const isAdminMiddleware = require('../middlewares/isAdminMiddleware');
const validateRequest = require('../middlewares/changeRequestMiddleware');

//services
const changeRequestService = require('../services/changeRequestService');


//only group admin can view group event requests (for all groups he is admin of)
router.get('/', isAdminMiddleware, async (req, res) => {
    const isCurrUserGroupAdmin = req.isAdmin;
    const groupId = req.groupId;
    const page = parseInt(req.query.page || '0');
    const limit = parseInt(req.query.limit || '6');

    try {

        const changeRequestsResult = await changeRequestService.getAll(isCurrUserGroupAdmin, groupId, page, limit);
        res.json(changeRequestsResult);

    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        });
    }
})


//req object -> req.eventId and req.eventOwnerId for requests with method: post

router.post('/', getEventForChangeRequest, isAdminMiddleware, async (req, res) => {

    const groupId = req.groupId;
    const eventId = req.eventId
    const eventOwnerId = req.eventOwnerId;
    const { description } = req.body;
    const currUserId = req.user._id;
    const isCurrUserGroupAdmin = req.isAdmin;


    try {
        const newRequest = await changeRequestService.create(currUserId, isCurrUserGroupAdmin, groupId, eventId, eventOwnerId, description);
        res.status(200).json(newRequest);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        })
    }

})


//only group admin can delete (= mark as done) group event request (for all groups he is admin of)
router.delete('/:requestId', validateRequest, isAdminMiddleware, async (req, res) => {
    const isCurrUserGroupAdmin = req.isAdmin;
    const requestIdToDelete = req.params.requestId;

    try {
        await changeRequestService.delete(isCurrUserGroupAdmin, requestIdToDelete);
        res.status(204).end();
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        })
    }

})


module.exports = router;