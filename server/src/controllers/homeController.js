const router = require('express').Router();
const groupManager = require('../services/groupService');

//http://localhost:5000/?category=sport&location=Plovdiv
router.get('/', (req, res) => {
    const { name, category, location } = req.query;
    // console.log(req.query);
    res.send(groupManager.getAll(name, category, location));
});

router.get('/404', (req, res) => {
    res.send('Page not found!');
})


module.exports = router;