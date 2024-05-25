const baseUrl = 'http://localhost:5000';


export const getAll = async () => {

    const response = await fetch(baseUrl, { credentials: 'include' });

    //Опит за заявка ако не сме се логнали
    //type:cors?? -> получавам грешки в конзолата??
    //console.log(response);
    if (response.status == 401) {
        throw new Error('Unathenticated');
    }
    const result = await response.json();

    return result;
}

export const getById = async (groupId) => {
    const response = await fetch(`${baseUrl}/groups/${groupId}`, { credentials: 'include' });

    //Опит за заявка ако не сме се логнали
    //type:cors?? -> получавам грешки в конзолата??
    //console.log(response);
    if (response.status == 401) {
        throw new Error('Unathenticated');
    }
    const result = await response.json();

    return result;
}