const router = require('express').Router();

//други routers:
const homeController = require('./controllers/homeController');
const groupController = require('./controllers/groupController');
const eventController = require('./controllers/eventController');
const userController = require('./controllers/userController');
const { isAuthenticated } = require('./middlewares/authenticationMiddleware');

router.use(homeController);
//partial route middleware
router.use('/users', userController);
router.use('/groups', isAuthenticated, groupController);
router.use('/events', eventController);
router.get('*', (req, res) => {
    res.redirect('/404');
});

module.exports = router;