const router = require('express').Router();

//други routers:
const homeController = require('./controllers/homeController');
const groupController = require('./controllers/groupController');

router.use(homeController);
//partial route middleware
router.use('/groups', groupController);
router.get('*', (req, res) => {
    res.redirect('/404');
});

module.exports = router;