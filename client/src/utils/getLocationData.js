export const getLocationData = (location) => {
    const address = location.address;
    const parts = [
        location.name,
        address.road ? `${address.road} ${address.house_number || ''}`.trim() : '',
        address.suburb,
        address.borough,
        address.county
    ]

    // Filter out any undefined parts or '' (address road) (missing from Openstreet map returned location)
    const filteredParts = parts.filter(part => part);

    // Join the remaining parts with commas
    return filteredParts.join(', ');

}
