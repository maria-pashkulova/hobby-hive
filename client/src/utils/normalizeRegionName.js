const regionNameMapping = {
    'София-град': 'София',
    'Софийска': 'София'
}

const normalizeRegionName = (regionName) => {
    return regionNameMapping[regionName] || regionName;
}

export default normalizeRegionName;