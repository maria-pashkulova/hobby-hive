const baseUrl = 'http://localhost:5000';


export const getAll = async () => {
    const response = await fetch(baseUrl)

    const result = await response.json();

    return result;
}

export const getById = async (gameId) => {
    const response = await fetch(`${baseUrl}/groups/${gameId}/details`);
    const result = await response.json();

    return result;
}