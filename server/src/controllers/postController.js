const router = require('express').Router();

const postService = require('../services/postService');

//get posts with pagination (as infinite scroll at the front end)
router.get('/', async (req, res) => {

    const groupId = req.groupId;
    const page = parseInt(req.query.page || '1');
    const limit = parseInt(req.query.limit || '3');

    try {
        const postsResult = await postService.getAllGroupPosts(groupId, page, limit);

        res.json(postsResult);

    } catch (error) {
        //case : Mongoose грешка - ако groupId e невалидно ObjectId - todo проверка преди заявка
        res.status(404).json({ message: error.message });
        console.log('Error in get group events:', error.message);
    }

})

//get user's posts in the current group - needed for update and delete
//задължително преди долния път
//a parametric path inserted just before a literal one takes the precedence over the literal one.
router.get('/user-posts', async (req, res) => {

    const groupId = req.groupId;
    const currUser = req.user;

    try {

        const userPosts = await postService.getUserPostsForGroup(groupId, currUser)

        res.json(userPosts);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
});


//get one
router.get('/:postId', async (req, res) => {
    try {
        const post = await postService.getById(req.params.postId);
        res.json(post);

    } catch (error) {

        //грешка ако върне null - аз я хвърлям
        //Mongoose грешка - ако е подаден невалиден стринг който да се кастне към objectID
        res.status(error.statusCode || 500).json({ message: error.message });
    }
})

//CREATE POST
router.post('/', async (req, res) => {
    try {

        const { text, img } = req.body;
        const _ownerId = req.user._id; //текущо вписания потребител е owner на post-a
        //клиента не изпраща данни за това и не се налага да проверявам:
        //1. той съвпада ли с текущо логнатия потребител
        const groupId = req.groupId;

        //TODO validate -> да има или снимка или текстово описание, а не задължително текстово описание
        if (!text && !img) {
            return res.status(400).json({ message: 'Изисква се публикацията да съдържа поне или снимка, или описание' });
        }

        //check max length of text
        const maxLength = 500;
        if (text.length > maxLength) {
            return res.status(400).json({ message: `Твръде дълъг текст на публикацията! Лимит : ${maxLength} символа` });
        }

        const createdPost = await postService.createPost(text, img, _ownerId, groupId);

        res.status(201).json(createdPost);

    } catch (error) {

        //евентуално грешки от cloudinary
        res.status(error.statusCode || 500).json({ message: error.message });
        console.log('Error in create post:', error.message);
    }
});

//EDIT POST

router.put('/:postId', async (req, res) => {
    const currUserId = req.user._id;
    const postIdToEdit = req.params.postId;
    const { text, newImg, currImg } = req.body;

    //case: потребителят е изтрил текста и е махнал снимките ако е имало такива
    //и не е прикачил нова снимка -> реално публикацията трябва да има поне текст
    //или поне снимка
    if (!text && !newImg && !currImg) {
        return res.status(400).json({ message: 'Изисква се публикацията да съдържа поне или снимка, или описание' });
    }

    //check max length of text
    const maxLength = 500;
    if (text.length > maxLength) {
        return res.status(400).json({ message: `Твръде дълъг текст на публикацията! Лимит : ${maxLength} символа` });
    }

    try {

        const updatedPost = await postService.edit(postIdToEdit, currUserId, text, newImg, currImg)

        res.json(updatedPost);
    } catch (error) {

        //500 status code -> ако cloudinary върне грешка

        res.status(error.statusCode || 500).json({ message: error.message });
        console.log('Error in update post:', error.message);
    }
})

//DELETE POST
router.delete('/:postId', async (req, res) => {
    const currUserId = req.user._id;
    try {
        await postService.delete(req.params.postId, currUserId);
        res.status(204).end();

    } catch (error) {

        //грешка ако върне null - аз я хвърлям
        //Mongoose грешка - ако е подаден невалиден стринг който да се кастне към objectID
        //500 status code -> ако cloudinary върне грешка
        res.status(error.statusCode || 500).json({ message: error.message });
    }
})


module.exports = router;