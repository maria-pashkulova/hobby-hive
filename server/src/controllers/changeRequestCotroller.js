const router = require('express').Router();

//middlewares
const isAdminMiddleware = require('../middlewares/isAdminMiddleware');
const validateRequest = require('../middlewares/changeRequestMiddleware');

//services
const changeRequestService = require('../services/changeRequestService');

//req object -> req.eventId and req.eventOwnerId for all routes

//only group admin can view event requests (for all groups he is admin of)
router.get('/', isAdminMiddleware, async (req, res) => {
    const isCurrUserGroupAdmin = req.isAdmin;

    res.json({ message: 'Get all change reqests for event: ' + req.eventId });
})


router.post('/', isAdminMiddleware, async (req, res) => {

    const eventId = req.eventId
    const eventOwnerId = req.eventOwnerId;
    const { description } = req.body;
    const currUserId = req.user._id;
    const isCurrUserGroupAdmin = req.isAdmin;


    try {
        const newRequest = await changeRequestService.create(currUserId, isCurrUserGroupAdmin, eventId, eventOwnerId, description);
        res.status(200).json(newRequest);
    } catch (error) {
        res.status(error.statusCode || 500).json({
            message: error.message
        })
    }

})


//only group admin can delete event request (for all groups he is admin of)
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