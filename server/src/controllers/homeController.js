const router = require('express').Router();
const { auth } = require('../middlewares/authenticationMiddleware');
const groupService = require('../services/groupService');


//TODO: да го преместя може би в groupController
//TODO : Search and filter
//http://localhost:5000/?category=sport&location=Plovdiv

//READ
router.get('/', auth, async (req, res) => {
    console.log(req.user);
    const { name, category, location } = req.query;
    // console.log(req.query);

    const allGroups = await groupService.getAll(name, category, location);

    res.json(allGroups);
});

router.get('/404', (req, res) => {
    res.status(404).json({ message: 'Endpoint not found!' });
})


module.exports = router;