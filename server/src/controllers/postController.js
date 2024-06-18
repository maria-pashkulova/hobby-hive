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
        //1. съществува ли такъв потребител - всъщност това ще го проверя за вс случай в edge cases
        //2. той съвпада ли с текущо логнатия потребител
        const groupId = req.groupId;

        //TODO validate -> направи да има или снимка или текстово описание, а не задължително текстово описание
        if (!text && !img) {
            return res.status(400).json({ message: 'Изисква се публикацията да съдържа или снимка, или описание' });
        }

        //check max length of text
        const maxLength = 500;
        if (text.length > maxLength) {
            return res.status(400).json({ message: `Твръде дълъг текст на публикацията! Лимит : ${maxLength} символа` });
        }

        const createdPost = await postService.createPost(text, img, _ownerId, groupId);

        res.status(201).json(createdPost);

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
        console.log('Error in create post:', error.message);
    }
});


module.exports = router;