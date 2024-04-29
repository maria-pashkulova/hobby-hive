// exports.create = (groupData)
const groups = [{
    id: "1",
    name: "Swimming group",
    category: "sport",
    location: "Plovdiv",
    description: "Description here"
},

{
    id: "2",
    name: "Painting",
    category: "Art",
    location: "Sofia",
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

exports.create = (name, location, description) => {
    //createdAt, editedAt...
    const newGroup = {
        id: groups.length + 1,
        name,
        location,
        description
    };

    groups.push(newGroup);

    return newGroup;
}