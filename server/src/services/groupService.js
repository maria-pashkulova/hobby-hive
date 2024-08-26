const Group = require('../models/Group');
const User = require('../models/User');
const mongoose = require('mongoose');
const escapeRegExp = require('../utils/escapeRegExp');


const GROUP_PICS_FOLDER = 'group-pics';
const { uploadToCloudinary, destroyFromCloudinary } = require('../utils/cloudinaryUtils');

const { validateAddedOtherMembers, checkForDuplicateUsers, checkForDuplicateTags, checkForExistingTags, validateCategoryAndLocation } = require('../utils/validateGroupData');


exports.getAll = async (name, category, location, page, limit) => {

    const skip = page * limit;
    const matchStage = {};

    // Initialize the aggregation pipeline array
    const pipeline = [];

    // Add $match stage to the pipeline if name, category or location are provided
    if (name || category || location) {

        if (name) {
            const escapedName = escapeRegExp(name);
            matchStage.name = { $regex: escapedName, $options: 'i' } //case-insensitive search
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

    // Add $sort stage to the pipeline -  before $skip and $limit!
    pipeline.push({ $sort: { "createdAt": -1 } });

    //Add $skip and $limit stages to the pipeline for pagination
    pipeline.push({ $skip: skip });
    pipeline.push({ $limit: limit })


    // Add $project stage to the pipeline

    //the key $project refers to the stage type, and the value { } describes its parameters
    /*When the projection document contains keys with 1 as their values, it describes the list of fields that will be included in the result. 
    If, on the other hand, projection keys are set to 0, 
    the projection document describes the list of fields that will be excluded from the result. */
    pipeline.push({
        $project: {
            name: 1,
            description: 1,
            imageUrl: 1,
            createdAt: 1,
            membersCount: { $size: "$members" }
        }
    });


    // Execute the aggregation pipeline
    //get members count but not the actual members' ids in the home page

    const groups = await Group.aggregate(pipeline);

    //If filter is applied - total count of groups matching the filter
    //If no filter is applied - total count of groups in the Group model
    const total = await Group.countDocuments(matchStage);
    const totalPages = Math.ceil(total / limit)

    return { groups, totalPages };
}

//findById is a Mongoose method - we use it instead monogodb's findOne()
exports.getById = async (groupId) => {

    //groupId is valid - checked in groupMiddleware
    const group = await Group
        .findById(groupId)
        .populate('category')
        .populate('location')
        .lean();

    return group;

}

//used in groupMiddleware only
exports.getByIdToValidate = (groupId) => {
    const group = Group
        .findById(groupId)
        .select('_id members._id groupAdmin')
        .lean();

    return group;
}

exports.create = async (name, category, location, description, imageUrl, members, activityTags, currUser) => {

    //check for invalid category and location object ids
    await validateCategoryAndLocation(category, location);

    //check if activityTags are unique
    checkForDuplicateTags(activityTags);

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

    const newGroupData = {
        name,
        category,
        location,
        description,
        imageUrl,
        groupAdmin: currUser._id,
        members,
        activityTags
    };

    //TODO: Transaction
    const newGroup = await Group.create(newGroupData);

    //Update users who are members to the newly created group - add it to their group field
    //if no users are added upon creation only user who is group admin will be updated
    await User.updateMany(
        { _id: { $in: members.map(member => member._id) } },
        { $push: { groups: newGroup._id } }
    );


    const newGroupWithSelectedFields = {
        _id: newGroup._id,
        name: newGroup.name,
        description: newGroup.description,
        imageUrl: newGroup.imageUrl,
        createdAt: newGroup.createdAt,
        membersCount: newGroup.members.length
    }


    return newGroupWithSelectedFields;
}

exports.update = async (groupIdToUpdate, isCurrUserGroupAdmin, name, category, location, description, addedActivityTags, newImg, currImg) => {

    //groupIdToEdit is valid - checked in groupMiddleware
    //currUserId is valid and existing user (checked in authMiddleware!)

    const group = await Group.findById(groupIdToUpdate).select('name category location description imageUrl activityTags groupAdmin')

    //2. Check if current user is group admin

    if (!isCurrUserGroupAdmin) {
        const error = new Error('Само администраторът на групата може да редактира нейните детайли!');
        error.statusCode = 403;
        throw error;
    }

    //3. Check for invalid category and location object ids
    await validateCategoryAndLocation(category, location);

    //4. Check if addedActivityTags are unique (client input itself)
    checkForDuplicateTags(addedActivityTags);

    //5. Check if addedActivityTags includes values that already exist in group's activity tags in db
    const existingTags = group.activityTags;

    if (checkForExistingTags(existingTags, addedActivityTags)) {
        const error = new Error('Добавени са тагове, които вече същестествуват за тази група!');
        error.statusCode = 400;
        throw error;
    }

    //6. Checks for updated group picture
    //'' for groups with no image
    // secure_url for cloudinary

    let groupImage = group.imageUrl;

    // Case 1: Group initially without image, user uploads a new image
    if (!group.imageUrl && newImg) {
        groupImage = await uploadToCloudinary(newImg, GROUP_PICS_FOLDER);
    } else if (group.imageUrl && newImg && !currImg) {
        //Case 2: Group has an image, user uploads a new one

        //destroy current image from cloudinary
        await destroyFromCloudinary(group.imageUrl, GROUP_PICS_FOLDER);

        //user has uploaded new image - he wants to change the current picture
        groupImage = await uploadToCloudinary(newImg, GROUP_PICS_FOLDER);
    } else if (group.imageUrl && !newImg && !currImg) {
        // Case 3: Group has an image, user wants to remove it

        //destroy current image from cloudinary
        await destroyFromCloudinary(group.imageUrl, GROUP_PICS_FOLDER);

        groupImage = '';
    }

    //Case 4 : no group picture initially, no new image uploaded -> groupImage stays ''
    //or :initial group picture + no picture change

    //Update group with new details fields
    //Checks to prevent unnecessary assignments
    if (group.name !== name) {
        group.name = name;
    }
    if (group.category.toString() !== category) {
        group.category = category;
    }
    if (group.location.toString() !== location) {
        group.location = location;
    }
    if (group.description !== description) {
        group.description = description;
    }
    if (group.imageUrl !== groupImage) {
        group.imageUrl = groupImage;
    }

    group.activityTags = [...existingTags, ...addedActivityTags];

    // Save the group only if there are modifications - optimization for DB
    if (group.isModified()) {
        await group.save();
    }

    //Populate the updated group document for appropriate updatedGroup format for local state update
    const populatedGroup = await Group.findById(group._id)
        .select('name category location description imageUrl activityTags groupAdmin')
        .populate('category')
        .populate('location')
        .lean();

    return populatedGroup;
}


//JOIN GROUP / ADD ANOTHER MEMBER TO A GROUP
exports.addMember = async (groupId, userIdToAdd, currUserId) => {
    if (!mongoose.Types.ObjectId.isValid(userIdToAdd)) {
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
    //groupId is valid - checked in groupMiddleware

    const group = await Group.findById(groupId);

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
exports.removeMember = async (groupId, userIdToRemove, currUserId, isCurrUserGroupAdmin) => {

    if (!mongoose.Types.ObjectId.isValid(userIdToRemove)) {
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
    //groupId - checked in groupMiddleware
    //TODO: select only needed fields for optimized DB query
    const group = await Group.findById(groupId);

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