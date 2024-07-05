exports.validateEventTags = (groupTags, eventTags) => {

    return eventTags.every((tag) => {
        return groupTags.includes(tag);
    });
}