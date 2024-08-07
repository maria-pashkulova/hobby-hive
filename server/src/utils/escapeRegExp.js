function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& -> the whole matched string
}

module.exports = escapeRegExp;