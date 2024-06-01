const router = require('express').Router();

router.get('/', (req, res) => {
    const groupId = req.groupId;
    console.log(groupId);
    res.end();
    //retrieve all group posts
})

router.post('/', (req, res) => {
    try {

        //TODO

    } catch (error) {
        res.status(500).json({ message: error.message });
        console.log('Error in create post:', error.message);
    }
});


module.exports = router;