const User = require('../models/User');
const Category = require('../models/Category');
const Location = require('../models/Location');

const mongoose = require('mongoose');


exports.validateAddedOtherMembers = async (members) => {

    //console.log(members);
    //1. check if members is an array
    if (!Array.isArray(members)) {
        throw new Error('Невалиден формат на членовете за добавяне')
    }

    //ако е празен масив (тоест човека не е добавил хора при създаване на групата) да си минава и да не продължава надолу
    if (members.length === 0) {
        return [];
    }

    //2. check if members' elements are valid objects as we expect it
    //check only for valid _id key with valid ObjectId because we will replace other user data from the db
    members.forEach(member => {
        const isIdInvalid = !member._id || !mongoose.Types.ObjectId.isValid(member._id); //required field with valid MongoDB format for ObjectId

        if (isIdInvalid) {
            throw new Error('Невалиден потребител');
        }
    })

    const memberIds = members.map(member => member._id);

    //3. Check if all member IDs exist in the database; 
    //only _id field of each user is retreived!
    //cannot use lean() because of the virtual property fullName
    const existingUsers = await User
        .find({ '_id': { $in: memberIds } })
        .select('firstName lastName email profilePic')

    //1н.
    // const existingUserIds = existingUsers.map(user => user._id.toString());
    // const hasNonExistingMembers = memberIds.some(memberToAddId => !existingUserIds.includes(memberToAddId));
    // if (hasNonExistingMembers) {
    //     throw new Error('Не можете да добавите несъществуващ потребител към група');
    // }

    //2н.
    if (existingUsers.length !== memberIds.length) {
        throw new Error('Не можете да добавите несъществуващ потребител към група');
    }


    //4. check if user data is accurate
    //Associative array needed - Map() or Object are possible solutions

    //Create a map of existing users for quick lookup
    const userMap = new Map(existingUsers.map(user => [user._id.toString(), user]));

    //Replace members' data with actual data from the database
    const validatedMembers = members.map(member => {
        const user = userMap.get(member._id);
        return {
            _id: user._id.toString(),
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic
        }
    })

    return validatedMembers;
}

//Check for duplicate users
exports.checkForDuplicateUsers = (memberIds) => {
    const uniqueMembersIds = new Set(memberIds);

    if (uniqueMembersIds.size !== memberIds.length) {
        throw new Error('Не можете да добавите потребител повече от веднъж в група')
    }
}

//Check for valid group category and location
exports.validateCategoryAndLocation = async (category, location) => {

    //so we can use it in getAll for filtering functionality
    if (category === '' && location === '') {
        return true;
    }

    //check for invalid category and location object ids
    let foundCategory;
    let foundLocation;

    if (category) {
        if (!mongoose.Types.ObjectId.isValid(category)) {
            throw new Error('Невалидна категория');
        }

        //find category in the db; select only _id field without name;lean for optimization
        foundCategory = await Category.findById(category).select('_id').lean();
        if (!foundCategory) {
            throw new Error('Несъществуваща категория');
        }
    }

    if (location) {
        if (!mongoose.Types.ObjectId.isValid(location)) {
            throw new Error('Невалидна локация');
        }

        //find location in the db; select only _id field without name; lean for optimization;
        foundLocation = await Location.findById(location).select('_id').lean();
        if (!foundLocation) {
            throw new Error('Несъществуваща локация');
        }
    }


    return {
        foundCategory,
        foundLocation
    };

}