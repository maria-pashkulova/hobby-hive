const Group = require('../models/Group')


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

    let groups = await Group.find();

    //TODO: use mongoose to filter in the db
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
exports.getById = (groupId) => Group.findById(groupId);
exports.getByIdWithEvents = (groupId) => this.getById(groupId).populate('events');

exports.create = (name, category, location, description, members, imageUrl) => {
    //createdAt, editedAt...
    //TODO: add validation
    const newGroupData = {
        name,
        category,
        location,
        description,
        members,
        imageUrl
    };

    // groups.push(newGroup);


    const newGroup = Group.create(newGroupData);
    console.log(newGroup);

    return newGroup;
}

exports.attachEventToGroup = (groupId, eventId) => {
    return Group.findByIdAndUpdate(groupId, { $push: { events: eventId } });
}