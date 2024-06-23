const router = require('express').Router();

//други routers:
const groupController = require('./controllers/groupController');
const userController = require('./controllers/userController');
const categoryController = require('./controllers/categoryController');
const locationController = require('./controllers/locationController');

const auth = require('./middlewares/authenticationMiddleware');

//partial route middleware
router.use('/users', userController);
router.use('/groups', auth, groupController);
router.use('/categories', auth, categoryController);
router.use('/locations', auth, locationController);
router.get('*', (req, res) => {
    res.status(404).json({ message: 'Endpoint not found!' });
});

module.exports = router;