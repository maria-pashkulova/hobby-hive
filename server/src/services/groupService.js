const Group = require('../models/Group');
const User = require('../models/User');
const mongoose = require('mongoose');

const GROUP_PICS_FOLDER = 'group-pics';
const { uploadToCloudinary, destroyFromCloudinary } = require('../utils/cloudinaryUtils');

const { validateAddedOtherMembers, checkForDuplicateUsers, validateCategoryAndLocation } = require('../utils/validateGroupData');

//ако една функция просто ще взима и връща promise, няма нужда да
//awaitваме, защото на ниво контролер ще я awaitваме пак


exports.getAll = async (name, category, location) => {

    // Initialize the aggregation pipeline array
    const pipeline = [];

    //TODO: validate category and name with util

    // Add $match stage to the pipeline if name, category or location are provided
    if (name || category || location) {
        const matchStage = {};
        if (name) {
            matchStage.name = { $regex: name, $options: 'i' } //case-insensitive search
        }
        if (category) {
            // Convert category to ObjectId - error ocurrs without converting
            matchStage.category = new mongoose.Types.ObjectId(category);
        }
        if (location) {
            // Convert location to ObjectId
            matchStage.location = new mongoose.Types.ObjectId(location);
        }

        pipeline.push({ $match: matchStage });
    }


    // Add $project stage to the pipeline

    //the key $project refers to the stage type, and the value { } describes its parameters
    /*When the projection document contains keys with 1 as their values, it describes the list of fields that will be included in the result. 
    If, on the other hand, projection keys are set to 0, 
    the projection document describes the list of fields that will be excluded from the result. */
    pipeline.push({
        $project: {
            name: 1,
            description: 1,
            category: 1,
            location: 1,
            imageUrl: 1,
            createdAt: 1,
            membersCount: { $size: "$members" }
        }
    });

    // Add $sort stage to the pipeline
    pipeline.push({ $sort: { "createdAt": -1 } });

    //_id се включва автоматично; get members count but not the actual members' ids in the home page
    // Execute the aggregation pipeline
    const groups = Group.aggregate(pipeline);

    return groups;
}

//findById is a Mongoose method - we use it instead monogodb's findOne()
exports.getById = async (groupId) => {
    let group;

    //оптимизация -> не се правят заявки с невалидни objectId,
    //а директно се хвърля грешка
    if (mongoose.Types.ObjectId.isValid(groupId)) {
        group = await Group
            .findById(groupId)
            .populate({
                path: 'category',
                select: '-_id'
            })
            .populate({
                path: 'location',
                select: '-_id'
            })
            .lean();
    } else {
        throw new Error('Групата не съществува!');
    }

    //валиден стринг objectId, но несъществуващ
    if (!group) {
        throw new Error('Групата не съществува!');
    };

    return group;

}
// exports.getByIdWithEvents = (groupId) => this.getById(groupId).populate('events'); (child referencing approach)

exports.create = async (name, category, location, description, imageUrl, members, currUser) => {

    //check for invalid category and location object ids
    await validateCategoryAndLocation(category, location);

    //check for invalid format of members array
    members = await validateAddedOtherMembers(members);

    //add owner of the group to members with additional data 
    //if members.push() is used admin is added to the end of the array
    //искаме винаги админа да се запазва на 0-ва позиция в масива, с members за да се извежда
    //на първо място при листването на всички членове на дадена група

    //case 1: потребителят който създава групата е добавил други членове при нейното създаване и трябва да го добавим отпред - unshift() (mutator function)
    //модифицира се директно members - не се създава нова референция

    //case 2: потребителят който създава групата не е добавил други членове при нейното създаване
    //сигурно е че currUser е валиден, понеже се взима от req.user, закачен в authenticationMiddleware.js
    if (members.length > 0) {
        members.unshift(currUser);

    } else {
        members.push(currUser);
    }


    //check for duplicate users after adding the creator of the group
    checkForDuplicateUsers(members.map(member => member._id));

    if (imageUrl) {
        //if user uploaded a pic we upload it to cloudinary
        imageUrl = await uploadToCloudinary(imageUrl, GROUP_PICS_FOLDER);
    }


    //createdAt, editedAt...
    //TODO: add validation

    const newGroupData = {
        name,
        category,
        location,
        description,
        imageUrl,
        groupAdmin: currUser._id,
        members
    };

    //TODO: Transaction
    const newGroup = await Group.create(newGroupData);

    //Update users who are members to the newly created group - add it to their group field
    //if no users are added upon creation only user who is group admin will be updated
    await User.updateMany(
        { _id: { $in: members.map(member => member._id) } },
        { $push: { groups: newGroup._id } }
    );


    return newGroup;
}

exports.update = (groupId, name, category, location, description, members, imageUrl) => {
    //TODO: add validation
    const newGroupData = {
        name,
        category,
        location,
        description,
        members,
        imageUrl
    };

    const updatedGroup = Group.findByIdAndUpdate(groupId, newGroupData);
    return updatedGroup;
}

//TODO
exports.delete = (groupId) => Group.findByIdAndDelete(groupId);


//JOIN GROUP / ADD ANOTHER MEMBER TO A GROUP
exports.addMember = async (groupId, userIdToAdd, currUserId) => {
    if (!mongoose.Types.ObjectId.isValid(userIdToAdd) || !mongoose.Types.ObjectId.isValid(groupId)) {
        throw new Error('Неуспешно добавяне на член!');
    }

    // find this user in the database
    const userToAdd = await User.findById(userIdToAdd).select('firstName lastName email profilePic groups');

    if (!userToAdd) {
        const error = new Error('Не съществува такъв потребител!');
        error.statusCode = 404;
        throw error;
    }

    // if member exist, check if member is already in the group
    //find group in the db
    const group = await Group.findById(groupId);

    //check if group exists
    if (!group) {
        const error = new Error('Не съществува такава група!');
        error.statusCode = 404;
        throw error;
    }

    //опит за добавяне на друг потребител - изисква се текущия потребител да бъде член на групата
    if (userIdToAdd !== currUserId) {
        const currUserIsMember = group.members.find(member => member._id.toString() === currUserId);

        if (!currUserIsMember) {
            const error = new Error('За да добавите друг потребител първо трябва да те член на групата!');
            error.statusCode = 403;
            throw error;
        }

    }

    //if group exists check if the member is in the group already
    // check if the user is already a member of the group
    //toString() is needed, because group is a Mongoose document, not js object so _id is of type ObjectId and not string
    const memberExist = group.members.find(member => member._id.toString() === userIdToAdd);

    if (memberExist) {
        const error = new Error('Потребителят вече е член на тази група!');
        error.statusCode = 400;
        throw error;
    }

    //TODO transaction

    //if the useToAdd is not a member of a group:
    //add member to the group with additional data

    group.members.push({
        _id: userIdToAdd,
        fullName: userToAdd.fullName,
        email: userToAdd.email,
        profilePic: userToAdd.profilePic
    });

    //add group to the user group array
    userToAdd.groups.push(groupId);

    await group.save();
    await userToAdd.save();

}

//LEAVE A GROUP
//REMOVE ANOTHER MEMBER FROM A GROUP - само администратора на групата може да премахва потребители от групата
exports.removeMember = async (groupId, userIdToRemove, currUserId) => {

    if (!mongoose.Types.ObjectId.isValid(userIdToRemove) || !mongoose.Types.ObjectId.isValid(groupId)) {
        throw new Error('Неуспешно премахване на член!');
    }

    // find this user in the database
    const userToRemove = await User.findById(userIdToRemove).select('firstName lastName email profilePic groups');

    if (!userToRemove) {
        const error = new Error('Не съществува такъв потребител!');
        error.statusCode = 404;
        throw error;
    }

    // if member exist, check if member is a member of the group - required for him to leave!
    //find group in the db
    const group = await Group.findById(groupId);

    //check if group exists
    if (!group) {
        const error = new Error('Не съществува такава група!');
        error.statusCode = 404;
        throw error;
    }

    const isCurrUserGroupAdmin = group.groupAdmin.toString() === currUserId;

    //опит за премахване на друг потребител
    if (userIdToRemove !== currUserId && !isCurrUserGroupAdmin) {
        //is current user admin of the group - само той може да премахва други потребители
        //и сме сигурни, че той е член на групата - няма нужда да се проверява

        const error = new Error('Само администраторът на групата може да премахва нейни членове!');
        error.statusCode = 403;
        throw error;
    }

    //ако текущия потребител е админ и иска да напусне (премахва себе си) - да се осигури нов админ
    //сигурни сме че той е член на групата
    if (userIdToRemove === currUserId && isCurrUserGroupAdmin) {
        //case - ако няма други членове освен админа, той да не може да напусне
        if (group.members.length === 1) {
            const error = new Error('Поради липсата на други членове, не може да се назначи нов администратор, не можете да напуснете!');
            error.statusCode = 400;
            throw error;
        }

        group.groupAdmin = group.members[1];


    } else {

        //проверка : потребител иска да напусне, но не е член ( userIdToRemove === currUserId)
        //         : потребител иска да премахне член който не е в групата (userIdToRemove !== curUserId и isCurrUserGroupAdmin = true)

        //if group exists check if the member is in the group
        // check if the user is a member of the group
        //toString() is needed, because group is a Mongoose document, not js object so _id is of type ObjectId and not string
        const memberExist = group.members.find(member => member._id.toString() === userIdToRemove);

        if (!memberExist) {
            const error = new Error('Потребителят не е член на тази група, за да бъде премахнат!');
            error.statusCode = 400;
            throw error;
        }
    }

    //TODO transaction

    // if user is a member, remove group id from the groups array
    const newGroups = userToRemove.groups.filter(currGroupId => currGroupId.toString() !== groupId);
    userToRemove.groups = newGroups;


    // remove user from member array on the group
    const newMembers = group.members.filter((member) => member._id.toString() !== userIdToRemove);
    group.members = newMembers;

    await group.save();
    await userToRemove.save();

}