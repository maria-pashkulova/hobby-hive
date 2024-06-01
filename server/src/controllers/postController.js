const router = require('express').Router();

const postService = require('../services/postService');


router.get('/', async (req, res) => {

    try {
        const posts = await postService.getAllGroupPosts(req.groupId);

        res.json(posts);

    } catch (error) {
        //case : Mongoose грешка - ако groupId e невалидно ObjectId - todo проверка преди заявка
        res.status(404).json({ message: error.message });
        console.log('Error in get group events:', error.message);
    }

})


router.post('/', async (req, res) => {
    try {

        const { text, img } = req.body;
        const _ownerId = req.user._id; //текущо вписания потребител е owner на post-a
        //клиента не изпраща данни за това и не се налага да проверявам:
        //1. съществува ли такъв потребител
        //2. той съвпада ли с текущо логнатия потребител
        const groupId = req.groupId;

        //TODO validate
        if (!text) {
            return res.status(400).json({ message: 'Text and posted by fields are required!' });
        }

        //check max length of text
        const maxLength = 700;
        if (text.length > maxLength) {
            return res.status(400).json({ message: `Твръде дълъг текст на публикацията! Лимит : ${maxLength}` });
        }

        const createdPost = await postService.createPost(text, img, _ownerId, groupId);

        res.status(201).json(createdPost);

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
        console.log('Error in create post:', error.message);
    }
});


module.exports = router;