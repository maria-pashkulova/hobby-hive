// exports.create = (groupData)
const groups = [{
    id: "1",
    name: "Swimming group",
    category: "sport",
    location: "Plovdiv",
    imageUrl: 'https://d1s9j44aio5gjs.cloudfront.net/2016/07/The_Benefits_of_Swimming.jpg',
    description: "Description here"
},

{
    id: "2",
    name: "Painting",
    category: "Art",
    location: "Sofia",
    imageUrl: 'https://reviewed-com-res.cloudinary.com/image/fetch/s--UJ2sGByA--/b_white,c_limit,cs_srgb,f_auto,fl_progressive.strip_profile,g_center,q_auto,w_972/https://reviewed-production.s3.amazonaws.com/1597356287543/GettyImages-1171084311.jpg',
    description: "Description here"
},
];


exports.getAll = (name, category, location) => {
    let result = groups.slice();

    if (name) {
        result = result.filter(group => group.name.toLowerCase().includes(name.toLowerCase()));
    }
    if (category) {
        result = result.filter(group => group.category === category);
    }
    if (location) {
        result = result.filter(group => group.location === location);
    }

    return result;
}

exports.getById = (groupId) => groups.find(group => group.id == groupId);

exports.create = (name, category, location, description, imageUrl) => {
    //createdAt, editedAt...
    const newGroup = {
        id: groups.length + 1,
        name,
        category,
        location,
        description,
        imageUrl
    };

    groups.push(newGroup);

    return newGroup;
}