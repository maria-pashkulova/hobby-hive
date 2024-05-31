const router = require('express').Router();

//други routers:
const groupController = require('./controllers/groupController');
const eventController = require('./controllers/eventController');
const userController = require('./controllers/userController');
const { auth } = require('./middlewares/authenticationMiddleware');

//partial route middleware
router.use('/users', userController);
router.use('/groups', auth, groupController);
router.use('/events', auth, eventController);
router.get('*', (req, res) => {
    res.status(404).json({ message: 'Endpoint not found!' });
});

module.exports = router;