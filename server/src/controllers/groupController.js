const router = require('express').Router();
const groupManager = require('../services/groupService');

//path /groups/[...]

// router.get('/', (req, res) => {
//     res.send(groupManager.getAll());
// });

router.post('/create', (req, res) => {
    // console.log(req.body);
    //деструктурираме за да валидираме данните идващи от request-a
    const { name, location, description } = req.body;

    const createdGroup = groupManager.create(name, location, description);
    res.status(201).send(createdGroup);
});

router.get('/:groupId/details', (req, res) => {
    const group = groupManager.getById(req.params.groupId);

    if (!group) {
        return res.redirect('/404');
    }
    console.log(group);
    res.send(group);
})

module.exports = router;