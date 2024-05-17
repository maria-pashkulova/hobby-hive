const router = require('express').Router();
const groupService = require('../services/groupService');

//path /groups/[...]

// router.get('/', (req, res) => {
//     res.send(groupManager.getAll());
// });

router.post('/create', async (req, res) => {
    // console.log(req.body);
    //деструктурираме за да валидираме данните идващи от request-a
    const { name, category, location, description, members, imageUrl } = req.body;

    const createdGroup = await groupService.create(name, category, location, description, members, imageUrl);
    res.status(201).send(createdGroup);
});

router.get('/:groupId/details', async (req, res) => {

    try {
        const group = await groupService.getByIdWithEvents(req.params.groupId);
        res.send(group);

    } catch (error) {
        console.log(error);
        return res.redirect('/404');
    }

})

router.delete('/:id', (req, res) => {
    res.json({ msg: 'Delete a group' });
})

router.patch('/:id', (req, res) => {
    res.json({ msg: 'Update a group' });
})

module.exports = router;