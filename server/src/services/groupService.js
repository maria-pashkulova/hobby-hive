const Group = require('../models/Group');
const User = require('../models/User');


//In-memory storage
// const groups = [{
//     id: "1",
//     name: "Swimming group",
//     category: "sport",
//     location: "Plovdiv",
//     imageUrl: 'https://d1s9j44aio5gjs.cloudfront.net/2016/07/The_Benefits_of_Swimming.jpg',
//     description: "Description here"
// },

// {
//     id: "2",
//     name: "Painting",
//     category: "Art",
//     location: "Sofia",
//     imageUrl: 'https://reviewed-com-res.cloudinary.com/image/fetch/s--UJ2sGByA--/b_white,c_limit,cs_srgb,f_auto,fl_progressive.strip_profile,g_center,q_auto,w_972/https://reviewed-production.s3.amazonaws.com/1597356287543/GettyImages-1171084311.jpg',
//     description: "Description here"
// },
// ];


//ако една функция просто ще взима и връща promise, няма нужда да
//awaitваме, защото на ниво контролер ще я awaitваме пак


exports.getAll = async (name, category, location) => {

    //Search functionality with array storage (in-memory)
    // let result = groups.slice();

    // let groups = await Group.find().lean();

    //_id се включва автоматично; get members count but not the actual members' ids in the home page
    let groups = await Group.aggregate([{

        //the key $project refers to the stage type, and the value { } describes its parameters
        /*When the projection document contains keys with 1 as their values, it describes the list of fields that will be included in the result. 
        If, on the other hand, projection keys are set to 0, 
        the projection document describes the list of fields that will be excluded from the result. */

        $project: {
            name: 1,
            description: 1,
            category: 1,
            location: 1,
            imageUrl: 1,
            groupAdmin: 1,
            membersCount: { $size: "$members" }
        }
    }]);

    // console.log(groups);

    //TODO: use mongoose to filter in the db -> $or mongodb operator
    if (name) {
        groups = groups.filter(group => group.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (category) {
        groups = groups.filter(group => group.category.toLowerCase() === category.toLowerCase());
    }
    if (location) {
        groups = groups.filter(group => group.location === location);
    }

    return groups;
}

//findById is a Mongoose method - we use it instead monogodb's findOne()
exports.getById = async (groupId) => {
    const group = await Group.findById(groupId).lean();

    //валиден стринг objectId, но несъществуващ
    if (!group) {
        throw new Error('Group not found');
    };

    return group;

}
// exports.getByIdWithEvents = (groupId) => this.getById(groupId).populate('events'); (child referencing approach)

exports.create = async (name, category, location, description, imageUrl, currUserId) => {
    //createdAt, editedAt...
    //TODO: add validation
    const newGroupData = {
        name,
        category,
        location,
        description,
        imageUrl,
        groupAdmin: currUserId,
        members: [currUserId]
    };

    const newGroup = await Group.create(newGroupData);

    const currUser = await User.findById(currUserId);

    currUser.groups.push(newGroup._id);
    await currUser.save();

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

exports.delete = (groupId) => Group.findByIdAndDelete(groupId);

exports.joinGroup = async (groupId, currUserId) => {

    //find user who wants to join a group in the db
    const currUser = await User.findById(currUserId);

    //find group in the db
    const group = await Group.findById(groupId);

    //check if group still exists
    if (!group) {
        const error = new Error('Group not found');
        error.statusCode = 404;
        throw error;
    }

    // check if the user is already a member of the group
    const memberExist = group.members.find(memberId => memberId.toString() === currUserId);

    if (memberExist) {
        const error = new Error('You are already a member of this group');
        error.statusCode = 400;
        throw error;
    }

    //if the current user is not a member of a group:
    //add member to the group
    group.members.push(currUserId)

    //add group to the user group array
    currUser.groups.push(groupId);

    await group.save();
    await currUser.save();
}

//postman request - (child referencing approach)
// exports.attachEventToGroup = (groupId, eventId) => {
//     return Group.findByIdAndUpdate(groupId, { $push: { events: eventId } });
// }