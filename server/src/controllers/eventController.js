const router = require('express').Router();

router.post('/create', (req, res) => {
    res.send('Create event in current group');
});


module.exports = router;