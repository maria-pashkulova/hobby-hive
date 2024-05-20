const router = require('express').Router();
const groupService = require('../services/groupService');


//TODO: да го преместя може би в groupController
//TODO : Search and filter
//http://localhost:5000/?category=sport&location=Plovdiv
router.get('/', async (req, res) => {
    console.log(req.user);
    const { name, category, location } = req.query;
    // console.log(req.query);

    const allGroups = await groupService.getAll(name, category, location);

    res.send(allGroups);
});

router.get('/404', (req, res) => {
    res.status(404).json({ msg: 'Page not found!' });
})


module.exports = router;