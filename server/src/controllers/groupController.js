const router = require('express').Router();
const groupSevice = require('../services/groupService');

//path /groups/[...]

// router.get('/', (req, res) => {
//     res.send(groupManager.getAll());
// });

router.post('/create', async (req, res) => {
    // console.log(req.body);
    //деструктурираме за да валидираме данните идващи от request-a
    const { name, location, category, description, imageUrl } = req.body;

    const createdGroup = await groupSevice.create(name, location, category, description, imageUrl);
    res.status(201).send(createdGroup);
});

router.get('/:groupId/details', (req, res) => {
    const group = groupSevice.getById(req.params.groupId);

    if (!group) {
        return res.redirect('/404');
    }
    console.log(group);
    res.send(group);
})

router.delete('/:id', (req, res) => {
    res.json({ msg: 'Delete a group' });
})

router.patch('/:id', (req, res) => {
    res.json({ msg: 'Update a group' });
})

module.exports = router;