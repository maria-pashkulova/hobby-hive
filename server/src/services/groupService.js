const Group = require('../models/Group')


//Array storage
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


exports.getAll = async (name, category, location) => {

    //Search functionality with array storage (in-memory)
    // let result = groups.slice();

    // if (name) {
    //     result = result.filter(group => group.name.toLowerCase().includes(name.toLowerCase()));
    // }
    // if (category) {
    //     result = result.filter(group => group.category === category);
    // }
    // if (location) {
    //     result = result.filter(group => group.location === location);
    // }

    const groups = await Group.find();

    return groups;
}

exports.getById = (groupId) => groups.find(group => group.id == groupId);

exports.create = async (name, category, location, description, imageUrl) => {
    //createdAt, editedAt...
    const newGroupData = {
        name,
        category,
        location,
        description,
        imageUrl
    };

    // groups.push(newGroup);


    const newGroup = await Group.create(newGroupData);
    console.log(newGroup);

    return newGroup;



}