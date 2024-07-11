const router = require('express').Router();
const chatService = require('../services/chatService');

//Get all messages for the current group
router.get('/', async (req, res) => {
    const groupId = req.groupId;

    try {
        const messages = await chatService.getGroupChat(groupId);

        res.json(messages);

    } catch (error) {
        //case : Mongoose грешка - ако groupId e невалидно ObjectId
        res.status(404).json({ message: error.message });
        console.log('Error in get group messages:', error.message);
    }

});

//create message
router.post('/', async (req, res) => {

    const { content } = req.body;
    const sender = req.user._id;
    const groupId = req.groupId;

    if (!content) {
        return res.status(400).json({ message: 'Съдържанието на съобщението е задължително' });
    }

    try {
        const createdMessage = await chatService.createMessage(sender, content, groupId);
        res.status(201).json(createdMessage);

    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
        console.log('Error in create message:', error.message);
    }
});

module.exports = router;