const router = require('express').Router();
const groupService = require('../services/groupService');

//path /groups/[...]


router.get('/:groupId', async (req, res) => {

    try {
        const group = await groupService.getByIdWithEvents(req.params.groupId);
        res.json(group);

    } catch (error) {
        console.log(error);
        return res.redirect('/404');
    }

});

//CREATE
router.post('/', async (req, res) => {
    // console.log(req.body);
    //деструктурираме за да валидираме данните идващи от request-a
    const { name, category, location, description, members, imageUrl } = req.body;

    const createdGroup = await groupService.create(name, category, location, description, members, imageUrl);
    res.status(201).json(createdGroup);
});

//UPDATE
router.put('/:groupId', async (req, res) => {

    const { name, category, location, description, members, imageUrl } = req.body;


    await groupService.update(req.params.groupId, name, category, location, description, members, imageUrl);

    //TODO: ако има нужда да се изпрати редактирания обект
    res.status(204).end();
});

//DELETE
router.delete('/:groupId', async (req, res) => {

    await groupService.delete(req.params.groupId);
    res.status(204).end();
})


module.exports = router;