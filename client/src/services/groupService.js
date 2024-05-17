const baseUrl = 'http://localhost:5000';


export const getAll = async () => {
    const response = await fetch(baseUrl)

    const result = await response.json();

    return result;
}

export const getById = async (groupId) => {
    const response = await fetch(`${baseUrl}/groups/${groupId}/details`);
    const result = await response.json();

    return result;
}