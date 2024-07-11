const Group = require('../models/Group');
const Message = require('../models/Message');

exports.getGroupChat = async (groupId) => {

    const messages = Message.find({ groupId })
        .populate('sender', 'firstName lastName profilePic');

    return messages;
}

exports.createMessage = async (sender, content, groupId) => {

    const newMessageData = {
        sender,
        content,
        groupId
    }

    let newMessage = await Message.create(newMessageData);

    newMessage = await newMessage
        .populate({
            path: 'sender',
            select: 'firstName lastName profilePic'
        })
    newMessage = await newMessage
        .populate({
            path: 'groupId',
            select: ('members._id')
        });

    return newMessage;
}