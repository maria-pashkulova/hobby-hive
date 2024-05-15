const router = require('express').Router();

router.get('/create', (req, res) => {
    res.send('Create event in current group');
});


module.exports = router;